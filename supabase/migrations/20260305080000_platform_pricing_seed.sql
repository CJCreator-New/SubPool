-- ─── P2-23: Platform Pricing Seed Table ─────────────────────────────────────
-- Migrates hardcoded pricing data from client-side pricing-seed.ts into DB.

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

    -- Unique constraint: one row per platform+plan+country+currency+billing_cycle
    UNIQUE (platform_id, plan_name, country_code, currency, billing_cycle)
);

-- ─── Enable RLS (read-only for anon & authenticated) ─────────────────────────

ALTER TABLE platform_pricing ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read pricing data" ON platform_pricing;
CREATE POLICY "Anyone can read pricing data"
    ON platform_pricing
    FOR SELECT
    USING (true);

-- ─── Index for fast lookups ──────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_platform_pricing_lookup
    ON platform_pricing (platform_id, plan_name, currency);

-- ─── Seed Data ───────────────────────────────────────────────────────────────
-- OTT Platforms

INSERT INTO platform_pricing (platform_id, platform_name, category, plan_name, billing_cycle, country_code, currency, official_price, max_seats, min_slots, supports_sharing, sharing_policy, source)
VALUES
-- Netflix
('netflix', 'Netflix', 'OTT', 'Basic', 'monthly', 'US', 'USD', 6.99, 1, 1, false, 'allowed', 'manual'),
('netflix', 'Netflix', 'OTT', 'Standard', 'monthly', 'US', 'USD', 15.49, 2, 2, true, 'allowed', 'manual'),
('netflix', 'Netflix', 'OTT', '4K', 'monthly', 'US', 'USD', 22.99, 4, 2, true, 'allowed', 'manual'),
('netflix', 'Netflix', 'OTT', 'Basic', 'monthly', 'IN', 'INR', 149, 1, 1, false, 'allowed', 'manual'),
('netflix', 'Netflix', 'OTT', 'Standard', 'monthly', 'IN', 'INR', 499, 2, 2, true, 'allowed', 'manual'),
('netflix', 'Netflix', 'OTT', '4K', 'monthly', 'IN', 'INR', 649, 4, 2, true, 'allowed', 'manual'),

-- Prime Video
('prime', 'Prime Video', 'OTT', 'Individual', 'monthly', 'US', 'USD', 8.99, 3, 2, true, 'allowed', 'manual'),
('prime', 'Prime Video', 'OTT', 'Individual', 'monthly', 'IN', 'INR', 299, 3, 2, true, 'allowed', 'manual'),

-- Disney+
('disneyplus', 'Disney+', 'OTT', 'Premium', 'monthly', 'US', 'USD', 7.99, 4, 2, true, 'allowed', 'manual'),
('disneyplus', 'Disney+ Hotstar', 'OTT', 'Mobile', 'monthly', 'IN', 'INR', 149, 1, 1, false, 'allowed', 'manual'),
('disneyplus', 'Disney+ Hotstar', 'OTT', 'Super', 'monthly', 'IN', 'INR', 299, 2, 2, true, 'allowed', 'manual'),
('disneyplus', 'Disney+ Hotstar', 'OTT', 'Premium', 'monthly', 'IN', 'INR', 499, 4, 2, true, 'allowed', 'manual'),

-- YouTube Premium
('youtube', 'YouTube Premium', 'OTT', 'Individual', 'monthly', 'US', 'USD', 13.99, 1, 1, false, 'allowed', 'manual'),
('youtube', 'YouTube Premium', 'OTT', 'Family', 'monthly', 'US', 'USD', 22.99, 5, 2, true, 'allowed', 'manual'),
('youtube', 'YouTube Premium', 'OTT', 'Individual', 'monthly', 'IN', 'INR', 129, 1, 1, false, 'allowed', 'manual'),
('youtube', 'YouTube Premium', 'OTT', 'Family', 'monthly', 'IN', 'INR', 189, 5, 2, true, 'allowed', 'manual'),

-- Apple TV+
('appletv', 'Apple TV+', 'OTT', 'Individual', 'monthly', 'US', 'USD', 9.99, 6, 2, true, 'allowed', 'manual'),
('appletv', 'Apple TV+', 'OTT', 'Individual', 'monthly', 'IN', 'INR', 99, 6, 2, true, 'allowed', 'manual'),

