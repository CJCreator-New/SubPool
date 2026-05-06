-- PHASE 4.1: DISCOVERY & SEARCH ENHANCEMENTS

-- 1. Full-Text Search for Pools
-- Add search_vector for efficient platform/plan/owner searching
ALTER TABLE pools ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Function to update search_vector
CREATE OR REPLACE FUNCTION pools_search_vector_update() RETURNS trigger AS $$
BEGIN
  -- We need the owner's username for the vector, so we join or use a subquery
  -- For triggers, it's safer to just include platform and plan_name
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.platform, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.plan_name, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for search vector
DROP TRIGGER IF EXISTS tr_pools_search_vector ON pools;
CREATE TRIGGER tr_pools_search_vector
BEFORE INSERT OR UPDATE OF platform, plan_name ON pools
FOR EACH ROW EXECUTE PROCEDURE pools_search_vector_update();

-- Update existing rows
UPDATE pools SET search_vector = 
  setweight(to_tsvector('english', coalesce(platform, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(plan_name, '')), 'B');

CREATE INDEX IF NOT EXISTS idx_pools_search ON pools USING GIN(search_vector);


-- 2. Watched Platforms (Wishlist Alerts)
CREATE TABLE IF NOT EXISTS user_watched_platforms (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    platform_id text NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, platform_id)
);

ALTER TABLE user_watched_platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "watch_own_read" ON user_watched_platforms 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "watch_own_insert" ON user_watched_platforms 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "watch_own_delete" ON user_watched_platforms 
    FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_watch_user ON user_watched_platforms(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_platform ON user_watched_platforms(platform_id);


-- 3. Automatic Notifications for Watched Platforms
-- Trigger to notify watchers when a new pool is created
CREATE OR REPLACE FUNCTION notify_platform_watchers() RETURNS trigger AS $$
BEGIN
    INSERT INTO notifications (user_id, type, title, body, icon, action_url)
    SELECT 
        user_id, 
        'info', 
        'New Pool Alert!', 
        'A new pool for ' || NEW.platform || ' (' || NEW.plan_name || ') just initialized.',
        '🚀',
        '/browse?q=' || NEW.platform
    FROM user_watched_platforms
    WHERE platform_id = NEW.platform;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_notify_watchers ON pools;
CREATE TRIGGER tr_notify_watchers
AFTER INSERT ON pools
FOR EACH ROW EXECUTE PROCEDURE notify_platform_watchers();
