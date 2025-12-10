import { sql } from "drizzle-orm";
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const USER_ROLES = ["administrador", "consultor", "alocador", "concierge"] as const;
export type UserRole = typeof USER_ROLES[number];

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  name: text("name"),
  roles: text("roles").array().notNull().default(sql`ARRAY['consultor']::text[]`),
  groupId: integer("group_id").references(() => groups.id),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertGroupSchema = createInsertSchema(groups).omit({ id: true, createdAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true }).extend({
  groupId: z.number().nullable().optional(),
  roles: z.array(z.enum(USER_ROLES)).optional(),
});

export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type Group = typeof groups.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
