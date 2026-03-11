-- Enable RLS for contas table (created by prisma db push without RLS)
ALTER TABLE contas ENABLE ROW LEVEL SECURITY;

-- Select: admins, owners, and group members can read
CREATE POLICY "contas_select" ON contas
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR client_id IN (SELECT id FROM clients WHERE owner_id = public.clerk_user_id())
    OR (
      public.has_group_access()
      AND public.user_group_id() IS NOT NULL
      AND client_id IN (
        SELECT id FROM clients WHERE owner_id IN (
          SELECT id FROM users WHERE group_id = public.user_group_id()
        )
      )
    )
  );

-- Insert/Update/Delete: all authenticated users (RLS on select controls visibility)
CREATE POLICY "contas_insert" ON contas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "contas_update" ON contas FOR UPDATE TO authenticated USING (true);
CREATE POLICY "contas_delete" ON contas FOR DELETE TO authenticated USING (true);
