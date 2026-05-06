-- Migration: Standardize wishlist budget to cents
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'wishlist_requests' AND column_name = 'budget_max'
    ) THEN
        BEGIN
            ALTER TABLE wishlist_requests ALTER COLUMN budget_max TYPE integer USING (budget_max * 100)::integer;
            COMMENT ON COLUMN wishlist_requests.budget_max IS 'Maximum budget in cents (USD)';
        EXCEPTION WHEN others THEN
            -- already integer or other issue, skip
            NULL;
        END;
    END IF;
END $$;
