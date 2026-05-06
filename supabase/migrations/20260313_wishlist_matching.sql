-- P3: Wishlist Auto-Matching
-- Create trigger to invoke match-wishlist edge function when a new pool is created

-- First, create a function that will be called by the trigger
CREATE OR REPLACE FUNCTION notify_new_pool()
RETURNS TRIGGER AS $$
BEGIN
    -- Notify the edge function via webhook (if configured)
    -- The application layer should call the match-wishlist edge function
    -- This trigger just logs that a new pool was created
    PERFORM pg_notify('pool_created', json_build_object(
        'pool_id', NEW.id,
        'platform', NEW.platform,
        'price_per_slot', NEW.price_per_slot,
        'owner_id', NEW.owner_id
    )::text);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on pools table
DROP TRIGGER IF EXISTS trg_notify_new_pool ON pools;
CREATE TRIGGER trg_notify_new_pool
    AFTER INSERT ON pools
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_pool();

-- Create index for faster lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_pools_platform ON pools(platform);
CREATE INDEX IF NOT EXISTS idx_pools_status ON pools(status);

-- Note: To fully enable wishlist matching, you need to:
-- 1. Deploy the match-wishlist edge function: supabase functions deploy match-wishlist
-- 2. Set up a database webhook or use the pg_notify to trigger the edge function
-- 3. Alternatively, call the edge function from your pool creation code in the frontend

-- For now, let's also create a helper function to manually trigger wishlist matching
CREATE OR REPLACE FUNCTION match_wishlist_for_pool(p_pool_id UUID)
RETURNS TABLE(matched_count INT, notification_count INT) AS $$
DECLARE
    v_pool RECORD;
    v_matched_count INT := 0;
    v_notification_count INT := 0;
BEGIN
    -- Get pool info
    SELECT id, platform, price_per_slot, plan_name, owner_id
    INTO v_pool
    FROM pools
    WHERE id = p_pool_id;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT 0, 0;
        RETURN;
    END IF;
    
    -- This is a simplified version - in production, you'd want to call the edge function
    -- For now, we'll just count potential matches
    SELECT COUNT(*)::INT INTO v_matched_count
    FROM wishlist_requests
    WHERE platform = v_pool.platform
      AND status = 'open'
      AND user_id != v_pool.owner_id
      AND budget_max >= v_pool.price_per_slot;
    
    v_notification_count := v_matched_count;
    
    RETURN QUERY SELECT v_matched_count, v_notification_count;
END;
$$ LANGUAGE plpgsql;
