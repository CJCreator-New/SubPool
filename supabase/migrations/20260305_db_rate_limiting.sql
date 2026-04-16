-- ─── P3-39: API Rate Limiting at Database Level ────────────────────────────
-- Simple limit: max 10 mutations (INSERT/UPDATE) per minute per user on pools/memberships.

-- 1. Create rate limit tracking table
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    action TEXT NOT NULL,
    last_action_at TIMESTAMPTZ DEFAULT now(),
    count INTEGER DEFAULT 1,
    UNIQUE(user_id, action)
);

-- 2. Function to check and update limit
CREATE OR REPLACE FUNCTION check_rate_limit(p_user_id UUID, p_action TEXT, p_max_per_min INTEGER) RETURNS boolean AS $$
DECLARE
    v_record RECORD;
BEGIN
    SELECT * INTO v_record FROM rate_limits WHERE user_id = p_user_id AND action = p_action;
    
    IF NOT FOUND THEN
        INSERT INTO rate_limits (user_id, action, count, last_action_at)
        VALUES (p_user_id, p_action, 1, now());
        RETURN TRUE;
    END IF;

    -- Reset count if > 1 minute
    IF (v_record.last_action_at < now() - INTERVAL '1 minute') THEN
        UPDATE rate_limits SET count = 1, last_action_at = now() 
        WHERE user_id = p_user_id AND action = p_action;
        RETURN TRUE;
    END IF;

    -- Increment and check
    IF (v_record.count < p_max_per_min) THEN
        UPDATE rate_limits SET count = count + 1, last_action_at = now()
        WHERE user_id = p_user_id AND action = p_action;
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger on Pools Mutation
CREATE OR REPLACE FUNCTION trg_pools_rate_limit() RETURNS trigger AS $$
BEGIN
    IF (auth.role() = 'authenticated') THEN
        IF NOT check_rate_limit(auth.uid(), 'pool_mutation', 10) THEN
            RAISE EXCEPTION 'Rate limit exceeded: Max 10 mutations per minute.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_pools_rl ON pools;
CREATE TRIGGER trg_pools_rl
    BEFORE INSERT OR UPDATE ON pools
    FOR EACH ROW EXECUTE PROCEDURE trg_pools_rate_limit();
