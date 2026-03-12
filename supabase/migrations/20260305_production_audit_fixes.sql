-- ─── SubPool Production Audit Migration ──────────────────────────────────────
-- Resolves: P0-8 (pools columns), P0-9 (profiles columns), P0-10 (RLS fixes),
--           P1-11 (wishlist_requests), P1-20 (user_plans RLS)
-- Date: 2026-03-05

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. Add missing columns to POOLS
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE pools ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE pools ADD COLUMN IF NOT EXISTS auto_approve boolean DEFAULT false;
ALTER TABLE pools ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. Add missing columns to PROFILES 
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_color text DEFAULT '#C8F135';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_pro boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free' CHECK (plan IN ('free','pro','host_plus'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0;

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. Add missing columns to MEMBERSHIPS
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS next_billing_at timestamptz;
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS billing_anchor_day integer DEFAULT 1 CHECK (billing_anchor_day BETWEEN 1 AND 28);
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;

-- Expand memberships status enum to include 'cancelled' and 'expired'
ALTER TABLE memberships DROP CONSTRAINT IF EXISTS memberships_status_check;
ALTER TABLE memberships ADD CONSTRAINT memberships_status_check 
  CHECK (status IN ('pending','active','removed','cancelled','expired'));

-- ══════════════════════════════════════════════════════════════════════════════
-- 4. Add missing columns to NOTIFICATIONS
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS icon text DEFAULT '📢';

-- ══════════════════════════════════════════════════════════════════════════════
-- 5. Fix notifications INSERT policy (P0-10)
--    Currently allows any authenticated user to insert for any user
-- ══════════════════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "notifs_insert_service" ON notifications;
CREATE POLICY "notifs_insert_own" ON notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ══════════════════════════════════════════════════════════════════════════════
-- 6. Fix user_plans RLS — prevent self-elevation (P1-20)
-- ══════════════════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "user_plans_own" ON user_plans;
CREATE POLICY "user_plans_read" ON user_plans FOR SELECT
  USING (auth.uid() = user_id);
-- Only service_role can update plans (no user-facing UPDATE policy)
-- INSERT is allowed for new users (handled by signup trigger)

-- ══════════════════════════════════════════════════════════════════════════════
-- 7. Create wishlist_requests table (P1-11)
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS wishlist_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  platform_id text NOT NULL,
  plan_name text NOT NULL,
  budget_cents integer NOT NULL CHECK (budget_cents > 0),
  urgency text CHECK (urgency IN ('asap','within_week','flexible')),
  note text,
  status text DEFAULT 'open' CHECK (status IN ('open','fulfilled','expired','cancelled')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE wishlist_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wishlist_read" ON wishlist_requests FOR SELECT USING (true);
CREATE POLICY "wishlist_own_insert" ON wishlist_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wishlist_own_update" ON wishlist_requests FOR UPDATE
  USING (auth.uid() = user_id);

-- ══════════════════════════════════════════════════════════════════════════════
-- 8. Add indexes for messages table (if exists)
-- ══════════════════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_messages_pool ON messages(pool_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

-- ══════════════════════════════════════════════════════════════════════════════
-- 9. Add index for wishlist_requests
-- ══════════════════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_status ON wishlist_requests(status);
