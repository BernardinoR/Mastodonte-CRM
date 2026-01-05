import { Request, Response, NextFunction } from "express";
import { createClerkClient } from "@clerk/clerk-sdk-node";
import { storage } from "./storage";
import type { User } from "@prisma/client";
import type { UserRole } from "@shared/types";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        user?: User;
      };
    }
  }
}

export async function clerkAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    
    const { sub: userId } = await clerkClient.verifyToken(token);
    
    if (!userId) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const user = await storage.getUserByClerkId(userId);
    
    req.auth = {
      userId,
      user,
    };

    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ error: "Authentication failed" });
  }
}

export function requireRole(...requiredRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth?.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const userRoles = req.auth.user.roles || [];
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
}

export function requireAdmin() {
  return requireRole("administrador");
}

export function requireGroupAccess(getGroupId: (req: Request) => number | undefined) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth?.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const userRoles = req.auth.user.roles || [];
    
    if (userRoles.includes("administrador")) {
      return next();
    }

    const targetGroupId = getGroupId(req);
    
    if (targetGroupId === undefined) {
      return res.status(400).json({ error: "Group ID required" });
    }

    if (req.auth.user.groupId !== targetGroupId) {
      return res.status(403).json({ error: "Access denied to this group" });
    }

    next();
  };
}
