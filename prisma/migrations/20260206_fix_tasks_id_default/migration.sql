-- Fix: tasks.id must auto-generate UUID when not provided
-- The Supabase client bypasses Prisma's @default(uuid()), so PostgreSQL
-- needs its own DEFAULT to generate UUIDs on insert.
ALTER TABLE tasks ALTER COLUMN id SET DEFAULT gen_random_uuid();
