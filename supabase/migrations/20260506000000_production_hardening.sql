-- ─── PHASE 7: PRODUCTION HARDENING ──────────────────────────────────────────────
-- Covers: Payout Requests table, Advanced RLS Policies, Audit Logging

-- 1. PAYOUT REQUESTS TABLE
CREATE TABLE IF NOT EXISTS payout_requests (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    amount          NUMERIC(12,2) NOT NULL CHECK (amount >= 10.00),
    currency        TEXT DEFAULT 'USD',
    status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    bank_details    JSONB, -- Encrypted or redacted for security
    created_at      TIMESTAMPTZ DEFAULT now(),
    paid_at         TIMESTAMPTZ,
    admin_note      TEXT
);

ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payout_read_own" ON payout_requests;
CREATE POLICY "payout_read_own" ON payout_requests FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "payout_insert_own" ON payout_requests;
CREATE POLICY "payout_insert_own" ON payout_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id AND status = 'pending');

DROP POLICY IF EXISTS "payout_admin_all" ON payout_requests;
CREATE POLICY "payout_admin_all" ON payout_requests FOR ALL
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));


-- 2. RATINGS & REVIEWS RLS
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ratings_read_public" ON ratings;
CREATE POLICY "ratings_read_public" ON ratings FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "ratings_insert_member" ON ratings;
CREATE POLICY "ratings_insert_member" ON ratings FOR INSERT
    WITH CHECK (auth.uid() = rater_id);

DROP POLICY IF EXISTS "ratings_update_own" ON ratings;
CREATE POLICY "ratings_update_own" ON ratings FOR UPDATE
    USING (auth.uid() = rater_id);


-- 3. AUDIT LOGGING FOR FINANCIALS
CREATE TABLE IF NOT EXISTS financial_audit_log (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    actor_id        UUID REFERENCES profiles(id),
    action          TEXT NOT NULL, -- 'PAYOUT_APPROVED', 'LEDGER_ADJUSTED', etc.
    target_id       UUID, -- ID of the payout or ledger entry
    payload         JSONB,
    created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE financial_audit_log ENABLE ROW LEVEL SECURITY;
-- Admin only
CREATE POLICY "admin_only_audit" ON financial_audit_log FOR SELECT
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));


-- 4. POOL VISIBILITY HARDENING
-- Ensure deleted pools or private pools aren't leaked in general select
DROP POLICY IF EXISTS "Pools are viewable by everyone" ON pools;
CREATE POLICY "Pools are viewable by everyone" ON pools FOR SELECT
    USING (deleted_at IS NULL AND (status = 'open' OR auth.uid() = owner_id));


-- 5. MESSAGES RLS HARDENING
-- Only members of the pool can see messages
DROP POLICY IF EXISTS "Messages are viewable by pool members" ON messages;
CREATE POLICY "Messages are viewable by pool members" ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM memberships 
            WHERE pool_id = messages.pool_id 
              AND user_id = auth.uid() 
              AND status = 'active'
        ) OR EXISTS (
            SELECT 1 FROM pools 
            WHERE id = messages.pool_id 
              AND owner_id = auth.uid()
        )
    );


-- 6. WAITLIST RLS
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "waitlist_read_own" ON waitlist;
CREATE POLICY "waitlist_read_own" ON waitlist FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "waitlist_insert_own" ON waitlist;
CREATE POLICY "waitlist_insert_own" ON waitlist FOR INSERT
    WITH CHECK (auth.uid() = user_id);
