import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { clerkAuthMiddleware, requireAdmin } from "./auth";
import { createClerkClient } from "@clerk/clerk-sdk-node";
import type { UserRole } from "@shared/types";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.get("/api/auth/me", clerkAuthMiddleware, async (req, res) => {
    try {
      const clerkUser = await clerkClient.users.getUser(req.auth!.userId);
      
      let user = await storage.getUserByClerkId(req.auth!.userId);
      
      if (!user) {
        const allUsers = await storage.getAllUsers();
        const isFirstUser = allUsers.length === 0;
        
        // Check for invitation metadata (roles and group assigned during invite)
        const publicMetadata = clerkUser.publicMetadata as { 
          pendingRole?: string;  // Legacy single role support
          pendingRoles?: string[];
          pendingGroupId?: number | null;
        } | undefined;
        
        const validRoles: UserRole[] = ["administrador", "consultor", "alocador", "concierge"];
        let assignedRoles: UserRole[] = ["consultor"];
        let assignedGroupId: number | null = null;
        
        // First user always becomes admin
        if (isFirstUser) {
          assignedRoles = ["administrador"];
        } else if (publicMetadata?.pendingRoles && Array.isArray(publicMetadata.pendingRoles)) {
          // Use roles array from invitation if valid
          const validPendingRoles = publicMetadata.pendingRoles.filter(
            (r: string) => validRoles.includes(r as UserRole)
          ) as UserRole[];
          if (validPendingRoles.length > 0) {
            assignedRoles = validPendingRoles;
          }
        } else if (publicMetadata?.pendingRole && validRoles.includes(publicMetadata.pendingRole as UserRole)) {
          // Legacy: single role support
          assignedRoles = [publicMetadata.pendingRole as UserRole];
        }
        
        // Assign group from invitation if specified
        if (publicMetadata?.pendingGroupId && typeof publicMetadata.pendingGroupId === "number") {
          assignedGroupId = publicMetadata.pendingGroupId;
        }
        
        user = await storage.createUser({
          clerkId: req.auth!.userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || null,
          roles: assignedRoles,
          groupId: assignedGroupId,
        });
        
        // Clear the pending invitation metadata after user is created
        if (publicMetadata?.pendingRole || publicMetadata?.pendingRoles || publicMetadata?.pendingGroupId) {
          try {
            await clerkClient.users.updateUser(req.auth!.userId, {
              publicMetadata: { ...publicMetadata, pendingRole: undefined, pendingRoles: undefined, pendingGroupId: undefined },
            });
          } catch (e) {
            console.warn("Failed to clear invitation metadata:", e);
          }
        }
      }
      
      return res.json({ user });
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post("/api/auth/sync", clerkAuthMiddleware, async (req, res) => {
    try {
      const clerkUser = await clerkClient.users.getUser(req.auth!.userId);
      
      let user = await storage.getUserByClerkId(req.auth!.userId);
      
      if (!user) {
        // Check for invitation metadata
        const publicMetadata = clerkUser.publicMetadata as { 
          pendingRole?: string;  // Legacy single role support
          pendingRoles?: string[];
          pendingGroupId?: number | null;
        } | undefined;
        
        const validRoles: UserRole[] = ["administrador", "consultor", "alocador", "concierge"];
        let assignedRoles: UserRole[] = ["consultor"];
        let assignedGroupId: number | null = null;
        
        if (publicMetadata?.pendingRoles && Array.isArray(publicMetadata.pendingRoles)) {
          // Use roles array from invitation if valid
          const validPendingRoles = publicMetadata.pendingRoles.filter(
            (r: string) => validRoles.includes(r as UserRole)
          ) as UserRole[];
          if (validPendingRoles.length > 0) {
            assignedRoles = validPendingRoles;
          }
        } else if (publicMetadata?.pendingRole && validRoles.includes(publicMetadata.pendingRole as UserRole)) {
          // Legacy: single role support
          assignedRoles = [publicMetadata.pendingRole as UserRole];
        }
        
        if (publicMetadata?.pendingGroupId && typeof publicMetadata.pendingGroupId === "number") {
          assignedGroupId = publicMetadata.pendingGroupId;
        }
        
        user = await storage.createUser({
          clerkId: req.auth!.userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || null,
          roles: assignedRoles,
          groupId: assignedGroupId,
        });
        
        // Clear invitation metadata
        if (publicMetadata?.pendingRole || publicMetadata?.pendingRoles || publicMetadata?.pendingGroupId) {
          try {
            await clerkClient.users.updateUser(req.auth!.userId, {
              publicMetadata: { ...publicMetadata, pendingRole: undefined, pendingRoles: undefined, pendingGroupId: undefined },
            });
          } catch (e) {
            console.warn("Failed to clear invitation metadata:", e);
          }
        }
      } else {
        user = await storage.updateUser(user.id, {
          email: clerkUser.emailAddresses[0]?.emailAddress || user.email,
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || user.name,
        });
      }
      
      return res.json({ user });
    } catch (error) {
      console.error("Error syncing user:", error);
      return res.status(500).json({ error: "Failed to sync user" });
    }
  });

  // Get team users (current user + users in same group)
  app.get("/api/users/team", clerkAuthMiddleware, async (req, res) => {
    try {
      const currentUser = req.auth?.user;
      if (!currentUser) {
        return res.status(401).json({ error: "User not found" });
      }

      let teamUsers: typeof currentUser[] = [];
      
      if (currentUser.groupId) {
        // User belongs to a group - get all group members
        teamUsers = await storage.getUsersByGroupId(currentUser.groupId);
      } else {
        // User has no group - return only themselves
        teamUsers = [currentUser];
      }

      // Map to safe response format with initials
      const users = teamUsers.map(user => ({
        id: user.id,
        name: user.name || user.email,
        email: user.email,
        initials: user.name 
          ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
          : user.email.substring(0, 2).toUpperCase(),
        isCurrentUser: user.id === currentUser.id,
      }));

      return res.json({ users, currentUserId: currentUser.id });
    } catch (error) {
      console.error("Error fetching team users:", error);
      return res.status(500).json({ error: "Failed to fetch team users" });
    }
  });

  // Invitation endpoint using Clerk Invitations API
  app.post("/api/invitations", clerkAuthMiddleware, requireAdmin(), async (req, res) => {
    try {
      const { email, roles, groupId } = req.body;
      
      if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "Email is required" });
      }
      
      const validRoles: UserRole[] = ["administrador", "consultor", "alocador", "concierge"];
      
      // Validate roles array
      if (!roles || !Array.isArray(roles) || roles.length === 0) {
        return res.status(400).json({ error: "At least one role is required" });
      }
      
      const invalidRoles = roles.filter((r: string) => !validRoles.includes(r as UserRole));
      if (invalidRoles.length > 0) {
        return res.status(400).json({ error: `Invalid roles: ${invalidRoles.join(", ")}` });
      }
      
      // Store pending invitation data in public metadata (roles as array)
      const publicMetadata = {
        pendingRoles: roles,
        pendingGroupId: groupId || null,
      };
      
      // Create invitation via Clerk
      const invitation = await clerkClient.invitations.createInvitation({
        emailAddress: email,
        publicMetadata,
        redirectUrl: `${process.env.APP_URL || "https://mastodonte-crm-production.up.railway.app"}/`,
      });
      
      return res.status(201).json({ 
        success: true, 
        invitation: {
          id: invitation.id,
          email: invitation.emailAddress,
          status: invitation.status,
        }
      });
    } catch (error: any) {
      console.error("Error creating invitation:", error);
      
      // Extrair mensagem de erro do Clerk
      const clerkError = error?.errors?.[0];
      const clerkMessage = clerkError?.longMessage || clerkError?.message;
      const clerkCode = clerkError?.code;
      
      // Erros conhecidos do Clerk
      if (clerkCode === "form_identifier_exists") {
        return res.status(400).json({ error: "Este email já possui uma conta ou convite pendente" });
      }
      
      // Retornar erro mais informativo
      const errorMessage = clerkMessage || error?.message || "Falha ao enviar convite";
      console.error("Clerk error details:", { code: clerkCode, message: clerkMessage });
      
      return res.status(500).json({ error: errorMessage });
    }
  });

  app.post("/api/validate-foundation", clerkAuthMiddleware, async (req, res) => {
    try {
      const { code } = req.body;
      
      if (!code || typeof code !== "string") {
        return res.status(400).json({ error: "Código Foundation é obrigatório" });
      }
      
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(code)) {
        return res.status(400).json({ error: "Formato de código inválido", valid: false });
      }
      
      const webhookUrl = process.env.N8N_WEBHOOK_URL;
      if (!webhookUrl) {
        console.error("N8N_WEBHOOK_URL not configured");
        return res.status(500).json({ error: "Validação não configurada" });
      }
      
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });
      
      if (!response.ok) {
        console.error("Webhook error:", response.status, response.statusText);
        return res.status(502).json({ error: "Erro ao validar código", valid: false });
      }
      
      const result = await response.json();
      return res.json({ valid: result.valid === true });
    } catch (error) {
      console.error("Error validating foundation code:", error);
      return res.status(500).json({ error: "Erro ao validar código" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
