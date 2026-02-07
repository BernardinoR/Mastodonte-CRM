-- Fix: Add PostgreSQL-level defaults for all columns omitted by Supabase inserts
-- Supabase bypasses Prisma, so @updatedAt and @default(now()) don't apply.
-- Without these defaults, inserting via supabase.from("tasks").insert(...) fails with:
--   null value in column "updated_at" violates not-null constraint

-- Timestamps (critical — these cause the current error)
ALTER TABLE tasks ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE tasks ALTER COLUMN updated_at SET DEFAULT now();

-- Defensive defaults matching Prisma schema
ALTER TABLE tasks ALTER COLUMN priority SET DEFAULT 'Normal';
ALTER TABLE tasks ALTER COLUMN status SET DEFAULT 'To Do';
ALTER TABLE tasks ALTER COLUMN "order" SET DEFAULT 0;

-- Fix task_history.id — the auto_create_task_history trigger inserts without id,
-- and Prisma's @default(uuid()) doesn't apply at the PostgreSQL level
ALTER TABLE task_history ALTER COLUMN id SET DEFAULT gen_random_uuid();
