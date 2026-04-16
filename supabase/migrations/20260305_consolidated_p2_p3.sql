-- ─── SubPool Consolidated Migration (P2 Polish + P3 Features) ────────────────
-- This file combines all migrations from 2026-03-05 to bring the database
-- up to date with the latest features, performance fixes, and security.

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. PRODUCTION AUDIT FIXES (P2)
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE pools ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE pools ADD COLUMN IF NOT EXISTS auto_approve boolean DEFAULT false;
ALTER TABLE pools ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_color text DEFAULT '#C8F135';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_pro boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free' CHECK (plan IN ('free','pro','host_plus'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0;

ALTER TABLE memberships ADD COLUMN IF NOT EXISTS next_billing_at timestamptz;
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS billing_anchor_day integer DEFAULT 1 CHECK (billing_anchor_day BETWEEN 1 AND 28);
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;
ALTER TABLE memberships DROP CONSTRAINT IF EXISTS memberships_status_check;
ALTER TABLE memberships ADD CONSTRAINT memberships_status_check 
  CHECK (status IN ('pending','active','removed','cancelled','expired'));

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS icon text DEFAULT '📢';
DROP POLICY IF EXISTS "notifs_insert_own" ON notifications;
DROP POLICY IF EXISTS "notifs_insert_service" ON notifications;
CREATE POLICY "notifs_insert_own" ON notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_plans_read" ON user_plans;
DROP POLICY IF EXISTS "user_plans_own" ON user_plans;
CREATE POLICY "user_plans_read" ON user_plans FOR SELECT
  USING (auth.uid() = user_id);

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
DROP POLICY IF EXISTS "wishlist_read" ON wishlist_requests;
CREATE POLICY "wishlist_read" ON wishlist_requests FOR SELECT USING (true);
DROP POLICY IF EXISTS "wishlist_own_insert" ON wishlist_requests;
CREATE POLICY "wishlist_own_insert" ON wishlist_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "wishlist_own_update" ON wishlist_requests;
CREATE POLICY "wishlist_own_update" ON wishlist_requests FOR UPDATE
  USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_status ON wishlist_requests(status);

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. MESSAGING SYSTEM (P2/P3)
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  pool_id uuid REFERENCES pools(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text not null,
  created_at timestamptz default now()
);
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
-- Read: Users can read messages if they own the pool or are active members
DROP POLICY IF EXISTS "messages_read" ON messages;
create policy "messages_read" on messages FOR SELECT
  USING (
    auth.uid() = (select owner_id from pools where id = pool_id)
    or exists (select 1 from memberships where pool_id = messages.pool_id and user_id = auth.uid() and status = 'active')
  );
-- Insert: Users can insert if they own the pool or are active members, AND they are the sender
DROP POLICY IF EXISTS "messages_insert" ON messages;
create policy "messages_insert" on messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    and (
      auth.uid() = (select owner_id from pools where id = pool_id)
      or exists (select 1 from memberships where pool_id = messages.pool_id and user_id = auth.uid() and status = 'active')
    )
  );
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'messages') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE messages;
    END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_messages_pool ON messages(pool_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. PLATFORM PRICING SEED (P2-23)
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS platform_pricing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    platform_id TEXT NOT NULL,
    platform_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('OTT', 'AI_IDE', 'TEAM_SAAS')),
    plan_name TEXT NOT NULL,
    billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
    country_code TEXT NOT NULL DEFAULT 'US',
    currency TEXT NOT NULL DEFAULT 'USD',
    official_price NUMERIC(10,2) NOT NULL DEFAULT 0,
    price_per_seat NUMERIC(10,2),
    max_seats INTEGER,
    min_slots INTEGER NOT NULL DEFAULT 1,
    supports_sharing BOOLEAN NOT NULL DEFAULT TRUE,
    sharing_policy TEXT NOT NULL DEFAULT 'allowed' CHECK (sharing_policy IN ('allowed', 'grey_area', 'not_recommended')),
    source TEXT NOT NULL DEFAULT 'manual',
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (platform_id, plan_name, country_code, currency, billing_cycle)
);

-- Ensure columns exist if table was already created (idempotent fix)
ALTER TABLE platform_pricing ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE platform_pricing ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- Ensure the unique constraint exists for ON CONFLICT (idempotent fix)
DROP INDEX IF EXISTS idx_platform_pricing_unique;
CREATE UNIQUE INDEX idx_platform_pricing_unique ON platform_pricing (platform_id, plan_name, country_code, currency, billing_cycle);

ALTER TABLE platform_pricing ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "platform_pricing_read" ON platform_pricing;
CREATE POLICY "platform_pricing_read" ON platform_pricing FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_platform_pricing_lookup ON platform_pricing (platform_id, plan_name, currency);

