-- ─── P3-37: Market Metrics Automation ─────────────────────────────────────
-- Automatically aggregates pool data into a metrics table for high-performance displays.

-- 1. Create the Metrics table
DROP TABLE IF EXISTS pool_market_metrics CASCADE;
CREATE TABLE pool_market_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    platform TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    avg_slot_price NUMERIC(10,2) NOT NULL DEFAULT 0,
    min_slot_price NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_active_pools INTEGER DEFAULT 0,
    total_slots_filled INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(platform, plan_name)
);

-- Safely add unique constraint
-- (Already handled in CREATE TABLE)

-- 2. Stored Procedure to Refresh Metrics
CREATE OR REPLACE FUNCTION refresh_pool_market_metrics() RETURNS void AS $$
BEGIN
    INSERT INTO pool_market_metrics (platform, plan_name, avg_slot_price, min_slot_price, total_active_pools, total_slots_filled, updated_at)
    SELECT
        platform,
        plan_name,
        AVG(price_per_slot)::NUMERIC(10,2) as avg_slot_price,
        MIN(price_per_slot)::NUMERIC(10,2) as min_slot_price,
        COUNT(*) as total_active_pools,
        SUM(filled_slots) as total_slots_filled,
        now()
    FROM pools
    WHERE status != 'closed'
    GROUP BY platform, plan_name
    ON CONFLICT (platform, plan_name) DO UPDATE SET
        avg_slot_price = EXCLUDED.avg_slot_price,
        min_slot_price = EXCLUDED.min_slot_price,
        total_active_pools = EXCLUDED.total_active_pools,
        total_slots_filled = EXCLUDED.total_slots_filled,
        updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger refreshing on EVERY pool insertion/update
-- Note: In extremely high-traffic apps, this should be a cron job.
-- For this MVP, a trigger is more reactive.
CREATE OR REPLACE FUNCTION trg_refresh_metrics_on_pool_change() RETURNS trigger AS $$
BEGIN
    PERFORM refresh_pool_market_metrics();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_pools_impact_metrics ON pools;
CREATE TRIGGER trg_pools_impact_metrics
    AFTER INSERT OR UPDATE OR DELETE ON pools
    FOR EACH STATEMENT EXECUTE PROCEDURE trg_refresh_metrics_on_pool_change();

-- Initial run
SELECT refresh_pool_market_metrics();

