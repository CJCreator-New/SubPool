-- ─── Marketing Waitlist Table ────────────────────────────────────────────────
-- Supports WaitlistPage.tsx (Marketing / Early Access / Global Waitlist)

CREATE TABLE IF NOT EXISTS marketing_waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    platform TEXT, -- Optional: platform they are most interested in
    position SERIAL, -- Auto-incrementing position for early access queue
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE marketing_waitlist ENABLE ROW LEVEL SECURITY;

-- Select: Admin only or potentially public for position lookup (if search by email implemented)
CREATE POLICY "marketing_waitlist_admin_select" ON marketing_waitlist
    FOR SELECT USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

-- Insert: Public (anyone can join)
CREATE POLICY "marketing_waitlist_public_insert" ON marketing_waitlist
    FOR INSERT WITH CHECK (true);

-- Index for lookup
CREATE INDEX IF NOT EXISTS idx_marketing_waitlist_email ON marketing_waitlist(email);
