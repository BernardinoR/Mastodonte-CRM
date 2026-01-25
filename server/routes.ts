import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { clerkAuthMiddleware, requireAdmin } from "./auth";
import { createClerkClient } from "@clerk/clerk-sdk-node";
import { z } from "zod";
import { USER_ROLES, type UserRole } from "@shared/types";

// Validation schemas (replacing drizzle-zod)
const insertGroupSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

const insertUserSchema = z.object({
  clerkId: z.string(),
  email: z.string().email(),
  name: z.string().optional().nullable(),
  roles: z.array(z.enum(USER_ROLES)).optional(),
  groupId: z.number().nullable().optional(),
  isActive: z.boolean().optional(),
});

const addressSchema = z.object({
  street: z.string().optional().default(""),
  complement: z.string().optional().default(""),
  neighborhood: z.string().optional().default(""),
  city: z.string().optional().default(""),
  state: z.string().optional().default(""),
  zipCode: z.string().optional().default(""),
}).optional().nullable();

const insertClientSchema = z.object({
  name: z.string().min(1),
  initials: z.string().optional().nullable(),
  cpf: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  emails: z.array(z.string().email()).optional().default([]),
  primaryEmailIndex: z.number().optional().default(0),
  lastMeeting: z.string().datetime().optional().nullable().transform(val => val ? new Date(val) : null),
  address: addressSchema,
  foundationCode: z.string().optional().nullable(),
  clientSince: z.string().datetime().optional().nullable().transform(val => val ? new Date(val) : null),
  status: z.enum(["Ativo", "Prospect", "Distrato"]).optional().default("Ativo"),
  patrimony: z.number().optional().nullable(),
  ownerId: z.number().optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

const insertWhatsAppGroupSchema = z.object({
  name: z.string().min(1),
  purpose: z.string().optional().nullable(),
  link: z.string().url().optional().nullable(),
  status: z.enum(["Ativo", "Inativo"]).optional().default("Ativo"),
  clientId: z.string().uuid(),
});

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

  app.get("/api/groups", clerkAuthMiddleware, async (req, res) => {
    try {
      const groups = await storage.getAllGroups();
      return res.json({ groups });
    } catch (error) {
      console.error("Error fetching groups:", error);
      return res.status(500).json({ error: "Failed to fetch groups" });
    }
  });

  app.post("/api/groups", clerkAuthMiddleware, requireAdmin(), async (req, res) => {
    try {
      const parsed = insertGroupSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid group data", details: parsed.error });
      }
      
      const group = await storage.createGroup(parsed.data);
      return res.status(201).json({ group });
    } catch (error) {
      console.error("Error creating group:", error);
      return res.status(500).json({ error: "Failed to create group" });
    }
  });

  app.patch("/api/groups/:id", clerkAuthMiddleware, requireAdmin(), async (req, res) => {
    try {
      const groupId = parseInt(req.params.id, 10);
      if (isNaN(groupId)) {
        return res.status(400).json({ error: "Invalid group ID" });
      }
      
      const group = await storage.updateGroup(groupId, req.body);
      if (!group) {
        return res.status(404).json({ error: "Group not found" });
      }
      
      return res.json({ group });
    } catch (error) {
      console.error("Error updating group:", error);
      return res.status(500).json({ error: "Failed to update group" });
    }
  });

  app.delete("/api/groups/:id", clerkAuthMiddleware, requireAdmin(), async (req, res) => {
    try {
      const groupId = parseInt(req.params.id, 10);
      if (isNaN(groupId)) {
        return res.status(400).json({ error: "Invalid group ID" });
      }
      
      const deleted = await storage.deleteGroup(groupId);
      if (!deleted) {
        return res.status(404).json({ error: "Group not found" });
      }
      
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting group:", error);
      return res.status(500).json({ error: "Failed to delete group" });
    }
  });

  app.get("/api/users", clerkAuthMiddleware, requireAdmin(), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      return res.json({ users });
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ error: "Failed to fetch users" });
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

  // Get group members (only for users in that group or admins)
  app.get("/api/groups/:id/members", clerkAuthMiddleware, async (req, res) => {
    try {
      const groupId = parseInt(req.params.id, 10);
      if (isNaN(groupId)) {
        return res.status(400).json({ error: "Invalid group ID" });
      }
      
      // Authorization check: user must belong to this group or be admin
      const currentUser = req.auth?.user;
      if (!currentUser) {
        return res.status(401).json({ error: "User not found" });
      }
      
      const isUserAdmin = currentUser.roles?.includes("administrador");
      const belongsToGroup = currentUser.groupId === groupId;
      
      if (!isUserAdmin && !belongsToGroup) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const group = await storage.getGroup(groupId);
      if (!group) {
        return res.status(404).json({ error: "Group not found" });
      }
      
      const members = await storage.getUsersByGroupId(groupId);
      return res.json({ group, members });
    } catch (error) {
      console.error("Error fetching group members:", error);
      return res.status(500).json({ error: "Failed to fetch group members" });
    }
  });

  // Update current user's own profile (name only - photo managed via Clerk)
  app.patch("/api/auth/profile", clerkAuthMiddleware, async (req, res) => {
    try {
      const user = req.auth?.user;
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const { name } = req.body;
      
      // Validate name
      if (name !== undefined) {
        if (typeof name !== "string") {
          return res.status(400).json({ error: "Invalid name" });
        }
        if (name.trim().length === 0) {
          return res.status(400).json({ error: "Name cannot be empty" });
        }
        if (name.length > 100) {
          return res.status(400).json({ error: "Name too long (max 100 chars)" });
        }
      }
      
      const updates: { name?: string } = {};
      if (name !== undefined) updates.name = name.trim();
      
      const updatedUser = await storage.updateUser(user.id, updates);
      
      return res.json({ user: updatedUser });
    } catch (error) {
      console.error("Error updating profile:", error);
      return res.status(500).json({ error: "Failed to update profile" });
    }
  });

  app.patch("/api/users/:id", clerkAuthMiddleware, requireAdmin(), async (req, res) => {
    try {
      const userId = parseInt(req.params.id, 10);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const { roles, groupId } = req.body;
      
      if (roles !== undefined) {
        if (!Array.isArray(roles) || roles.length === 0) {
          return res.status(400).json({ error: "User must have at least one role" });
        }
        const validRoles = ["administrador", "consultor", "alocador", "concierge"];
        const invalidRoles = roles.filter((r: string) => !validRoles.includes(r));
        if (invalidRoles.length > 0) {
          return res.status(400).json({ error: `Invalid roles: ${invalidRoles.join(", ")}` });
        }
      }
      
      const updates: { roles?: UserRole[]; groupId?: number | null } = {};
      if (roles !== undefined) updates.roles = roles as UserRole[];
      if (groupId !== undefined) updates.groupId = groupId;
      
      const user = await storage.updateUser(userId, updates);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      return res.json({ user });
    } catch (error) {
      console.error("Error updating user:", error);
      return res.status(500).json({ error: "Failed to update user" });
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

  // ============================================
  // CLIENT ROUTES
  // ============================================

  // List all clients (filtered by user access)
  app.get("/api/clients", clerkAuthMiddleware, async (req, res) => {
    try {
      const currentUser = req.auth?.user;
      if (!currentUser) {
        return res.status(401).json({ error: "User not found" });
      }
      
      const clients = await storage.getClientsByUserAccess(currentUser);
      return res.json({ clients });
    } catch (error) {
      console.error("Error fetching clients:", error);
      return res.status(500).json({ error: "Failed to fetch clients" });
    }
  });

  // Get single client by ID (with relations and access check)
  app.get("/api/clients/:id", clerkAuthMiddleware, async (req, res) => {
    try {
      const currentUser = req.auth?.user;
      if (!currentUser) {
        return res.status(401).json({ error: "User not found" });
      }
      
      const clientId = req.params.id;
      
      const client = await storage.getClientWithRelations(clientId);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      
      // Verificar permissão de acesso
      const hasAccess = await storage.checkClientAccess(currentUser, client);
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      return res.json({ client });
    } catch (error) {
      console.error("Error fetching client:", error);
      return res.status(500).json({ error: "Failed to fetch client" });
    }
  });

  // Create new client
  app.post("/api/clients", clerkAuthMiddleware, async (req, res) => {
    try {
      const parsed = insertClientSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid client data", details: parsed.error });
      }

      // Get current user to set as owner
      // Always use the authenticated user as owner, ignoring any ownerId from the request
      const currentUser = req.auth?.user;
      
      // Remove ownerId from parsed data to ensure we always use the authenticated user
      const { ownerId: _, ...clientData } = parsed.data;
      
      const client = await storage.createClient({
        ...clientData,
        address: clientData.address ?? undefined,
        ownerId: currentUser?.id ?? null,
      });
      
      return res.status(201).json({ client });
    } catch (error) {
      console.error("Error creating client:", error);
      return res.status(500).json({ error: "Failed to create client" });
    }
  });

  // Update client (with access check)
  app.patch("/api/clients/:id", clerkAuthMiddleware, async (req, res) => {
    try {
      const currentUser = req.auth?.user;
      if (!currentUser) {
        return res.status(401).json({ error: "User not found" });
      }
      
      const clientId = req.params.id;
      
      // Verificar se cliente existe
      const existingClient = await storage.getClient(clientId);
      if (!existingClient) {
        return res.status(404).json({ error: "Client not found" });
      }
      
      // Verificar permissão de acesso
      const hasAccess = await storage.checkClientAccess(currentUser, existingClient);
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // updateClient retorna null se não encontrar
      const client = await storage.updateClient(clientId, req.body);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      
      return res.json({ client });
    } catch (error) {
      console.error("Error updating client:", error);
      return res.status(500).json({ error: "Failed to update client" });
    }
  });

  // Delete client (with access check)
  app.delete("/api/clients/:id", clerkAuthMiddleware, async (req, res) => {
    try {
      const currentUser = req.auth?.user;
      if (!currentUser) {
        return res.status(401).json({ error: "User not found" });
      }
      
      const clientId = req.params.id;
      
      // Verificar se cliente existe
      const existingClient = await storage.getClient(clientId);
      if (!existingClient) {
        return res.status(404).json({ error: "Client not found" });
      }
      
      // Verificar permissão de acesso
      const hasAccess = await storage.checkClientAccess(currentUser, existingClient);
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const deleted = await storage.deleteClient(clientId);
      if (!deleted) {
        return res.status(404).json({ error: "Client not found" });
      }
      
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting client:", error);
      return res.status(500).json({ error: "Failed to delete client" });
    }
  });

  // ============================================
  // WHATSAPP GROUP ROUTES
  // ============================================

  // List WhatsApp groups for a client
  app.get("/api/clients/:clientId/whatsapp-groups", clerkAuthMiddleware, async (req, res) => {
    try {
      const { clientId } = req.params;
      
      const client = await storage.getClient(clientId);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      
      const groups = await storage.getWhatsAppGroupsByClientId(clientId);
      return res.json({ groups });
    } catch (error) {
      console.error("Error fetching WhatsApp groups:", error);
      return res.status(500).json({ error: "Failed to fetch WhatsApp groups" });
    }
  });

  // Create WhatsApp group for a client
  app.post("/api/clients/:clientId/whatsapp-groups", clerkAuthMiddleware, async (req, res) => {
    try {
      const { clientId } = req.params;
      
      const client = await storage.getClient(clientId);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      
      const parsed = insertWhatsAppGroupSchema.safeParse({ ...req.body, clientId });
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid group data", details: parsed.error });
      }
      
      const group = await storage.createWhatsAppGroup(parsed.data);
      return res.status(201).json({ group });
    } catch (error) {
      console.error("Error creating WhatsApp group:", error);
      return res.status(500).json({ error: "Failed to create WhatsApp group" });
    }
  });

  // Update WhatsApp group
  app.patch("/api/whatsapp-groups/:id", clerkAuthMiddleware, async (req, res) => {
    try {
      const groupId = parseInt(req.params.id, 10);
      if (isNaN(groupId)) {
        return res.status(400).json({ error: "Invalid group ID" });
      }
      
      const group = await storage.updateWhatsAppGroup(groupId, req.body);
      if (!group) {
        return res.status(404).json({ error: "WhatsApp group not found" });
      }
      
      return res.json({ group });
    } catch (error) {
      console.error("Error updating WhatsApp group:", error);
      return res.status(500).json({ error: "Failed to update WhatsApp group" });
    }
  });

  // Delete WhatsApp group
  app.delete("/api/whatsapp-groups/:id", clerkAuthMiddleware, async (req, res) => {
    try {
      const groupId = parseInt(req.params.id, 10);
      if (isNaN(groupId)) {
        return res.status(400).json({ error: "Invalid group ID" });
      }
      
      const deleted = await storage.deleteWhatsAppGroup(groupId);
      if (!deleted) {
        return res.status(404).json({ error: "WhatsApp group not found" });
      }
      
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting WhatsApp group:", error);
      return res.status(500).json({ error: "Failed to delete WhatsApp group" });
    }
  });

  // ============================================
  // TASK ROUTES
  // ============================================

  const insertTaskSchema = z.object({
    title: z.string(), // Allow empty title for inline editing flow
    description: z.string().optional().nullable(),
    priority: z.enum(["Urgente", "Importante", "Normal", "Baixa"]).optional(),
    status: z.enum(["To Do", "In Progress", "Done"]).optional(),
    dueDate: z.string().datetime().optional().nullable().transform(val => val ? new Date(val) : null),
    order: z.number().optional(),
    clientId: z.string().uuid().optional().nullable(),
    meetingId: z.number().optional().nullable(),
    assigneeIds: z.array(z.number()).optional(),
  });

  const insertTaskHistorySchema = z.object({
    type: z.enum(["comment", "email", "call", "whatsapp", "status_change", "assignee_change"]),
    content: z.string().min(1),
  });

  // List all tasks
  app.get("/api/tasks", clerkAuthMiddleware, async (req, res) => {
    try {
      const tasks = await storage.getAllTasks();
      return res.json({ tasks });
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  // Get single task by ID
  app.get("/api/tasks/:id", clerkAuthMiddleware, async (req, res) => {
    try {
      const taskId = req.params.id;
      
      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      
      return res.json({ task });
    } catch (error) {
      console.error("Error fetching task:", error);
      return res.status(500).json({ error: "Failed to fetch task" });
    }
  });

  // Create new task
  app.post("/api/tasks", clerkAuthMiddleware, async (req, res) => {
    try {
      const parsed = insertTaskSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid task data", details: parsed.error });
      }

      // Get current user to set as creator
      const currentUser = req.auth?.user;
      
      const task = await storage.createTask({
        ...parsed.data,
        creatorId: currentUser?.id ?? null,
      });
      
      return res.status(201).json({ task });
    } catch (error) {
      console.error("Error creating task:", error);
      return res.status(500).json({ error: "Failed to create task" });
    }
  });

  // Update task
  app.patch("/api/tasks/:id", clerkAuthMiddleware, async (req, res) => {
    try {
      const taskId = req.params.id;
      
      // updateTask retorna null se não encontrar
      const task = await storage.updateTask(taskId, req.body);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      
      return res.json({ task });
    } catch (error) {
      console.error("Error updating task:", error);
      return res.status(500).json({ error: "Failed to update task" });
    }
  });

  // Delete task
  app.delete("/api/tasks/:id", clerkAuthMiddleware, async (req, res) => {
    try {
      const taskId = req.params.id;
      
      const deleted = await storage.deleteTask(taskId);
      if (!deleted) {
        return res.status(404).json({ error: "Task not found" });
      }
      
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting task:", error);
      return res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // Get tasks by client ID
  app.get("/api/clients/:clientId/tasks", clerkAuthMiddleware, async (req, res) => {
    try {
      const { clientId } = req.params;
      
      const client = await storage.getClient(clientId);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      
      const tasks = await storage.getTasksByClientId(clientId);
      return res.json({ tasks });
    } catch (error) {
      console.error("Error fetching client tasks:", error);
      return res.status(500).json({ error: "Failed to fetch client tasks" });
    }
  });

  // ============================================
  // TASK HISTORY ROUTES
  // ============================================

  // Add history event to task
  app.post("/api/tasks/:id/history", clerkAuthMiddleware, async (req, res) => {
    try {
      const taskId = req.params.id;
      
      const existingTask = await storage.getTask(taskId);
      if (!existingTask) {
        return res.status(404).json({ error: "Task not found" });
      }

      const parsed = insertTaskHistorySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid history data", details: parsed.error });
      }

      // Get current user as author
      const currentUser = req.auth?.user;
      
      const historyEvent = await storage.createTaskHistory({
        taskId,
        type: parsed.data.type,
        content: parsed.data.content,
        authorId: currentUser?.id ?? null,
      });
      
      return res.status(201).json({ historyEvent });
    } catch (error) {
      console.error("Error adding task history:", error);
      return res.status(500).json({ error: "Failed to add task history" });
    }
  });

  // Delete history event from task
  app.delete("/api/tasks/:taskId/history/:eventId", clerkAuthMiddleware, async (req, res) => {
    try {
      const { eventId } = req.params;
      
      const deleted = await storage.deleteTaskHistory(eventId);
      if (!deleted) {
        return res.status(404).json({ error: "History event not found" });
      }
      
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting task history:", error);
      return res.status(500).json({ error: "Failed to delete task history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
