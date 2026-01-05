import { prisma } from "./db";
import type { User, Group } from "@prisma/client";
import type { UserRole } from "@shared/types";

// Types for insert operations
export type InsertUser = {
  clerkId: string;
  email: string;
  name?: string | null;
  roles?: UserRole[];
  groupId?: number | null;
  isActive?: boolean;
};

export type InsertGroup = {
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  isActive?: boolean;
};

export interface IStorage {
  getUser(id: number): Promise<User | null>;
  getUserByClerkId(clerkId: string): Promise<User | null>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | null>;
  getAllUsers(): Promise<User[]>;
  getUsersByGroupId(groupId: number): Promise<User[]>;
  
  getGroup(id: number): Promise<Group | null>;
  createGroup(group: InsertGroup): Promise<Group>;
  updateGroup(id: number, updates: Partial<InsertGroup>): Promise<Group | null>;
  deleteGroup(id: number): Promise<boolean>;
  getAllGroups(): Promise<Group[]>;
}

export class DbStorage implements IStorage {
  async getUser(id: number): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async getUserByClerkId(clerkId: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { clerkId } });
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return prisma.user.create({
      data: {
        clerkId: insertUser.clerkId,
        email: insertUser.email,
        name: insertUser.name ?? null,
        roles: insertUser.roles ?? ["consultor"],
        groupId: insertUser.groupId ?? null,
        isActive: insertUser.isActive ?? true,
      },
    });
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | null> {
    try {
      return await prisma.user.update({
        where: { id },
        data: updates,
      });
    } catch {
      return null;
    }
  }

  async getAllUsers(): Promise<User[]> {
    return prisma.user.findMany();
  }

  async getUsersByGroupId(groupId: number): Promise<User[]> {
    return prisma.user.findMany({ where: { groupId } });
  }

  async getGroup(id: number): Promise<Group | null> {
    return prisma.group.findUnique({ where: { id } });
  }

  async createGroup(insertGroup: InsertGroup): Promise<Group> {
    return prisma.group.create({
      data: {
        name: insertGroup.name,
        description: insertGroup.description ?? null,
        logoUrl: insertGroup.logoUrl ?? null,
        isActive: insertGroup.isActive ?? true,
      },
    });
  }

  async updateGroup(id: number, updates: Partial<InsertGroup>): Promise<Group | null> {
    try {
      return await prisma.group.update({
        where: { id },
        data: updates,
      });
    } catch {
      return null;
    }
  }

  async deleteGroup(id: number): Promise<boolean> {
    try {
      await prisma.group.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async getAllGroups(): Promise<Group[]> {
    return prisma.group.findMany();
  }
}

export const storage = new DbStorage();
