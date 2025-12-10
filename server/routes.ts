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
        
        user = await storage.createUser({
          clerkId: req.auth!.userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || null,
          roles: isFirstUser ? ["administrador"] : ["consultor"],
          groupId: null,
        });
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
        user = await storage.createUser({
          clerkId: req.auth!.userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || null,
          roles: ["consultor"],
          groupId: null,
        });
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

  const httpServer = createServer(app);
  return httpServer;
}
