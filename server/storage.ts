import { prisma } from "./db";
import type { User, Conta, Institution } from "@prisma/client";
import type { UserRole } from "@shared/types";

export type ContaWithInstitution = Conta & { institution: Institution };

export type InsertConta = {
  clientId: string;
  institutionId: number;
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
  sweepActive?: boolean;
  sweepFrequency?: string | null;
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
  getInstitutions(): Promise<Institution[]>;
  createConta(data: InsertConta): Promise<ContaWithInstitution>;
  getContasByClientId(clientId: string): Promise<ContaWithInstitution[]>;
  getContaById(id: string): Promise<ContaWithInstitution | null>;
  updateConta(id: string, updates: Partial<InsertConta>): Promise<ContaWithInstitution | null>;
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

  async getInstitutions(): Promise<Institution[]> {
    return prisma.institution.findMany({ orderBy: { name: "asc" } });
  }

  async createConta(data: InsertConta): Promise<ContaWithInstitution> {
    return prisma.conta.create({ data, include: { institution: true } });
  }

  async getContasByClientId(clientId: string): Promise<ContaWithInstitution[]> {
    return prisma.conta.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
      include: { institution: true },
    });
  }

  async getContaById(id: string): Promise<ContaWithInstitution | null> {
    return prisma.conta.findUnique({ where: { id }, include: { institution: true } });
  }

  async updateConta(
    id: string,
    updates: Partial<InsertConta>,
  ): Promise<ContaWithInstitution | null> {
    try {
      return await prisma.conta.update({
        where: { id },
        data: updates,
        include: { institution: true },
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
