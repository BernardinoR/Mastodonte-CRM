-- Fix: tasks.id needs a database-level DEFAULT so that
-- raw SQL inserts (n8n Fireflies Sync) work without providing an id.
ALTER TABLE tasks ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- Fix: tasks.updated_at needs a database-level DEFAULT so that
-- raw SQL inserts (n8n Fireflies Sync) work without providing updated_at.
ALTER TABLE tasks ALTER COLUMN updated_at SET DEFAULT now();