-- ══════════════════════════════════════════════════════════════════════════════
-- 4. PERFORMANCE: FULL-TEXT SEARCH (P3-36)
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE pools ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS idx_pools_search ON pools USING GIN (search_vector);
CREATE OR REPLACE FUNCTION pools_search_vector_update() RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', coalesce(NEW.platform, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.plan_name, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(NEW.category, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_pools_search_vector_update ON pools;
CREATE TRIGGER trg_pools_search_vector_update
    BEFORE INSERT OR UPDATE ON pools
    FOR EACH ROW EXECUTE PROCEDURE pools_search_vector_update();
UPDATE pools SET search_vector = 
    setweight(to_tsvector('english', coalesce(platform, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(plan_name, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(category, '')), 'C');

-- ══════════════════════════════════════════════════════════════════════════════
-- 5. AUTOMATION: MARKET METRICS (P3-37)
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS pool_market_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    platform_id TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    country_code TEXT NOT NULL DEFAULT 'US',
    currency TEXT NOT NULL DEFAULT 'USD',
    avg_slot_price NUMERIC(10,2) NOT NULL DEFAULT 0,
    min_slot_price NUMERIC(10,2) NOT NULL DEFAULT 0,
    active_pools_count INTEGER DEFAULT 0,
    total_pools_count INTEGER DEFAULT 0,
    computed_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(platform_id, plan_name, country_code, currency)
);

-- Ensure the unique constraint exists for ON CONFLICT (idempotent fix)
DROP INDEX IF EXISTS idx_pool_market_metrics_unique;
CREATE UNIQUE INDEX idx_pool_market_metrics_unique ON pool_market_metrics (platform_id, plan_name, country_code, currency);

-- 2. Procedure to Refresh Metrics
CREATE OR REPLACE FUNCTION refresh_pool_market_metrics() RETURNS void AS $$
BEGIN
    INSERT INTO public.pool_market_metrics (
        platform_id, 
        plan_name, 
        country_code, 
        currency, 
        avg_slot_price, 
        min_slot_price, 
        active_pools_count, 
        total_pools_count, 
        computed_at
    )
    SELECT
        platform as platform_id,
        plan_name,
        'US' as country_code,
        'USD' as currency,
        AVG(price_per_slot)::NUMERIC(10,2) as avg_slot_price,
        MIN(price_per_slot)::NUMERIC(10,2) as min_slot_price,
        COUNT(*)::integer as active_pools_count,
        SUM(filled_slots)::integer as total_pools_count,
        now() as computed_at
    FROM public.pools
    WHERE status != 'closed'
    GROUP BY platform, plan_name
    ON CONFLICT (platform_id, plan_name, country_code, currency) DO UPDATE SET
        avg_slot_price = EXCLUDED.avg_slot_price,
        min_slot_price = EXCLUDED.min_slot_price,
        active_pools_count = EXCLUDED.active_pools_count,
        total_pools_count = EXCLUDED.total_pools_count,
        computed_at = EXCLUDED.computed_at;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger refreshing on EVERY pool insertion/update
-- This function acts as the TIGGER wrapper
CREATE OR REPLACE FUNCTION trg_refresh_metrics_handler() RETURNS trigger AS $$
BEGIN
    PERFORM refresh_pool_market_metrics();
    RETURN NULL; -- Statement level triggers return NULL
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_pools_impact_metrics ON pools;
CREATE TRIGGER trg_pools_impact_metrics
    AFTER INSERT OR UPDATE OR DELETE ON pools
    FOR EACH STATEMENT EXECUTE PROCEDURE trg_refresh_metrics_handler();

-- Initial run
SELECT refresh_pool_market_metrics();

-- ══════════════════════════════════════════════════════════════════════════════
-- 6. PUSH NOTIFICATIONS (P3-35)
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS push_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    token TEXT NOT NULL,
    platform TEXT CHECK (platform IN ('web', 'ios', 'android')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, token)
);
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "push_tokens_own" ON push_tokens;
CREATE POLICY "push_tokens_own" ON push_tokens FOR ALL USING (auth.uid() = user_id);
CREATE OR REPLACE FUNCTION notify_push_service() RETURNS trigger AS $$
BEGIN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_push_on_notification ON notifications;
CREATE TRIGGER trg_push_on_notification AFTER INSERT ON notifications FOR EACH ROW EXECUTE PROCEDURE notify_push_service();

