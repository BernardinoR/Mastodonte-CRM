-- Migration: RLS Policies + Indexes + Task History Trigger
-- Purpose: Enable direct browser-to-database access via Supabase with Clerk JWT auth
-- Date: 2026-02-01

-- ============================================
-- 1. HELPER FUNCTIONS (for RLS policies)
-- ============================================

-- Extract the authenticated user's internal ID from Clerk JWT
CREATE OR REPLACE FUNCTION public.clerk_user_id()
RETURNS int AS $$
  SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub'
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if the authenticated user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT 'administrador' = ANY(roles)
  FROM users WHERE clerk_id = auth.jwt()->>'sub'
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get the group_id of the authenticated user
CREATE OR REPLACE FUNCTION public.user_group_id()
RETURNS int AS $$
  SELECT group_id FROM users WHERE clerk_id = auth.jwt()->>'sub'
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- 2. ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_history ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. RLS POLICIES
-- ============================================

-- --- USERS ---
-- Everyone can read users (needed for assignee lists, etc.)
CREATE POLICY "users_select" ON users FOR SELECT USING (true);
-- Only admins can update other users
CREATE POLICY "users_update_admin" ON users FOR UPDATE USING (public.is_admin());
-- Users can update their own profile (name only - enforced at app level)
CREATE POLICY "users_update_self" ON users FOR UPDATE USING (
  clerk_id = auth.jwt()->>'sub'
);

-- --- GROUPS ---
-- Everyone can read groups
CREATE POLICY "groups_select" ON groups FOR SELECT USING (true);
-- Only admins can create/update/delete groups
CREATE POLICY "groups_insert" ON groups FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "groups_update" ON groups FOR UPDATE USING (public.is_admin());
CREATE POLICY "groups_delete" ON groups FOR DELETE USING (public.is_admin());

-- --- CLIENTS ---
-- SELECT: admin sees all, group members see group's clients, otherwise only own clients
CREATE POLICY "clients_select" ON clients FOR SELECT USING (
  public.is_admin()
  OR owner_id = public.clerk_user_id()
  OR (
    public.user_group_id() IS NOT NULL
    AND owner_id IN (
      SELECT id FROM users WHERE group_id = public.user_group_id()
    )
  )
);

-- INSERT: any authenticated user, owner_id must be themselves
CREATE POLICY "clients_insert" ON clients FOR INSERT
  WITH CHECK (owner_id = public.clerk_user_id());

-- UPDATE: same access as SELECT
CREATE POLICY "clients_update" ON clients FOR UPDATE USING (
  public.is_admin()
  OR owner_id = public.clerk_user_id()
  OR (
    public.user_group_id() IS NOT NULL
    AND owner_id IN (
      SELECT id FROM users WHERE group_id = public.user_group_id()
    )
  )
);

-- DELETE: owner or admin only
CREATE POLICY "clients_delete" ON clients FOR DELETE USING (
  public.is_admin()
  OR owner_id = public.clerk_user_id()
);

-- --- WHATSAPP GROUPS ---
-- Access follows client access (via FK + clients RLS)
CREATE POLICY "whatsapp_groups_select" ON whatsapp_groups FOR SELECT USING (
  client_id IN (SELECT id FROM clients)
);
CREATE POLICY "whatsapp_groups_insert" ON whatsapp_groups FOR INSERT WITH CHECK (
  client_id IN (SELECT id FROM clients)
);
CREATE POLICY "whatsapp_groups_update" ON whatsapp_groups FOR UPDATE USING (
  client_id IN (SELECT id FROM clients)
);
CREATE POLICY "whatsapp_groups_delete" ON whatsapp_groups FOR DELETE USING (
  client_id IN (SELECT id FROM clients)
);

-- --- TASKS ---
-- SELECT: all authenticated users can see tasks
CREATE POLICY "tasks_select" ON tasks FOR SELECT USING (true);
-- INSERT: creator_id must be the authenticated user
CREATE POLICY "tasks_insert" ON tasks FOR INSERT WITH CHECK (
  creator_id = public.clerk_user_id()
);
-- UPDATE: any authenticated user (team collaboration)
CREATE POLICY "tasks_update" ON tasks FOR UPDATE USING (true);
-- DELETE: admin or task creator
CREATE POLICY "tasks_delete" ON tasks FOR DELETE USING (
  public.is_admin() OR creator_id = public.clerk_user_id()
);

-- --- TASK ASSIGNEES ---
-- Full access for all authenticated users (managed via task context)
CREATE POLICY "task_assignees_select" ON task_assignees FOR SELECT USING (true);
CREATE POLICY "task_assignees_insert" ON task_assignees FOR INSERT WITH CHECK (true);
CREATE POLICY "task_assignees_update" ON task_assignees FOR UPDATE USING (true);
CREATE POLICY "task_assignees_delete" ON task_assignees FOR DELETE USING (true);

-- --- TASK HISTORY ---
-- SELECT: all authenticated users
CREATE POLICY "task_history_select" ON task_history FOR SELECT USING (true);
-- INSERT: author_id must be the authenticated user
CREATE POLICY "task_history_insert" ON task_history FOR INSERT
  WITH CHECK (author_id = public.clerk_user_id());
-- DELETE: author or admin
CREATE POLICY "task_history_delete" ON task_history FOR DELETE USING (
  author_id = public.clerk_user_id() OR public.is_admin()
);

-- ============================================
-- 4. INDEXES (performance)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_clients_owner_id ON clients(owner_id);
CREATE INDEX IF NOT EXISTS idx_clients_active_created ON clients(is_active, created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status_order ON tasks(status, "order");
CREATE INDEX IF NOT EXISTS idx_users_group_id ON users(group_id);
CREATE INDEX IF NOT EXISTS idx_task_assignees_task_id ON task_assignees(task_id);

-- ============================================
-- 5. TRIGGER: Auto-create task history on task insert
-- ============================================

CREATE OR REPLACE FUNCTION public.auto_create_task_history()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO task_history (id, task_id, type, content, author_id, created_at)
  VALUES (gen_random_uuid(), NEW.id, 'created', 'Task criada', NEW.creator_id, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists (idempotent)
DROP TRIGGER IF EXISTS task_after_insert ON tasks;

CREATE TRIGGER task_after_insert
  AFTER INSERT ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_task_history();

-- ============================================
-- 6. GRANT USAGE for anon/authenticated roles
-- ============================================
-- Supabase uses 'anon' and 'authenticated' roles
-- The anon key sends requests as 'anon', but with a valid JWT
-- Supabase automatically switches to 'authenticated' when JWT is present

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Anon role should have no access (require authentication)
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
