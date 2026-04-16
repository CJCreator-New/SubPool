-- 1. Add missing columns to the pools table (category, auto_approve, description)
ALTER TABLE pools 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS auto_approve BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS description TEXT;

-- 2. Add avatar_color to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar_color TEXT DEFAULT '#C8F135';

-- 3. Create wishlist_requests table
CREATE TABLE IF NOT EXISTS wishlist_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    budget_max NUMERIC,
    urgency TEXT CHECK (urgency IN ('low','medium','high')),
    status TEXT DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE wishlist_requests ENABLE ROW LEVEL SECURITY;

-- 4. Create trigger update_pools_search_vector
CREATE OR REPLACE FUNCTION pools_search_vector_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.platform, '') || ' ' || 
    COALESCE(NEW.plan_name, '') || ' ' || 
    COALESCE(NEW.category, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_pools_search_vector ON pools;

CREATE TRIGGER tr_pools_search_vector
BEFORE INSERT OR UPDATE ON pools
FOR EACH ROW EXECUTE FUNCTION pools_search_vector_trigger();

-- 5. Re-create the GIN index on pools.search_vector
DROP INDEX IF EXISTS idx_pools_search_vector;
CREATE INDEX idx_pools_search_vector ON pools USING GIN (search_vector);
