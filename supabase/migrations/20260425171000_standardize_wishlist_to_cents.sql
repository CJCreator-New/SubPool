-- Migration: Standardize wishlist budget to cents
ALTER TABLE wishlist_requests ALTER COLUMN budget_max TYPE integer USING (budget_max * 100)::integer;
COMMENT ON COLUMN wishlist_requests.budget_max IS 'Maximum budget in cents (USD)';
