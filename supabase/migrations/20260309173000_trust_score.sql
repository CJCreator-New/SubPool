-- P2.2: Trust Score System
-- Add data points to profiles to allow computation of a dynamic trust score.

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS total_hosted INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS disputes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS avg_response_time_mins INTEGER DEFAULT 120;

-- Function to automatically calculate the trust rating
CREATE OR REPLACE FUNCTION calculate_trust_score()
RETURNS TRIGGER AS $$
DECLARE
    computed_rating NUMERIC;
BEGIN
    -- Baseline computation for demo: start at 5.0
    -- Deduct 0.3 for each dispute
    -- Add 0.1 for every 5 successfully hosted pools (capped at 5.0)
    computed_rating := 5.0 - (NEW.disputes * 0.3) + (NEW.total_hosted / 5.0 * 0.1);

    IF computed_rating > 5.0 THEN 
        computed_rating := 5.0; 
    END IF;
    IF computed_rating < 0.0 THEN 
        computed_rating := 0.0; 
    END IF;
    
    -- Round to 1 decimal place
    NEW.rating := ROUND(computed_rating, 1);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Hook into any updates to disputes or total_hosted
DROP TRIGGER IF EXISTS trg_update_trust_score ON profiles;
CREATE TRIGGER trg_update_trust_score
BEFORE UPDATE ON profiles
FOR EACH ROW 
WHEN (NEW.disputes IS DISTINCT FROM OLD.disputes OR NEW.total_hosted IS DISTINCT FROM OLD.total_hosted)
EXECUTE FUNCTION calculate_trust_score();
