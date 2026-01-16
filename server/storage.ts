import { prisma } from "./db";
import type { User, Group, Client, WhatsAppGroup } from "@prisma/client";
import type { UserRole } from "@shared/types";
import type { Prisma } from "@prisma/client";

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

export type InsertClient = {
  name: string;
  initials?: string | null;
  cpf?: string | null;
  phone?: string | null;
  emails?: string[];
  primaryEmailIndex?: number;
  lastMeeting?: Date | null;
  address?: Prisma.InputJsonValue;
  foundationCode?: string | null;
  clientSince?: Date | null;
  status?: string;
  patrimony?: number | null;
  ownerId?: number | null;
  isActive?: boolean;
};

export type InsertWhatsAppGroup = {
  name: string;
  purpose?: string | null;
  link?: string | null;
  status?: string;
  clientId: string;
};

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | null>;
  getUserByClerkId(clerkId: string): Promise<User | null>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | null>;
  getAllUsers(): Promise<User[]>;
  getUsersByGroupId(groupId: number): Promise<User[]>;
  
  // Group methods
  getGroup(id: number): Promise<Group | null>;
  createGroup(group: InsertGroup): Promise<Group>;
  updateGroup(id: number, updates: Partial<InsertGroup>): Promise<Group | null>;
  deleteGroup(id: number): Promise<boolean>;
  getAllGroups(): Promise<Group[]>;

  // Client methods
  getClient(id: string): Promise<Client | null>;
  getClientWithRelations(id: string): Promise<(Client & { whatsappGroups: WhatsAppGroup[]; owner: User | null }) | null>;
  getClientsByOwnerId(ownerId: number): Promise<Client[]>;
  getAllClients(): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, updates: Partial<InsertClient>): Promise<Client | null>;
  deleteClient(id: string): Promise<boolean>;

  // WhatsAppGroup methods
  getWhatsAppGroup(id: number): Promise<WhatsAppGroup | null>;
  getWhatsAppGroupsByClientId(clientId: string): Promise<WhatsAppGroup[]>;
  createWhatsAppGroup(group: InsertWhatsAppGroup): Promise<WhatsAppGroup>;
  updateWhatsAppGroup(id: number, updates: Partial<Omit<InsertWhatsAppGroup, 'clientId'>>): Promise<WhatsAppGroup | null>;
  deleteWhatsAppGroup(id: number): Promise<boolean>;
}

export class DbStorage implements IStorage {
  // ============================================
  // USER METHODS
  // ============================================
  
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

  // ============================================
  // GROUP METHODS
  // ============================================

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

  // ============================================
  // CLIENT METHODS
  // ============================================

  async getClient(id: string): Promise<Client | null> {
    return prisma.client.findUnique({ where: { id } });
  }

  async getClientWithRelations(id: string): Promise<(Client & { whatsappGroups: WhatsAppGroup[]; owner: User | null }) | null> {
    return prisma.client.findUnique({
      where: { id },
      include: {
        whatsappGroups: true,
        owner: true,
      },
    });
  }

  async getClientsByOwnerId(ownerId: number): Promise<Client[]> {
    return prisma.client.findMany({ 
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllClients(): Promise<Client[]> {
    return prisma.client.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    return prisma.client.create({
      data: {
        name: insertClient.name,
        initials: insertClient.initials ?? null,
        cpf: insertClient.cpf ?? null,
        phone: insertClient.phone ?? null,
        emails: insertClient.emails ?? [],
        primaryEmailIndex: insertClient.primaryEmailIndex ?? 0,
        lastMeeting: insertClient.lastMeeting ?? null,
        address: insertClient.address ?? {},
        foundationCode: insertClient.foundationCode ?? null,
        clientSince: insertClient.clientSince ?? null,
        status: insertClient.status ?? "Ativo",
        patrimony: insertClient.patrimony ?? null,
        ownerId: insertClient.ownerId ?? null,
        isActive: insertClient.isActive ?? true,
      },
    });
  }

  async updateClient(id: string, updates: Partial<InsertClient>): Promise<Client | null> {
    try {
      return await prisma.client.update({
        where: { id },
        data: updates,
      });
    } catch {
      return null;
    }
  }

  async deleteClient(id: string): Promise<boolean> {
    try {
      await prisma.client.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  // ============================================
  // WHATSAPP GROUP METHODS
  // ============================================

  async getWhatsAppGroup(id: number): Promise<WhatsAppGroup | null> {
    return prisma.whatsAppGroup.findUnique({ where: { id } });
  }

  async getWhatsAppGroupsByClientId(clientId: string): Promise<WhatsAppGroup[]> {
    return prisma.whatsAppGroup.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createWhatsAppGroup(insertGroup: InsertWhatsAppGroup): Promise<WhatsAppGroup> {
    return prisma.whatsAppGroup.create({
      data: {
        name: insertGroup.name,
        purpose: insertGroup.purpose ?? null,
        link: insertGroup.link ?? null,
        status: insertGroup.status ?? "Ativo",
        clientId: insertGroup.clientId,
      },
    });
  }

  async updateWhatsAppGroup(id: number, updates: Partial<Omit<InsertWhatsAppGroup, 'clientId'>>): Promise<WhatsAppGroup | null> {
    try {
      return await prisma.whatsAppGroup.update({
        where: { id },
        data: updates,
      });
    } catch {
      return null;
    }
  }

  async deleteWhatsAppGroup(id: number): Promise<boolean> {
    try {
      await prisma.whatsAppGroup.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}

export const storage = new DbStorage();
