import { type User, type InsertUser, type Group, type InsertGroup, type UserRole } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private groups: Map<number, Group>;
  private userIdCounter: number;
  private groupIdCounter: number;

  constructor() {
    this.users = new Map();
    this.groups = new Map();
    this.userIdCounter = 1;
    this.groupIdCounter = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByClerkId(clerkId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.clerkId === clerkId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      id,
      clerkId: insertUser.clerkId,
      email: insertUser.email,
      name: insertUser.name ?? null,
      roles: insertUser.roles ?? ["consultor"],
      groupId: insertUser.groupId ?? null,
      isActive: insertUser.isActive ?? true,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUsersByGroupId(groupId: number): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.groupId === groupId
    );
  }

  async getGroup(id: number): Promise<Group | undefined> {
    return this.groups.get(id);
  }

  async createGroup(insertGroup: InsertGroup): Promise<Group> {
    const id = this.groupIdCounter++;
    const now = new Date();
    const group: Group = { 
      id,
      name: insertGroup.name,
      description: insertGroup.description ?? null,
      logoUrl: insertGroup.logoUrl ?? null,
      isActive: insertGroup.isActive ?? true,
      createdAt: now,
    };
    this.groups.set(id, group);
    return group;
  }

  async updateGroup(id: number, updates: Partial<InsertGroup>): Promise<Group | undefined> {
    const group = this.groups.get(id);
    if (!group) return undefined;
    const updatedGroup = { ...group, ...updates };
    this.groups.set(id, updatedGroup);
    return updatedGroup;
  }

  async deleteGroup(id: number): Promise<boolean> {
    return this.groups.delete(id);
  }

  async getAllGroups(): Promise<Group[]> {
    return Array.from(this.groups.values());
  }
}

export const storage = new MemStorage();
