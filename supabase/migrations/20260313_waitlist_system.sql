-- P3: Waitlist System
-- Create dedicated waitlist table for pools that are full

-- Create waitlist table
CREATE TABLE IF NOT EXISTS pool_waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pool_id UUID NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT now(),
    notified_at TIMESTAMPTZ,
    status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'joined', 'expired', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(pool_id, user_id)
);

-- Enable RLS
ALTER TABLE pool_waitlist ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can read waitlist positions for a pool (public transparency)
DROP POLICY IF EXISTS "waitlist_read" ON pool_waitlist;
CREATE POLICY "waitlist_read" ON pool_waitlist FOR SELECT USING (true);

-- Users can insert themselves into waitlist
DROP POLICY IF EXISTS "waitlist_insert" ON pool_waitlist;
CREATE POLICY "waitlist_insert" ON pool_waitlist 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own waitlist entries
DROP POLICY IF EXISTS "waitlist_update" ON pool_waitlist;
CREATE POLICY "waitlist_update" ON pool_waitlist 
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete (leave) their own waitlist entries
DROP POLICY IF EXISTS "waitlist_delete" ON pool_waitlist;
CREATE POLICY "waitlist_delete" ON pool_waitlist 
    FOR DELETE USING (auth.uid() = user_id);

-- Pool owners can view all waitlist entries for their pools
DROP POLICY IF EXISTS "waitlist_owner_read" ON pool_waitlist;
CREATE POLICY "waitlist_owner_read" ON pool_waitlist FOR SELECT
    USING (
        pool_id IN (
            SELECT id FROM pools WHERE owner_id = auth.uid()
        )
    );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_waitlist_pool_id ON pool_waitlist(pool_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_user_id ON pool_waitlist(user_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_position ON pool_waitlist(pool_id, position);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON pool_waitlist(status);

-- Function to get next waitlist position for a pool
CREATE OR REPLACE FUNCTION get_next_waitlist_position(p_pool_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_next_position INTEGER;
BEGIN
    SELECT COALESCE(MAX(position), 0) + 1 INTO v_next_position
    FROM pool_waitlist
    WHERE pool_id = p_pool_id AND status = 'waiting';
    
    RETURN v_next_position;
END;
$$ LANGUAGE plpgsql;

-- Function to join waitlist (handles position assignment)
CREATE OR REPLACE FUNCTION join_waitlist(p_pool_id UUID, p_user_id UUID)
RETURNS TABLE(position INTEGER, already_waiting BOOLEAN) AS $$
DECLARE
    v_position INTEGER;
    v_already_waiting BOOLEAN := FALSE;
BEGIN
    -- Check if user is already on waitlist
    SELECT CASE WHEN COUNT(*) > 0 THEN TRUE ELSE FALSE END, MAX(position)
    INTO v_already_waiting, v_position
    FROM pool_waitlist
    WHERE pool_id = p_pool_id 
      AND user_id = p_user_id 
      AND status = 'waiting';
    
    IF v_already_waiting THEN
        -- User already waiting, return their position
        RETURN QUERY SELECT v_position, TRUE;
    ELSE
        -- Get next position and insert
        v_position := get_next_waitlist_position(p_pool_id);
        
        INSERT INTO pool_waitlist (pool_id, user_id, position, status)
        VALUES (p_pool_id, p_user_id, v_position, 'waiting')
        ON CONFLICT (pool_id, user_id) 
        DO UPDATE SET position = EXCLUDED.position, status = 'waiting', updated_at = now();
        
        RETURN QUERY SELECT v_position, FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's waitlist position for a pool
CREATE OR REPLACE FUNCTION get_waitlist_position(p_pool_id UUID, p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_position INTEGER;
BEGIN
    SELECT position INTO v_position
    FROM pool_waitlist
    WHERE pool_id = p_pool_id 
      AND user_id = p_user_id 
      AND status = 'waiting';
    
    RETURN v_position;
END;
$$ LANGUAGE plpgsql;

-- Function to get waitlist count for a pool
CREATE OR REPLACE FUNCTION get_waitlist_count(p_pool_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM pool_waitlist
    WHERE pool_id = p_pool_id AND status = 'waiting';
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Function to promote waitlist (call when a slot opens)
CREATE OR REPLACE FUNCTION promote_waitlist(p_pool_id UUID)
RETURNS TABLE(user_id UUID, position INTEGER) AS $$
DECLARE
    v_next_user RECORD;
BEGIN
    -- Get the next person in line
    SELECT user_id, position INTO v_next_user
    FROM pool_waitlist
    WHERE pool_id = p_pool_id AND status = 'waiting'
    ORDER BY position ASC
    LIMIT 1;
    
    IF FOUND THEN
        -- Update their status to notified
        UPDATE pool_waitlist
        SET status = 'notified', 
            notified_at = now(), 
            updated_at = now()
        WHERE pool_id = p_pool_id 
          AND user_id = v_next_user.user_id;
        
        -- Reorder remaining positions
        UPDATE pool_waitlist
        SET position = new_position
        FROM (
            SELECT id, ROW_NUMBER() OVER (ORDER BY position) AS new_position
            FROM pool_waitlist
            WHERE pool_id = p_pool_id AND status = 'waiting'
        ) AS reordered
        WHERE pool_waitlist.id = reordered.id;
        
        RETURN QUERY SELECT v_next_user.user_id, v_next_user.position;
    END IF;
END;
$$ LANGUAGE plpgsql;