-- ══════════════════════════════════════════════════════════════════════════════
-- 7. AUDIT: LEDGER CHANGES (P3-38)
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS ledger_audit (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ledger_id UUID NOT NULL,
    old_status TEXT,
    new_status TEXT,
    old_amount NUMERIC(10,2),
    new_amount NUMERIC(10,2),
    changed_by UUID DEFAULT auth.uid(),
    changed_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE ledger_audit ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "audit_read" ON ledger_audit;
CREATE POLICY "audit_read" ON ledger_audit FOR SELECT
  USING (
    EXISTS (
        SELECT 1 FROM ledger l JOIN memberships m ON m.id = l.membership_id JOIN pools p ON p.id = m.pool_id
        WHERE l.id = ledger_audit.ledger_id AND (m.user_id = auth.uid() OR p.owner_id = auth.uid())
    )
  );
CREATE OR REPLACE FUNCTION record_ledger_audit() RETURNS trigger AS $$
BEGIN
    IF (OLD.status IS DISTINCT FROM NEW.status OR OLD.amount IS DISTINCT FROM NEW.amount) THEN
        INSERT INTO ledger_audit (ledger_id, old_status, new_status, old_amount, new_amount)
        VALUES (NEW.id, OLD.status, NEW.status, OLD.amount, NEW.amount);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS trg_ledger_audit ON ledger;
CREATE TRIGGER trg_ledger_audit AFTER UPDATE ON ledger FOR EACH ROW EXECUTE PROCEDURE record_ledger_audit();

-- ══════════════════════════════════════════════════════════════════════════════
-- 8. SECURITY: RATE LIMITING (P3-39)
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    action TEXT NOT NULL,
    last_action_at TIMESTAMPTZ DEFAULT now(),
    count INTEGER DEFAULT 1,
    UNIQUE(user_id, action)
);
CREATE OR REPLACE FUNCTION check_rate_limit(p_user_id UUID, p_action TEXT, p_max_per_min INTEGER) RETURNS boolean AS $$
DECLARE
    v_record RECORD;
BEGIN
    SELECT * INTO v_record FROM rate_limits WHERE user_id = p_user_id AND action = p_action;
    IF NOT FOUND THEN
        INSERT INTO rate_limits (user_id, action, count, last_action_at) VALUES (p_user_id, p_action, 1, now());
        RETURN TRUE;
    END IF;
    IF (v_record.last_action_at < now() - INTERVAL '1 minute') THEN
        UPDATE rate_limits SET count = 1, last_action_at = now() WHERE user_id = p_user_id AND action = p_action;
        RETURN TRUE;
    END IF;
    IF (v_record.count < p_max_per_min) THEN
        UPDATE rate_limits SET count = count + 1, last_action_at = now() WHERE user_id = p_user_id AND action = p_action;
        RETURN TRUE;
    END IF;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION trg_pools_rate_limit() RETURNS trigger AS $$
BEGIN
    IF (auth.role() = 'authenticated') THEN
        IF NOT check_rate_limit(auth.uid(), 'pool_mutation', 10) THEN
            RAISE EXCEPTION 'Rate limit exceeded: Max 10 mutations per minute.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_pools_rl ON pools;
CREATE TRIGGER trg_pools_rl BEFORE INSERT OR UPDATE ON pools FOR EACH ROW EXECUTE PROCEDURE trg_pools_rate_limit();

-- ══════════════════════════════════════════════════════════════════════════════
-- 9. SEED DATA (OPTIONAL)
-- ══════════════════════════════════════════════════════════════════════════════
-- Note: Re-running this will update existing pricing with the latest seeds.
INSERT INTO platform_pricing (platform_id, platform_name, category, plan_name, billing_cycle, country_code, currency, official_price, max_seats, min_slots, supports_sharing, sharing_policy, source)
VALUES
('netflix', 'Netflix', 'OTT', 'Basic', 'monthly', 'US', 'USD', 6.99, 1, 1, false, 'allowed', 'manual'),
('netflix', 'Netflix', 'OTT', 'Standard', 'monthly', 'US', 'USD', 15.49, 2, 2, true, 'allowed', 'manual'),
('netflix', 'Netflix', 'OTT', '4K', 'monthly', 'US', 'USD', 22.99, 4, 2, true, 'allowed', 'manual'),
('chatgpt', 'ChatGPT', 'AI_IDE', 'Plus', 'monthly', 'US', 'USD', 20, 1, 1, true, 'grey_area', 'manual'),
('figma', 'Figma', 'TEAM_SAAS', 'Professional', 'monthly', 'US', 'USD', 15, NULL, 2, true, 'not_recommended', 'manual')
ON CONFLICT (platform_id, plan_name, country_code, currency, billing_cycle) DO UPDATE SET
    official_price = EXCLUDED.official_price,
    updated_at = now();
