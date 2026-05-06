-- 0. Drop views that depend on modified columns
DROP VIEW IF EXISTS host_earnings_summary CASCADE;
DROP VIEW IF EXISTS admin_user_overview CASCADE;

-- 1. Update 'pools' table
ALTER TABLE pools ALTER COLUMN total_cost TYPE integer USING (total_cost * 100)::integer;
ALTER TABLE pools ALTER COLUMN price_per_slot TYPE integer USING (price_per_slot * 100)::integer;

-- 2. Update 'ledger' table
ALTER TABLE ledger ALTER COLUMN amount TYPE integer USING (amount * 100)::integer;

-- 3. Update 'memberships' table
ALTER TABLE memberships ALTER COLUMN price_per_slot TYPE integer USING (price_per_slot * 100)::integer;

-- 4. Update 'platform_pricing' table
ALTER TABLE platform_pricing ALTER COLUMN official_price TYPE integer USING (official_price * 100)::integer;

-- 5. Recreate host_earnings_summary (simplified, it will be fully updated in next migrations or is already correct)
CREATE OR REPLACE VIEW host_earnings_summary AS
SELECT
    p.owner_id                                          AS host_id,
    p.id                                                AS pool_id,
    p.platform,
    p.plan_name,
    COUNT(l.id) FILTER (WHERE l.status = 'paid')        AS paid_count,
    COUNT(l.id) FILTER (WHERE l.status = 'owed')        AS pending_count,
    COALESCE(SUM(l.amount) FILTER (WHERE l.status = 'paid'), 0)   AS total_earned,
    COALESCE(SUM(l.amount) FILTER (WHERE l.status = 'owed'), 0)   AS total_pending,
    MAX(l.paid_at)                                      AS last_payout_at
FROM pools p
JOIN memberships m  ON m.pool_id = p.id AND m.status = 'active'
JOIN ledger l       ON l.membership_id = m.id
GROUP BY p.owner_id, p.id, p.platform, p.plan_name;

-- 6. Add a comment for future developers
COMMENT ON COLUMN pools.price_per_slot IS 'Price in cents (USD)';
COMMENT ON COLUMN ledger.amount IS 'Amount in cents (USD)';
