-- ─── Phase 4 + 5 + 6 Backend Migrations ────────────────────────────────────────
-- Covers: P4.1 Host Earnings, P4.3 Chat Enhancements, P4.4 Onboarding flags,
--         P5.1 Type safety helpers, P6.1 Admin views, P6.2 Referral system

-- ═══════════════════════════════════════════════════════════════════════════════
-- P4.1: HOST EARNINGS SUMMARY VIEW & get_monthly_earnings() FUNCTION
-- ═══════════════════════════════════════════════════════════════════════════════

-- View: summarises per-pool earnings for a host from the ledger
CREATE OR REPLACE VIEW host_earnings_summary AS
SELECT
    p.owner_id                                          AS host_id,
    p.id                                                AS pool_id,
    p.platform,
    p.plan_name,
    COUNT(l.id) FILTER (WHERE l.status = 'paid')        AS paid_count,
    COUNT(l.id) FILTER (WHERE l.status = 'owed')        AS pending_count,
    COALESCE(SUM(l.amount) FILTER (WHERE l.status = 'paid'), 0)   AS total_earned,
    COALESCE(SUM(l.amount) FILTER (WHERE l.status = 'owed'), 0)   AS total_pending,
    MAX(l.paid_at)                                      AS last_payout_at
FROM pools p
JOIN memberships m  ON m.pool_id = p.id AND m.status = 'active'
JOIN ledger l       ON l.membership_id = m.id
GROUP BY p.owner_id, p.id, p.platform, p.plan_name;

