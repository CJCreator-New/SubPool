-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration: Security hardening — RLS policies for notifications and admin
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Fix notification insert policy: only service role or edge functions should
--    be able to insert notifications for other users. Regular users can only
--    insert notifications for themselves (for client-side local notifications).
DROP POLICY IF EXISTS "notifs_insert_service" ON notifications;

-- Allow authenticated users to insert notifications only for themselves
DROP POLICY IF EXISTS "notifs_insert_own" ON notifications;
DROP POLICY IF EXISTS "notifs_insert_own" ON notifications;
CREATE POLICY "notifs_insert_own" ON notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Note: Edge functions using service_role key bypass RLS entirely,
-- so they can still insert notifications for any user.

-- 2. Add admin-only update policy for profiles (ban/unban)
-- Regular users can only update their own profile (existing policy).
-- Admin operations (is_banned, is_admin) must go through service_role edge functions.
-- This prevents client-side admin impersonation.

-- 3. Add delete policy for notifications (users can delete their own)
DROP POLICY IF EXISTS "notifs_own_delete" ON notifications;
CREATE POLICY "notifs_own_delete" ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Restrict analytics_events read to admin users only
DROP POLICY IF EXISTS "analytics_read_admin" ON analytics_events;
DROP POLICY IF EXISTS "analytics_read_admin" ON analytics_events;
DROP POLICY IF EXISTS "analytics_read_admin" ON analytics_events;
CREATE POLICY "analytics_read_admin" ON analytics_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 5. Add index for admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;
CREATE INDEX IF NOT EXISTS idx_profiles_is_banned ON profiles(is_banned) WHERE is_banned = true;
