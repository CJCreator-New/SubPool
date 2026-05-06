-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration: Standardize all money columns to CENTS (Integer)
-- ═══════════════════════════════════════════════════════════════════════════════
-- Problem: DB uses numeric(10,2) (dollars) but app code and mock data use cents.
--          This causes a 100x display error for live data.
-- Solution: Convert all price/amount columns to integers and multiply existing data.
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Update 'pools' table
ALTER TABLE pools ALTER COLUMN total_cost TYPE integer USING (total_cost * 100)::integer;
ALTER TABLE pools ALTER COLUMN price_per_slot TYPE integer USING (price_per_slot * 100)::integer;

-- 2. Update 'ledger' table
ALTER TABLE ledger ALTER COLUMN amount TYPE integer USING (amount * 100)::integer;

-- 3. Update 'memberships' table
ALTER TABLE memberships ALTER COLUMN price_per_slot TYPE integer USING (price_per_slot * 100)::integer;

-- 4. Update 'platform_pricing' table
ALTER TABLE platform_pricing ALTER COLUMN official_price TYPE integer USING (official_price * 100)::integer;

-- 5. Add a comment for future developers
COMMENT ON COLUMN pools.price_per_slot IS 'Price in cents (USD)';
COMMENT ON COLUMN ledger.amount IS 'Amount in cents (USD)';