-- RLS-friendly: query always filtered by caller
-- (View inherits the caller's RLS session; use service role for admin)

-- Function: get_monthly_earnings — returns last 12 months of earnings for the calling user
CREATE OR REPLACE FUNCTION get_monthly_earnings()
RETURNS TABLE (
    month      TEXT,      -- 'YYYY-MM'
    earned     NUMERIC,
    pending    NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        TO_CHAR(DATE_TRUNC('month', COALESCE(l.paid_at::date, l.due_date)::timestamptz), 'YYYY-MM') AS month,
        COALESCE(SUM(l.amount) FILTER (WHERE l.status = 'paid'),  0)  AS earned,
        COALESCE(SUM(l.amount) FILTER (WHERE l.status = 'owed'),  0)  AS pending
    FROM pools p
    JOIN memberships m ON m.pool_id = p.id AND m.status = 'active'
    JOIN ledger l      ON l.membership_id = m.id
    WHERE p.owner_id = auth.uid()
      AND COALESCE(l.paid_at::date, l.due_date) >= CURRENT_DATE - INTERVAL '12 months'
    GROUP BY 1
    ORDER BY 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════════════
-- P4.3: REAL-TIME CHAT ENHANCEMENTS — reactions + reply threading
-- ═══════════════════════════════════════════════════════════════════════════════

-- Add reply_to_id and message_type to messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text'
    CHECK (message_type IN ('text', 'system', 'announcement'));

-- message_reactions table (emoji reactions per user per message)
CREATE TABLE IF NOT EXISTS message_reactions (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id  UUID REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
    user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    emoji       TEXT NOT NULL,              -- e.g. '👍','❤️','😂'
    created_at  TIMESTAMPTZ DEFAULT now(),
    UNIQUE (message_id, user_id, emoji)     -- one of each emoji per user per message
);

ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reactions_read" ON message_reactions;
CREATE POLICY "reactions_read" ON message_reactions FOR SELECT
    USING (
        -- User is part of the pool this message belongs to
        auth.uid() IN (
            SELECT user_id FROM memberships WHERE pool_id = (
                SELECT pool_id FROM messages WHERE id = message_id
            )
            UNION
            SELECT owner_id FROM pools WHERE id = (
                SELECT pool_id FROM messages WHERE id = message_id
            )
        )
    );

DROP POLICY IF EXISTS "reactions_insert" ON message_reactions;
CREATE POLICY "reactions_insert" ON message_reactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reactions_delete" ON message_reactions;
CREATE POLICY "reactions_delete" ON message_reactions FOR DELETE
    USING (auth.uid() = user_id);

-- Enable realtime for reactions
ALTER PUBLICATION supabase_realtime ADD TABLE message_reactions;

CREATE INDEX IF NOT EXISTS idx_reactions_message ON message_reactions(message_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- P4.4: ONBOARDING STATE FLAGS + REFERRAL CODES
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_role TEXT
    CHECK (onboarding_role IN ('host', 'joiner', NULL));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Auto-generate referral_code on new profile creation
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := UPPER(SUBSTR(MD5(NEW.id::text || NOW()::text), 1, 8));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_referral_code ON profiles;
CREATE TRIGGER trg_generate_referral_code
    BEFORE INSERT ON profiles
    FOR EACH ROW EXECUTE PROCEDURE generate_referral_code();

-- ═══════════════════════════════════════════════════════════════════════════════
-- P6.1: ADMIN VIEWS
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ban_reason TEXT;

-- Admin-scoped view: full user metrics (service role only)
CREATE OR REPLACE VIEW admin_user_overview AS
SELECT
    pr.id,
    pr.username,
    pr.display_name,
    pr.email,
    pr.plan,
    pr.is_admin,
    pr.is_banned,
    pr.ban_reason,
    pr.referral_code,
    pr.referred_by,
    pr.created_at,
    COUNT(DISTINCT po.id)                AS pools_hosted,
    COUNT(DISTINCT me.id) FILTER (WHERE me.status = 'active') AS memberships_active,
    COUNT(DISTINCT an.id)                AS events_tracked
FROM profiles pr
LEFT JOIN pools po           ON po.owner_id = pr.id
LEFT JOIN memberships me     ON me.user_id = pr.id
LEFT JOIN analytics_events an ON an.user_id = pr.id
GROUP BY pr.id;

-- RLS note: this view is intentionally no-default-access;
-- access it with service role key from Edge Functions only

-- Admin function: ban a user (sets is_banned, removes active memberships)
CREATE OR REPLACE FUNCTION admin_ban_user(p_user_id UUID, p_reason TEXT DEFAULT 'Terms of Service violation')
RETURNS VOID AS $$
BEGIN
    UPDATE profiles SET is_banned = true, ban_reason = p_reason WHERE id = p_user_id;
    UPDATE memberships SET status = 'removed' WHERE user_id = p_user_id AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════════════
-- P6.2: REFERRAL TRACKING TABLE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS referrals (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id     UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    referred_id     UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    referral_code   TEXT NOT NULL,
    signup_at       TIMESTAMPTZ DEFAULT now(),
    reward_granted  BOOLEAN DEFAULT false,
    reward_type     TEXT,        -- 'credit','badge','free_month' etc.
    UNIQUE (referred_id)         -- each user can only be referred once
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "referrals_read_own" ON referrals;
CREATE POLICY "referrals_read_own" ON referrals FOR SELECT
    USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);

-- Function: process_referral — call after new user signup with a referral code
CREATE OR REPLACE FUNCTION process_referral(p_referral_code TEXT, p_new_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_referrer RECORD;
BEGIN
    SELECT id INTO v_referrer FROM profiles WHERE referral_code = p_referral_code LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Referral code not found');
    END IF;

    IF v_referrer.id = p_new_user_id THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Cannot refer yourself');
    END IF;

    -- Link referred_by on profile
    UPDATE profiles SET referred_by = v_referrer.id WHERE id = p_new_user_id;

    -- Insert referral record
    INSERT INTO referrals (referrer_id, referred_id, referral_code)
    VALUES (v_referrer.id, p_new_user_id, p_referral_code)
    ON CONFLICT (referred_id) DO NOTHING;

    -- Notify referrer
    INSERT INTO notifications (user_id, type, icon, title, body, action_url)
    VALUES (
        v_referrer.id,
        'referral',
        '🎁',
        'Someone signed up with your referral!',
        'Your referral link just brought in a new SubPool member.',
        '/profile'
    );

    RETURN jsonb_build_object('ok', true, 'referrer_id', v_referrer.id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