-- Spotify
('spotify', 'Spotify', 'OTT', 'Individual', 'monthly', 'US', 'USD', 10.99, 1, 1, false, 'allowed', 'manual'),
('spotify', 'Spotify', 'OTT', 'Duo', 'monthly', 'US', 'USD', 14.99, 2, 2, true, 'allowed', 'manual'),
('spotify', 'Spotify', 'OTT', 'Family', 'monthly', 'US', 'USD', 16.99, 6, 2, true, 'allowed', 'manual'),
('spotify', 'Spotify', 'OTT', 'Individual', 'monthly', 'IN', 'INR', 119, 1, 1, false, 'allowed', 'manual'),
('spotify', 'Spotify', 'OTT', 'Duo', 'monthly', 'IN', 'INR', 149, 2, 2, true, 'allowed', 'manual'),
('spotify', 'Spotify', 'OTT', 'Family', 'monthly', 'IN', 'INR', 179, 6, 2, true, 'allowed', 'manual'),

-- Max
('max', 'Max', 'OTT', 'Ad-lite', 'monthly', 'US', 'USD', 9.99, 2, 2, true, 'allowed', 'manual'),
('max', 'Max', 'OTT', 'Ad-free', 'monthly', 'US', 'USD', 15.99, 2, 2, true, 'allowed', 'manual'),
('max', 'Max', 'OTT', 'Ultimate', 'monthly', 'US', 'USD', 19.99, 3, 2, true, 'allowed', 'manual'),

-- AI / IDE Platforms
-- ChatGPT
('chatgpt', 'ChatGPT', 'AI_IDE', 'Plus', 'monthly', 'US', 'USD', 20, 1, 1, true, 'grey_area', 'manual'),
('chatgpt', 'ChatGPT', 'AI_IDE', 'Team', 'monthly', 'US', 'USD', 25, 2, 2, true, 'not_recommended', 'manual'),
('chatgpt', 'ChatGPT', 'AI_IDE', 'Plus', 'monthly', 'IN', 'USD', 20, 1, 1, true, 'grey_area', 'manual'),
('chatgpt', 'ChatGPT', 'AI_IDE', 'Team', 'monthly', 'IN', 'USD', 25, 2, 2, true, 'not_recommended', 'manual'),

-- Claude
('claude', 'Claude', 'AI_IDE', 'Pro', 'monthly', 'US', 'USD', 20, 1, 1, true, 'grey_area', 'manual'),
('claude', 'Claude', 'AI_IDE', 'Team', 'monthly', 'US', 'USD', 25, 5, 2, true, 'not_recommended', 'manual'),
('claude', 'Claude', 'AI_IDE', 'Pro', 'monthly', 'IN', 'USD', 20, 1, 1, true, 'grey_area', 'manual'),
('claude', 'Claude', 'AI_IDE', 'Team', 'monthly', 'IN', 'USD', 25, 5, 2, true, 'not_recommended', 'manual'),

-- Cursor
('cursor', 'Cursor', 'AI_IDE', 'Pro', 'monthly', 'US', 'USD', 20, 1, 1, true, 'grey_area', 'manual'),
('cursor', 'Cursor', 'AI_IDE', 'Business', 'monthly', 'US', 'USD', 40, NULL, 2, true, 'not_recommended', 'manual'),
('cursor', 'Cursor', 'AI_IDE', 'Pro', 'monthly', 'IN', 'USD', 20, 1, 1, true, 'grey_area', 'manual'),
('cursor', 'Cursor', 'AI_IDE', 'Business', 'monthly', 'IN', 'USD', 40, NULL, 2, true, 'not_recommended', 'manual'),

-- GitHub Copilot
('github_copilot', 'GitHub Copilot', 'AI_IDE', 'Individual', 'monthly', 'US', 'USD', 10, 1, 1, true, 'grey_area', 'manual'),
('github_copilot', 'GitHub Copilot', 'AI_IDE', 'Business', 'monthly', 'US', 'USD', 19, NULL, 2, true, 'not_recommended', 'manual'),
('github_copilot', 'GitHub Copilot', 'AI_IDE', 'Individual', 'monthly', 'IN', 'USD', 10, 1, 1, true, 'grey_area', 'manual'),
('github_copilot', 'GitHub Copilot', 'AI_IDE', 'Business', 'monthly', 'IN', 'USD', 19, NULL, 2, true, 'not_recommended', 'manual'),

-- Replit
('replit', 'Replit', 'AI_IDE', 'Core', 'monthly', 'US', 'USD', 20, 1, 1, true, 'grey_area', 'manual'),
('replit', 'Replit', 'AI_IDE', 'Teams', 'monthly', 'US', 'USD', 26, NULL, 2, true, 'not_recommended', 'manual'),
('replit', 'Replit', 'AI_IDE', 'Core', 'monthly', 'IN', 'USD', 20, 1, 1, true, 'grey_area', 'manual'),
('replit', 'Replit', 'AI_IDE', 'Teams', 'monthly', 'IN', 'USD', 26, NULL, 2, true, 'not_recommended', 'manual'),

