-- =============================================
-- Fix security advisor warnings
-- =============================================

-- 1. Fix function search_path (security hardening)
CREATE OR REPLACE FUNCTION public.clerk_user_id()
RETURNS int
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub'
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 'administrador' = ANY(roles)
  FROM users WHERE clerk_id = auth.jwt()->>'sub'
$$;

CREATE OR REPLACE FUNCTION public.user_group_id()
RETURNS int
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT group_id FROM users WHERE clerk_id = auth.jwt()->>'sub'
$$;

CREATE OR REPLACE FUNCTION public.auto_create_task_history()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO task_history (task_id, type, content, author_id)
  VALUES (NEW.id, 'created', 'Task criada', NEW.creator_id);
  RETURN NEW;
END;
$$;

-- 2. Enable RLS on meetings table
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meetings_select" ON meetings
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "meetings_insert" ON meetings
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "meetings_update" ON meetings
  FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "meetings_delete" ON meetings
  FOR DELETE TO authenticated
  USING (true);
