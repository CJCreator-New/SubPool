-- ─── Phase 5: Monetization & Featured Listings ──────────────────────────
-- Covers: Featured pool logic, Priority sorting, and Tier-based flags

-- 1. Add featured and verified flags to pools
ALTER TABLE pools ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE pools ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ;
ALTER TABLE pools ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- 2. Update profiles with verified host status
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified_host BOOLEAN DEFAULT false;

-- 3. Create featured_pool_logs for auditing
CREATE TABLE IF NOT EXISTS featured_pool_logs (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pool_id         UUID REFERENCES pools(id) ON DELETE CASCADE NOT NULL,
    user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    amount_paid     INTEGER NOT NULL, -- in cents
    duration_days   INTEGER NOT NULL,
    activated_at    TIMESTAMPTZ DEFAULT now(),
    expires_at      TIMESTAMPTZ NOT NULL
);

-- RLS for featured_pool_logs
ALTER TABLE featured_pool_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_featured_logs" ON featured_pool_logs
    FOR SELECT USING (auth.uid() = user_id);

-- 4. Function: feature_pool — sets featured status for a pool
CREATE OR REPLACE FUNCTION feature_pool(p_pool_id UUID, p_duration_days INTEGER, p_amount_paid INTEGER)
RETURNS VOID AS $$
BEGIN
    -- Update pool
    UPDATE pools 
    SET 
        is_featured = true,
        featured_until = now() + (p_duration_days || ' days')::interval
    WHERE id = p_pool_id;

    -- Log transaction
    INSERT INTO featured_pool_logs (pool_id, user_id, amount_paid, duration_days, expires_at)
    VALUES (p_pool_id, auth.uid(), p_amount_paid, p_duration_days, now() + (p_duration_days || ' days')::interval);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Update pools_with_owners view to include featured flags
DROP VIEW IF EXISTS pools_with_owners;
CREATE VIEW pools_with_owners AS
SELECT 
    p.*,
    pr.username as owner_username,
    pr.display_name as owner_display_name,
    pr.avatar_url as owner_avatar_url,
    pr.avatar_color as owner_avatar_color,
    pr.rating as owner_rating,
    pr.plan as owner_plan,
    pr.is_verified_host as owner_is_verified
FROM pools p
JOIN profiles pr ON p.owner_id = pr.id;
