-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration: Align category and status enums between DB and application
-- ═══════════════════════════════════════════════════════════════════════════════
-- Problem: DB uses ('entertainment','work','productivity','ai') but
--          app TypeScript uses ('OTT','AI_IDE','productivity','ai')
--          DB pool status uses ('open','full','closed') but
--          database.types.ts uses ('open','active','closed')
-- Solution: Update DB to match app conventions (OTT, AI_IDE) and add 'active' status
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Update existing category data to match app conventions
UPDATE pools SET category = 'OTT' WHERE category = 'entertainment';
UPDATE pools SET category = 'AI_IDE' WHERE category = 'work';

-- 2. Drop old category constraint and add new one matching app
ALTER TABLE pools DROP CONSTRAINT IF EXISTS pools_category_check;
ALTER TABLE pools ADD CONSTRAINT pools_category_check
  CHECK (category IN ('OTT', 'AI_IDE', 'productivity', 'ai'));

-- 3. Update status constraint to include 'active' (used when pool has members but isn't full)
ALTER TABLE pools DROP CONSTRAINT IF EXISTS pools_status_check;
ALTER TABLE pools ADD CONSTRAINT pools_status_check
  CHECK (status IN ('open', 'active', 'full', 'closed'));

-- 4. Update platform_pricing category constraint to match
ALTER TABLE platform_pricing DROP CONSTRAINT IF EXISTS platform_pricing_category_check;
ALTER TABLE platform_pricing ADD CONSTRAINT platform_pricing_category_check
  CHECK (category IN ('OTT', 'AI_IDE', 'productivity', 'ai'));

-- 5. Update existing platform_pricing data
UPDATE platform_pricing SET category = 'OTT' WHERE category = 'OTT';  -- already correct
UPDATE platform_pricing SET category = 'AI_IDE' WHERE category = 'TEAM_SAAS';

-- 6. Also add missing columns to pools table if not present
ALTER TABLE pools ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE pools ADD COLUMN IF NOT EXISTS auto_approve boolean DEFAULT false;
ALTER TABLE pools ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 7. Add missing membership status values
ALTER TABLE memberships DROP CONSTRAINT IF EXISTS memberships_status_check;
ALTER TABLE memberships ADD CONSTRAINT memberships_status_check
  CHECK (status IN ('pending', 'active', 'cancelled', 'expired', 'removed'));
