-- =============================================
-- Migration: Add active_role column + update is_admin()
-- Purpose: Allow admins with multiple roles to toggle between
--          admin view and consultant view
-- Date: 2026-02-14
-- =============================================

-- 1. Add active_role column (nullable, NULL = default behavior)
ALTER TABLE users ADD COLUMN IF NOT EXISTS active_role TEXT DEFAULT NULL;

-- 2. Update is_admin() with short-circuit AND
--    Non-admins: 'administrador' = ANY(roles) → false → stops immediately (zero overhead)
--    Admins: checks active_role only when first condition is true
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    'administrador' = ANY(roles)
    AND (active_role IS NULL OR active_role = 'administrador')
  FROM users WHERE clerk_id = auth.jwt()->>'sub'
$$;
