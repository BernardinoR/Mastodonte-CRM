-- Fix: clients columns must have PostgreSQL-level defaults for Supabase inserts.
-- Prisma's @default(uuid()), @default(now()), and @updatedAt don't apply
-- when inserting via the Supabase client directly.

ALTER TABLE clients ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE clients ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE clients ALTER COLUMN updated_at SET DEFAULT now();
