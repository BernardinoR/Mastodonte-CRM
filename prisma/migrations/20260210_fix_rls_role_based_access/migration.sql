-- =============================================
-- Migration: Role-Based Access Control (RLS)
-- Purpose: Restrict tasks and clients visibility by role
--   - Consultor: sees only own clients/tasks (created + assigned)
--   - Alocador/Concierge: sees group's clients/tasks
--   - Administrador: sees everything
-- Date: 2026-02-10
-- =============================================

-- ============================================
-- 1. NEW HELPER FUNCTION
-- ============================================

-- Check if the authenticated user has group-level access (alocador or concierge)
CREATE OR REPLACE FUNCTION public.has_group_access()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ('alocador' = ANY(roles) OR 'concierge' = ANY(roles))
  FROM users WHERE clerk_id = auth.jwt()->>'sub'
$$;

-- ============================================
-- 2. PERFORMANCE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_tasks_creator_id ON tasks(creator_id);
CREATE INDEX IF NOT EXISTS idx_task_assignees_user_id ON task_assignees(user_id);

-- ============================================
-- 3. CLIENTS POLICIES (drop + recreate)
-- ============================================

-- SELECT: Consultor sees only own clients; Alocador/Concierge sees group's clients; Admin sees all
DROP POLICY IF EXISTS "clients_select" ON clients;
CREATE POLICY "clients_select" ON clients
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR owner_id = public.clerk_user_id()
    OR (
      public.has_group_access()
      AND public.user_group_id() IS NOT NULL
      AND owner_id IN (SELECT id FROM users WHERE group_id = public.user_group_id())
    )
  );

-- INSERT: owner_id must be the authenticated user (unchanged logic)
DROP POLICY IF EXISTS "clients_insert" ON clients;
CREATE POLICY "clients_insert" ON clients
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = public.clerk_user_id());

-- UPDATE: Same access as SELECT
DROP POLICY IF EXISTS "clients_update" ON clients;
CREATE POLICY "clients_update" ON clients
  FOR UPDATE TO authenticated
  USING (
    public.is_admin()
    OR owner_id = public.clerk_user_id()
    OR (
      public.has_group_access()
      AND public.user_group_id() IS NOT NULL
      AND owner_id IN (SELECT id FROM users WHERE group_id = public.user_group_id())
    )
  );

-- DELETE: Admin or owner only (unchanged logic)
DROP POLICY IF EXISTS "clients_delete" ON clients;
CREATE POLICY "clients_delete" ON clients
  FOR DELETE TO authenticated
  USING (public.is_admin() OR owner_id = public.clerk_user_id());

-- ============================================
-- 4. TASKS POLICIES (drop + recreate)
-- ============================================

-- SELECT: Consultor sees created + assigned; Alocador/Concierge sees group's tasks; Admin sees all
DROP POLICY IF EXISTS "tasks_select" ON tasks;
CREATE POLICY "tasks_select" ON tasks
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR creator_id = public.clerk_user_id()
    OR EXISTS (
      SELECT 1 FROM task_assignees ta
      WHERE ta.task_id = tasks.id AND ta.user_id = public.clerk_user_id()
    )
    OR (
      public.has_group_access()
      AND public.user_group_id() IS NOT NULL
      AND (
        creator_id IN (SELECT id FROM users WHERE group_id = public.user_group_id())
        OR (
          client_id IS NOT NULL
          AND client_id IN (
            SELECT c.id FROM clients c
            WHERE c.owner_id IN (SELECT id FROM users WHERE group_id = public.user_group_id())
          )
        )
        OR EXISTS (
          SELECT 1 FROM task_assignees ta
          JOIN users u ON u.id = ta.user_id
          WHERE ta.task_id = tasks.id AND u.group_id = public.user_group_id()
        )
      )
    )
  );

-- INSERT: creator_id must be the authenticated user (unchanged)
DROP POLICY IF EXISTS "tasks_insert" ON tasks;
CREATE POLICY "tasks_insert" ON tasks
  FOR INSERT TO authenticated
  WITH CHECK (creator_id = public.clerk_user_id());

-- UPDATE: Same access as SELECT
DROP POLICY IF EXISTS "tasks_update" ON tasks;
CREATE POLICY "tasks_update" ON tasks
  FOR UPDATE TO authenticated
  USING (
    public.is_admin()
    OR creator_id = public.clerk_user_id()
    OR EXISTS (
      SELECT 1 FROM task_assignees ta
      WHERE ta.task_id = tasks.id AND ta.user_id = public.clerk_user_id()
    )
    OR (
      public.has_group_access()
      AND public.user_group_id() IS NOT NULL
      AND (
        creator_id IN (SELECT id FROM users WHERE group_id = public.user_group_id())
        OR (
          client_id IS NOT NULL
          AND client_id IN (
            SELECT c.id FROM clients c
            WHERE c.owner_id IN (SELECT id FROM users WHERE group_id = public.user_group_id())
          )
        )
        OR EXISTS (
          SELECT 1 FROM task_assignees ta
          JOIN users u ON u.id = ta.user_id
          WHERE ta.task_id = tasks.id AND u.group_id = public.user_group_id()
        )
      )
    )
  );

-- DELETE: Admin, creator, or alocador/concierge for group tasks
DROP POLICY IF EXISTS "tasks_delete" ON tasks;
CREATE POLICY "tasks_delete" ON tasks
  FOR DELETE TO authenticated
  USING (
    public.is_admin()
    OR creator_id = public.clerk_user_id()
    OR (
      public.has_group_access()
      AND public.user_group_id() IS NOT NULL
      AND creator_id IN (SELECT id FROM users WHERE group_id = public.user_group_id())
    )
  );

-- ============================================
-- 5. TASK_ASSIGNEES & TASK_HISTORY
-- ============================================
-- Keep USING(true) to avoid circular RLS dependency:
-- tasks_select references task_assignees, so task_assignees
-- cannot reference tasks back without infinite recursion.
-- Access control is enforced at the tasks table level.
-- No changes needed for task_assignees or task_history.
