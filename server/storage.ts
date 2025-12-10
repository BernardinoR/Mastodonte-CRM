import { type User, type InsertUser, type Group, type InsertGroup, type UserRole, users, groups } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByClerkId(clerkId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUsersByGroupId(groupId: number): Promise<User[]>;
  
  getGroup(id: number): Promise<Group | undefined>;
  createGroup(group: InsertGroup): Promise<Group>;
  updateGroup(id: number, updates: Partial<InsertGroup>): Promise<Group | undefined>;
  deleteGroup(id: number): Promise<boolean>;
  getAllGroups(): Promise<Group[]>;
}

export class DbStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByClerkId(clerkId: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.clerkId, clerkId));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values({
      clerkId: insertUser.clerkId,
      email: insertUser.email,
      name: insertUser.name ?? null,
      roles: insertUser.roles ?? ["consultor"],
      groupId: insertUser.groupId ?? null,
      isActive: insertUser.isActive ?? true,
    }).returning();
    return result[0];
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async getUsersByGroupId(groupId: number): Promise<User[]> {
    return db.select().from(users).where(eq(users.groupId, groupId));
  }

  async getGroup(id: number): Promise<Group | undefined> {
    const result = await db.select().from(groups).where(eq(groups.id, id));
    return result[0];
  }

  async createGroup(insertGroup: InsertGroup): Promise<Group> {
    const result = await db.insert(groups).values({
      name: insertGroup.name,
      description: insertGroup.description ?? null,
      logoUrl: insertGroup.logoUrl ?? null,
      isActive: insertGroup.isActive ?? true,
    }).returning();
    return result[0];
  }

  async updateGroup(id: number, updates: Partial<InsertGroup>): Promise<Group | undefined> {
    const result = await db.update(groups).set(updates).where(eq(groups.id, id)).returning();
    return result[0];
  }

  async deleteGroup(id: number): Promise<boolean> {
    const result = await db.delete(groups).where(eq(groups.id, id)).returning();
    return result.length > 0;
  }

  async getAllGroups(): Promise<Group[]> {
    return db.select().from(groups);
  }
}

export const storage = new DbStorage();