-- JetBrains
('jetbrains', 'JetBrains', 'AI_IDE', 'All Products Pack', 'monthly', 'US', 'USD', 28.90, 1, 1, true, 'grey_area', 'manual'),
('jetbrains', 'JetBrains', 'AI_IDE', 'All Products Pack', 'monthly', 'IN', 'USD', 28.90, 1, 1, true, 'grey_area', 'manual'),

-- Team SaaS
-- Figma
('figma', 'Figma', 'TEAM_SAAS', 'Starter', 'monthly', 'US', 'USD', 0, 1, 1, false, 'not_recommended', 'manual'),
('figma', 'Figma', 'TEAM_SAAS', 'Professional', 'monthly', 'US', 'USD', 15, NULL, 2, true, 'not_recommended', 'manual'),
('figma', 'Figma', 'TEAM_SAAS', 'Org', 'monthly', 'US', 'USD', 45, NULL, 2, true, 'not_recommended', 'manual'),
('figma', 'Figma', 'TEAM_SAAS', 'Starter', 'monthly', 'IN', 'USD', 0, 1, 1, false, 'not_recommended', 'manual'),
('figma', 'Figma', 'TEAM_SAAS', 'Professional', 'monthly', 'IN', 'USD', 15, NULL, 2, true, 'not_recommended', 'manual'),
('figma', 'Figma', 'TEAM_SAAS', 'Org', 'monthly', 'IN', 'USD', 45, NULL, 2, true, 'not_recommended', 'manual'),

-- Notion
('notion', 'Notion', 'TEAM_SAAS', 'Plus', 'monthly', 'US', 'USD', 10, NULL, 2, true, 'not_recommended', 'manual'),
('notion', 'Notion', 'TEAM_SAAS', 'Business', 'monthly', 'US', 'USD', 18, NULL, 2, true, 'not_recommended', 'manual'),
('notion', 'Notion', 'TEAM_SAAS', 'Plus', 'monthly', 'IN', 'USD', 10, NULL, 2, true, 'not_recommended', 'manual'),
('notion', 'Notion', 'TEAM_SAAS', 'Business', 'monthly', 'IN', 'USD', 18, NULL, 2, true, 'not_recommended', 'manual'),

-- Slack
('slack', 'Slack', 'TEAM_SAAS', 'Pro', 'monthly', 'US', 'USD', 8.75, NULL, 2, true, 'not_recommended', 'manual'),
('slack', 'Slack', 'TEAM_SAAS', 'Business+', 'monthly', 'US', 'USD', 15, NULL, 2, true, 'not_recommended', 'manual'),
('slack', 'Slack', 'TEAM_SAAS', 'Pro', 'monthly', 'IN', 'USD', 8.75, NULL, 2, true, 'not_recommended', 'manual'),
('slack', 'Slack', 'TEAM_SAAS', 'Business+', 'monthly', 'IN', 'USD', 15, NULL, 2, true, 'not_recommended', 'manual'),

-- Linear
('linear', 'Linear', 'TEAM_SAAS', 'Basic', 'monthly', 'US', 'USD', 0, 1, 1, false, 'not_recommended', 'manual'),
('linear', 'Linear', 'TEAM_SAAS', 'Plus', 'monthly', 'US', 'USD', 10, NULL, 2, true, 'not_recommended', 'manual'),
('linear', 'Linear', 'TEAM_SAAS', 'Basic', 'monthly', 'IN', 'USD', 0, 1, 1, false, 'not_recommended', 'manual'),
('linear', 'Linear', 'TEAM_SAAS', 'Plus', 'monthly', 'IN', 'USD', 10, NULL, 2, true, 'not_recommended', 'manual'),

-- GitHub Teams
('github_teams', 'GitHub Teams', 'TEAM_SAAS', 'Teams', 'monthly', 'US', 'USD', 4, NULL, 2, true, 'not_recommended', 'manual'),
('github_teams', 'GitHub Teams', 'TEAM_SAAS', 'Teams', 'monthly', 'IN', 'USD', 4, NULL, 2, true, 'not_recommended', 'manual')

ON CONFLICT (platform_id, plan_name, country_code, currency, billing_cycle) DO UPDATE SET
    platform_name = EXCLUDED.platform_name,
    category = EXCLUDED.category,
    official_price = EXCLUDED.official_price,
    price_per_seat = EXCLUDED.price_per_seat,
    max_seats = EXCLUDED.max_seats,
    min_slots = EXCLUDED.min_slots,
    supports_sharing = EXCLUDED.supports_sharing,
    sharing_policy = EXCLUDED.sharing_policy,
    source = EXCLUDED.source,
    updated_at = now();

