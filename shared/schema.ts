import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum("user_role", [
  "administrador",
  "consultor", 
  "alocador",
  "concierge"
]);

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  name: text("name"),
  role: userRoleEnum("role").notNull().default("consultor"),
  groupId: integer("group_id").references(() => groups.id),
});

export const insertGroupSchema = createInsertSchema(groups).omit({ id: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true }).extend({
  groupId: z.number().nullable().optional(),
});

export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type Group = typeof groups.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type UserRole = "administrador" | "consultor" | "alocador" | "concierge";
