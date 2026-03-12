-- ─── P3-36: Full-text Search for Pools ─────────────────────────────────────
-- Implements high-performance search using Postgres tsvector and GIN index.

-- 1. Add the search_vector column
ALTER TABLE pools ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 2. Create GIN index for fast searching
CREATE INDEX IF NOT EXISTS idx_pools_search ON pools USING GIN (search_vector);

-- 3. Create a trigger function to automatically update the search_vector
CREATE OR REPLACE FUNCTION pools_search_vector_update() RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', coalesce(NEW.platform, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.plan_name, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(NEW.category, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create the trigger
DROP TRIGGER IF EXISTS trg_pools_search_vector_update ON pools;
CREATE TRIGGER trg_pools_search_vector_update
    BEFORE INSERT OR UPDATE ON pools
    FOR EACH ROW EXECUTE PROCEDURE pools_search_vector_update();

-- 5. Backfill existing data
UPDATE pools SET search_vector = 
    setweight(to_tsvector('english', coalesce(platform, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(plan_name, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(category, '')), 'C');
