-- ─── SUBSCRIPTION CATEGORIES INTEGRATION ───────────────────────────────────────
-- Phase 1: Hierarchical Categorization & Extended Platform Metadata

-- 1. ENUMS FOR SHARING & RISK
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sharing_type_enum') THEN
        CREATE TYPE sharing_type_enum AS ENUM (
            'family_invite', 
            'credential_share', 
            'seat_assignment', 
            'multi_room_add_on', 
            'household_share'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tos_risk_enum') THEN
        CREATE TYPE tos_risk_enum AS ENUM ('safe', 'grey_area', 'risky');
    END IF;
END $$;

-- 2. CATEGORIES & SUBCATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name            TEXT NOT NULL,
    slug            TEXT UNIQUE NOT NULL,
    icon            TEXT,
    color           TEXT,
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subcategories (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id     UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
    name            TEXT NOT NULL,
    slug            TEXT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE(category_id, slug)
);

-- 3. PLATFORMS EVOLUTION
-- Add new columns to existing platforms table
ALTER TABLE platforms ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE platforms ADD COLUMN IF NOT EXISTS brand_color TEXT;
ALTER TABLE platforms ADD COLUMN IF NOT EXISTS sharing_type sharing_type_enum DEFAULT 'credential_share';
ALTER TABLE platforms ADD COLUMN IF NOT EXISTS max_pool_size INTEGER DEFAULT 1;
ALTER TABLE platforms ADD COLUMN IF NOT EXISTS retail_price_inr NUMERIC(12,2);
ALTER TABLE platforms ADD COLUMN IF NOT EXISTS retail_price_usd NUMERIC(12,2);
ALTER TABLE platforms ADD COLUMN IF NOT EXISTS tos_risk_level tos_risk_enum DEFAULT 'grey_area';
ALTER TABLE platforms ADD COLUMN IF NOT EXISTS requires_same_location BOOLEAN DEFAULT FALSE;
ALTER TABLE platforms ADD COLUMN IF NOT EXISTS hardware_required BOOLEAN DEFAULT FALSE;
ALTER TABLE platforms ADD COLUMN IF NOT EXISTS access_method TEXT;
ALTER TABLE platforms ADD COLUMN IF NOT EXISTS compliance_note TEXT;
ALTER TABLE platforms ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES subcategories(id);

-- 4. SEED CATEGORIES DATA
INSERT INTO categories (name, slug, icon, color, sort_order)
VALUES 
    ('AI Tools', 'ai-tools', '🤖', '#7C3AED', 1),
    ('Education', 'education', '📚', '#2563EB', 2),
    ('Video Streaming', 'video-streaming', '🎬', '#DC2626', 3),
    ('Music', 'music', '🎵', '#059669', 4),
    ('Gaming', 'gaming', '🎮', '#D97706', 5),
    ('DTH & TV', 'dth-tv', '📡', '#0891B2', 6),
    ('Family Plans', 'family-plans', '👨‍👩‍👧‍👦', '#DB2777', 7),
    ('Productivity', 'productivity', '💼', '#64748B', 8),
    ('Cloud Storage', 'cloud-storage', '☁️', '#0EA5E9', 9),
    ('VPN & Security', 'vpn-security', '🔒', '#16A34A', 10)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    sort_order = EXCLUDED.sort_order;

-- 5. RLS POLICIES
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_read_public" ON categories;
CREATE POLICY "categories_read_public" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "subcategories_read_public" ON subcategories;
CREATE POLICY "subcategories_read_public" ON subcategories FOR SELECT USING (true);
