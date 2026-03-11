import { prisma } from "./db";
import type { User, Conta } from "@prisma/client";
import type { UserRole } from "@shared/types";

export type InsertConta = {
  clientId: string;
  institution: string;
  accountName?: string | null;
  accountNumber?: string | null;
  type?: string;
  startDate: string;
  endDate?: string | null;
  status?: string;
  activeSince?: string | null;
  deactivatedSince?: string | null;
  managerName?: string | null;
  managerEmail?: string | null;
  managerPhone?: string | null;
  whatsappGroupId?: number | null;
  whatsappGroupLinked?: boolean;
};

export type InsertUser = {
  clerkId: string;
  email: string;
  name?: string | null;
  roles?: UserRole[];
  activeRole?: string | null;
  groupId?: number | null;
  isActive?: boolean;
  calendarLink?: string | null;
  firefliesApiKey?: string | null;
};

export interface IStorage {
  getUserByClerkId(clerkId: string): Promise<User | null>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | null>;
  getAllUsers(): Promise<User[]>;
  getUsersByGroupId(groupId: number): Promise<User[]>;
  createConta(data: InsertConta): Promise<Conta>;
  getContasByClientId(clientId: string): Promise<Conta[]>;
  getContaById(id: string): Promise<Conta | null>;
  updateConta(id: string, updates: Partial<InsertConta>): Promise<Conta | null>;
  deleteConta(id: string): Promise<boolean>;
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

  async createConta(data: InsertConta): Promise<Conta> {
    return prisma.conta.create({ data });
  }

  async getContasByClientId(clientId: string): Promise<Conta[]> {
    return prisma.conta.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getContaById(id: string): Promise<Conta | null> {
    return prisma.conta.findUnique({ where: { id } });
  }

  async updateConta(id: string, updates: Partial<InsertConta>): Promise<Conta | null> {
    try {
      return await prisma.conta.update({
        where: { id },
        data: updates,
      });
    } catch {
      return null;
    }
  }

  async deleteConta(id: string): Promise<boolean> {
    try {
      await prisma.conta.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}

export const storage = new DbStorage();
