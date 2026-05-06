-- ─── P3.3: Waitlist System for Full Pools ─────────────────────────────────────

-- 1. Create waitlist table with ordered positions
CREATE TABLE IF NOT EXISTS waitlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pool_id UUID REFERENCES pools(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    position INTEGER NOT NULL,           -- 1-indexed ordered slot position
    status TEXT DEFAULT 'waiting'
        CHECK (status IN ('waiting', 'promoted', 'expired', 'cancelled')),
    notified_at TIMESTAMPTZ,             -- when user was pinged that a slot opened
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (pool_id, user_id)            -- one waitlist entry per user per pool
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Read: pool owners can see their waitlist; users can see their own entries
DROP POLICY IF EXISTS "waitlist_read" ON waitlist;
DROP POLICY IF EXISTS "waitlist_read" ON waitlist;
DROP POLICY IF EXISTS "waitlist_read" ON waitlist;
CREATE POLICY "waitlist_read" ON waitlist FOR SELECT
    USING (
        auth.uid() = user_id
        OR auth.uid() = (SELECT owner_id FROM pools WHERE id = pool_id)
    );

-- Insert: any authenticated user can join the waitlist for a pool they don't own
DROP POLICY IF EXISTS "waitlist_insert" ON waitlist;
DROP POLICY IF EXISTS "waitlist_insert" ON waitlist;
DROP POLICY IF EXISTS "waitlist_insert" ON waitlist;
CREATE POLICY "waitlist_insert" ON waitlist FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND auth.uid() != (SELECT owner_id FROM pools WHERE id = pool_id)
    );

-- Update: only the pool owner can change waitlist status (e.g., promote)
DROP POLICY IF EXISTS "waitlist_owner_update" ON waitlist;
DROP POLICY IF EXISTS "waitlist_owner_update" ON waitlist;
DROP POLICY IF EXISTS "waitlist_owner_update" ON waitlist;
CREATE POLICY "waitlist_owner_update" ON waitlist FOR UPDATE
    USING (
        auth.uid() = (SELECT owner_id FROM pools WHERE id = pool_id)
        OR auth.uid() = user_id  -- user can cancel their own spot
    );

-- Delete: user can remove themselves; owner can remove anyone
DROP POLICY IF EXISTS "waitlist_delete" ON waitlist;
DROP POLICY IF EXISTS "waitlist_delete" ON waitlist;
DROP POLICY IF EXISTS "waitlist_delete" ON waitlist;
CREATE POLICY "waitlist_delete" ON waitlist FOR DELETE
    USING (
        auth.uid() = user_id
        OR auth.uid() = (SELECT owner_id FROM pools WHERE id = pool_id)
    );

-- 2. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_waitlist_pool ON waitlist(pool_id, position);
CREATE INDEX IF NOT EXISTS idx_waitlist_user ON waitlist(user_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist(status);

-- 3. Function: get_next_waitlist_position
-- Atomically assigns the next position when a user joins the waitlist
CREATE OR REPLACE FUNCTION get_next_waitlist_position(p_pool_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_next_pos INTEGER;
BEGIN
    SELECT COALESCE(MAX(position), 0) + 1
    INTO v_next_pos
    FROM waitlist
    WHERE pool_id = p_pool_id
      AND status = 'waiting';
    RETURN v_next_pos;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Function: join_waitlist — convenience RPC callable from frontend
CREATE OR REPLACE FUNCTION join_waitlist(p_pool_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_position INTEGER;
    v_pool_status TEXT;
BEGIN
    -- Ensure pool is full (only allow waitlist on full pools)
    SELECT status INTO v_pool_status FROM pools WHERE id = p_pool_id;

    IF v_pool_status NOT IN ('full', 'closed') THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Pool is not full — join directly instead.');
    END IF;

    -- Check not already in waitlist
    IF EXISTS (SELECT 1 FROM waitlist WHERE pool_id = p_pool_id AND user_id = auth.uid() AND status = 'waiting') THEN
        RETURN jsonb_build_object('ok', false, 'error', 'You are already on the waitlist for this pool.');
    END IF;

    v_position := get_next_waitlist_position(p_pool_id);

    INSERT INTO waitlist (pool_id, user_id, position, status)
    VALUES (p_pool_id, auth.uid(), v_position, 'waiting');

    -- Notify the user
    INSERT INTO notifications (user_id, type, icon, title, body, action_url)
    VALUES (
        auth.uid(),
        'waitlist',
        '⏳',
        'Added to Waitlist',
        'You are #' || v_position || ' on the waitlist. We''ll notify you when a slot opens.',
        '/my-pools'
    );

    RETURN jsonb_build_object('ok', true, 'position', v_position);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Function: promote_from_waitlist
-- Called when a slot opens (e.g., membership is cancelled). Promotes #1 on the waitlist.
CREATE OR REPLACE FUNCTION promote_from_waitlist(p_pool_id UUID)
RETURNS VOID AS $$
DECLARE
    v_next RECORD;
BEGIN
    -- Find the top-positioned waiting user
    SELECT * INTO v_next
    FROM waitlist
    WHERE pool_id = p_pool_id AND status = 'waiting'
    ORDER BY position ASC
    LIMIT 1;

    IF FOUND THEN
        -- Mark as promoted
        UPDATE waitlist SET status = 'promoted', notified_at = now()
        WHERE id = v_next.id;

        -- Send notification
        INSERT INTO notifications (user_id, type, icon, title, body, action_url)
        VALUES (
            v_next.user_id,
            'slot_available',
            '🎉',
            'A Slot Just Opened!',
            'You''ve been promoted from the waitlist. Claim your spot before it''s taken.',
            '/browse'
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger: auto-promote from waitlist when a membership slot opens up
CREATE OR REPLACE FUNCTION trg_promote_on_slot_open() RETURNS trigger AS $$
BEGIN
    -- When a membership is removed/cancelled, check if there's a waitlist
    IF TG_OP = 'UPDATE' AND OLD.status = 'active' AND NEW.status IN ('removed', 'cancelled', 'expired') THEN
        PERFORM promote_from_waitlist(NEW.pool_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_membership_slot_freed ON memberships;
CREATE TRIGGER trg_membership_slot_freed
    AFTER UPDATE ON memberships
    FOR EACH ROW
    EXECUTE PROCEDURE trg_promote_on_slot_open();
