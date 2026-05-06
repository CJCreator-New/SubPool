-- P1.4: Define `ledger` Schema & Metrics Views

-- Create platforms reference table and seed some data
CREATE TABLE IF NOT EXISTS platforms (
   id TEXT PRIMARY KEY,
   name TEXT NOT NULL,
   icon TEXT NOT NULL,
   category TEXT NOT NULL CHECK (category IN ('Entertainment', 'Work', 'AI', 'Other')),
   created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO platforms (id, name, icon, category)
VALUES 
   ('netflix', 'Netflix', '🍿', 'Entertainment'),
   ('prime', 'Prime Video', '🎬', 'Entertainment'),
   ('disneyplus', 'Disney+', '✨', 'Entertainment'),
   ('youtube', 'YouTube Premium', '▶️', 'Entertainment'),
   ('appletv', 'Apple TV+', '🍎', 'Entertainment'),
   ('spotify', 'Spotify', '🎧', 'Entertainment'),
   ('max', 'Max', ' HBO', 'Entertainment'),
   ('chatgpt', 'ChatGPT', '🤖', 'AI'),
   ('claude', 'Claude', '🧠', 'AI'),
   ('cursor', 'Cursor', '💻', 'AI'),
   ('github_copilot', 'GitHub Copilot', '🤖', 'AI'),
   ('replit', 'Replit', '🌀', 'AI'),
   ('jetbrains', 'JetBrains', '💎', 'AI'),
   ('figma', 'Figma', '🎨', 'Work'),
   ('notion', 'Notion', '📝', 'Work'),
   ('slack', 'Slack', '💬', 'Work'),
   ('linear', 'Linear', '📈', 'Work'),
   ('github_teams', 'GitHub Teams', '🐙', 'Work')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category;

-- Create ledger table
CREATE TABLE IF NOT EXISTS ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pool_id UUID NOT NULL REFERENCES pools(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
    type TEXT NOT NULL CHECK (type IN ('payment', 'refund', 'credit', 'fee')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Handle schema drift
ALTER TABLE ledger ADD COLUMN IF NOT EXISTS pool_id UUID REFERENCES pools(id);
ALTER TABLE ledger ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id);
ALTER TABLE ledger ADD COLUMN IF NOT EXISTS amount_cents INTEGER;
ALTER TABLE ledger ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE ledger ADD COLUMN IF NOT EXISTS status TEXT;

-- Policies
DROP POLICY IF EXISTS "Users can view their own ledger entries" ON ledger;
DROP POLICY IF EXISTS "Pool owners can view pool ledger entries" ON ledger;


-- RLS for ledger
ALTER TABLE ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own ledger entries" ON ledger FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Pool owners can view pool ledger entries" ON ledger FOR SELECT USING (
    EXISTS (SELECT 1 FROM pools WHERE id = ledger.pool_id AND owner_id = auth.uid())
);

-- Create rate_limits table
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address INET,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMPTZ DEFAULT now()
);

-- Handle schema drift
ALTER TABLE rate_limits ADD COLUMN IF NOT EXISTS ip_address INET;
ALTER TABLE rate_limits ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id);
ALTER TABLE rate_limits ADD COLUMN IF NOT EXISTS endpoint TEXT;
ALTER TABLE rate_limits ADD COLUMN IF NOT EXISTS request_count INTEGER;
ALTER TABLE rate_limits ADD COLUMN IF NOT EXISTS window_start TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits (window_start);
CREATE INDEX IF NOT EXISTS idx_rate_limits_user ON rate_limits (user_id);
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip ON rate_limits (ip_address);

-- Create pool_market_metrics materialized view (SKIPPED: using table implementation from 20260305)
-- DROP MATERIALIZED VIEW IF EXISTS pool_market_metrics;
-- CREATE MATERIALIZED VIEW pool_market_metrics AS ...
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_pool_market_metrics_platform ON pool_market_metrics(platform_id);

-- Alter platform_pricing to FK reference platforms.id if not already done
-- Since platform_pricing was created previously without constraint, let's try to add it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'platform_pricing_platform_id_fkey'
  ) THEN
    ALTER TABLE platform_pricing
    ADD CONSTRAINT platform_pricing_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES platforms(id);
  END IF;
END $$;


-- P1.5: Add Cascade Rules & Pagination Logic
-- Add ON DELETE CASCADE to memberships referencing pools
ALTER TABLE memberships DROP CONSTRAINT IF EXISTS memberships_pool_id_fkey;
ALTER TABLE memberships ADD CONSTRAINT memberships_pool_id_fkey FOREIGN KEY (pool_id) REFERENCES pools(id) ON DELETE CASCADE;

-- Add ON DELETE CASCADE to messages referencing pools
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_pool_id_fkey;
ALTER TABLE messages ADD CONSTRAINT messages_pool_id_fkey FOREIGN KEY (pool_id) REFERENCES pools(id) ON DELETE CASCADE;

-- Add ON DELETE CASCADE to wishlist_requests referencing user
ALTER TABLE wishlist_requests DROP CONSTRAINT IF EXISTS wishlist_requests_user_id_fkey;
ALTER TABLE wishlist_requests ADD CONSTRAINT wishlist_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Note: ON DELETE RESTRICT for ledger pool_id was already included in table definition above

-- Implement soft-delete logic for pools
ALTER TABLE pools ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION soft_delete_pool(pool_uuid UUID)
RETURNS VOID AS $$
BEGIN
  -- Verify ownership via RLS or explicit check
  IF EXISTS (SELECT 1 FROM pools WHERE id = pool_uuid AND owner_id = auth.uid()) THEN
    UPDATE pools SET deleted_at = now(), status = 'closed' WHERE id = pool_uuid;
  ELSE
    RAISE EXCEPTION 'Not authorized to delete pool';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
