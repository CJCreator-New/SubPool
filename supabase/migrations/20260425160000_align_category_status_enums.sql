-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration: Align category and status enums between DB and application
-- ═══════════════════════════════════════════════════════════════════════════════
-- Problem: DB uses ('entertainment','work','productivity','ai') but
--          app TypeScript uses ('OTT','AI_IDE','productivity','ai')
--          DB pool status uses ('open','full','closed') but
--          database.types.ts uses ('open','active','closed')
-- Solution: Update DB to match app conventions (OTT, AI_IDE) and add 'active' status
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Drop old category and status constraints to allow data migration
ALTER TABLE pools DROP CONSTRAINT IF EXISTS pools_category_check;
ALTER TABLE pools DROP CONSTRAINT IF EXISTS pools_status_check;
ALTER TABLE platform_pricing DROP CONSTRAINT IF EXISTS platform_pricing_category_check;
ALTER TABLE memberships DROP CONSTRAINT IF EXISTS memberships_status_check;

-- 2. Update existing category data to match app conventions
UPDATE pools SET category = 'OTT' WHERE category = 'entertainment';
UPDATE pools SET category = 'AI_IDE' WHERE category = 'work';

-- 3. Add new constraints matching app conventions
ALTER TABLE pools ADD CONSTRAINT pools_category_check
  CHECK (category IN ('OTT', 'AI_IDE', 'productivity', 'ai'));

-- 4. Update status constraint to include 'active'
ALTER TABLE pools ADD CONSTRAINT pools_status_check
  CHECK (status IN ('open', 'active', 'full', 'closed'));

-- 5. Update existing platform_pricing data to match new conventions
UPDATE platform_pricing SET category = 'OTT' WHERE category = 'OTT';
UPDATE platform_pricing SET category = 'AI_IDE' WHERE category = 'TEAM_SAAS';

-- 6. Update platform_pricing category constraint to match app
ALTER TABLE platform_pricing ADD CONSTRAINT platform_pricing_category_check
  CHECK (category IN ('OTT', 'AI_IDE', 'productivity', 'ai'));

-- 7. Also add missing columns to pools table if not present
ALTER TABLE pools ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE pools ADD COLUMN IF NOT EXISTS auto_approve boolean DEFAULT false;
ALTER TABLE pools ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 8. Add missing membership status values
ALTER TABLE memberships ADD CONSTRAINT memberships_status_check
  CHECK (status IN ('pending', 'active', 'cancelled', 'expired', 'removed'));
