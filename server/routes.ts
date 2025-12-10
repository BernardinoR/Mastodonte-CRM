import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { clerkAuthMiddleware, requireAdmin } from "./auth";
import { createClerkClient } from "@clerk/clerk-sdk-node";
import { insertGroupSchema, insertUserSchema, type UserRole } from "@shared/schema";

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

  // Get group members (only for users in that group or admins)
  app.get("/api/groups/:id/members", clerkAuthMiddleware, async (req, res) => {
    try {
      const groupId = parseInt(req.params.id, 10);
      if (isNaN(groupId)) {
        return res.status(400).json({ error: "Invalid group ID" });
      }
      
      // Authorization check: user must belong to this group or be admin
      const currentUser = await storage.getUserByClerkId(req.auth!.userId);
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
      const user = await storage.getUserByClerkId(req.auth!.userId);
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
        redirectUrl: `${process.env.REPLIT_DOMAINS?.split(",")[0] ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}` : "http://localhost:5000"}/`,
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
      
      // Handle Clerk-specific errors
      if (error?.errors?.[0]?.code === "form_identifier_exists") {
        return res.status(400).json({ error: "Este email já possui uma conta ou convite pendente" });
      }
      
      return res.status(500).json({ error: "Falha ao enviar convite" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
