import { prisma } from "./db";
import type { User } from "@prisma/client";
import type { UserRole } from "@shared/types";

export type InsertUser = {
  clerkId: string;
  email: string;
  name?: string | null;
  roles?: UserRole[];
  groupId?: number | null;
  isActive?: boolean;
  calendarLink?: string | null;
};

export interface IStorage {
  getUserByClerkId(clerkId: string): Promise<User | null>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | null>;
  getAllUsers(): Promise<User[]>;
  getUsersByGroupId(groupId: number): Promise<User[]>;
}

export class DbStorage implements IStorage {
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
}

export const storage = new DbStorage();
