-- Fix: task_history.id needs a database-level DEFAULT so that
-- the auto_create_task_history trigger can insert without providing an id.
ALTER TABLE task_history ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
