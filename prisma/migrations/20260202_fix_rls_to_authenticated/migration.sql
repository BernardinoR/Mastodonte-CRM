-- =============================================
-- Fix RLS policies: change FROM public TO authenticated
-- Ensures only authenticated users (with valid JWT) can access data
-- =============================================

-- USERS
DROP POLICY IF EXISTS "users_select" ON users;
DROP POLICY IF EXISTS "users_update_admin" ON users;
DROP POLICY IF EXISTS "users_update_self" ON users;

CREATE POLICY "users_select" ON users
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "users_update_admin" ON users
  FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "users_update_self" ON users
  FOR UPDATE TO authenticated
  USING (clerk_id = auth.jwt()->>'sub')
  WITH CHECK (clerk_id = auth.jwt()->>'sub');

-- GROUPS
DROP POLICY IF EXISTS "groups_select" ON groups;
DROP POLICY IF EXISTS "groups_insert" ON groups;
DROP POLICY IF EXISTS "groups_update" ON groups;
DROP POLICY IF EXISTS "groups_delete" ON groups;

CREATE POLICY "groups_select" ON groups
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "groups_insert" ON groups
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "groups_update" ON groups
  FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "groups_delete" ON groups
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- CLIENTS
DROP POLICY IF EXISTS "clients_select" ON clients;
DROP POLICY IF EXISTS "clients_insert" ON clients;
DROP POLICY IF EXISTS "clients_update" ON clients;
DROP POLICY IF EXISTS "clients_delete" ON clients;

CREATE POLICY "clients_select" ON clients
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR owner_id = public.clerk_user_id()
    OR (
      public.user_group_id() IS NOT NULL
      AND owner_id IN (
        SELECT id FROM users WHERE group_id = public.user_group_id()
      )
    )
  );

CREATE POLICY "clients_insert" ON clients
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = public.clerk_user_id());

CREATE POLICY "clients_update" ON clients
  FOR UPDATE TO authenticated
  USING (
    public.is_admin()
    OR owner_id = public.clerk_user_id()
    OR (
      public.user_group_id() IS NOT NULL
      AND owner_id IN (
        SELECT id FROM users WHERE group_id = public.user_group_id()
      )
    )
  );

CREATE POLICY "clients_delete" ON clients
  FOR DELETE TO authenticated
  USING (public.is_admin() OR owner_id = public.clerk_user_id());

-- TASKS
DROP POLICY IF EXISTS "tasks_select" ON tasks;
DROP POLICY IF EXISTS "tasks_insert" ON tasks;
DROP POLICY IF EXISTS "tasks_update" ON tasks;
DROP POLICY IF EXISTS "tasks_delete" ON tasks;

CREATE POLICY "tasks_select" ON tasks
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "tasks_insert" ON tasks
  FOR INSERT TO authenticated
  WITH CHECK (creator_id = public.clerk_user_id());

CREATE POLICY "tasks_update" ON tasks
  FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "tasks_delete" ON tasks
  FOR DELETE TO authenticated
  USING (public.is_admin() OR creator_id = public.clerk_user_id());

-- TASK_ASSIGNEES
DROP POLICY IF EXISTS "task_assignees_select" ON task_assignees;
DROP POLICY IF EXISTS "task_assignees_insert" ON task_assignees;
DROP POLICY IF EXISTS "task_assignees_update" ON task_assignees;
DROP POLICY IF EXISTS "task_assignees_delete" ON task_assignees;

CREATE POLICY "task_assignees_select" ON task_assignees
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "task_assignees_insert" ON task_assignees
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "task_assignees_update" ON task_assignees
  FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "task_assignees_delete" ON task_assignees
  FOR DELETE TO authenticated
  USING (true);

-- TASK_HISTORY
DROP POLICY IF EXISTS "task_history_select" ON task_history;
DROP POLICY IF EXISTS "task_history_insert" ON task_history;
DROP POLICY IF EXISTS "task_history_delete" ON task_history;

CREATE POLICY "task_history_select" ON task_history
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "task_history_insert" ON task_history
  FOR INSERT TO authenticated
  WITH CHECK (author_id = public.clerk_user_id());

CREATE POLICY "task_history_delete" ON task_history
  FOR DELETE TO authenticated
  USING (author_id = public.clerk_user_id() OR public.is_admin());

-- WHATSAPP_GROUPS
DROP POLICY IF EXISTS "whatsapp_groups_select" ON whatsapp_groups;
DROP POLICY IF EXISTS "whatsapp_groups_insert" ON whatsapp_groups;
DROP POLICY IF EXISTS "whatsapp_groups_update" ON whatsapp_groups;
DROP POLICY IF EXISTS "whatsapp_groups_delete" ON whatsapp_groups;

CREATE POLICY "whatsapp_groups_select" ON whatsapp_groups
  FOR SELECT TO authenticated
  USING (client_id IN (SELECT id FROM clients));

CREATE POLICY "whatsapp_groups_insert" ON whatsapp_groups
  FOR INSERT TO authenticated
  WITH CHECK (client_id IN (SELECT id FROM clients));

CREATE POLICY "whatsapp_groups_update" ON whatsapp_groups
  FOR UPDATE TO authenticated
  USING (client_id IN (SELECT id FROM clients));

CREATE POLICY "whatsapp_groups_delete" ON whatsapp_groups
  FOR DELETE TO authenticated
  USING (client_id IN (SELECT id FROM clients));
