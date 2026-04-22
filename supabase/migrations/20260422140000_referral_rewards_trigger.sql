-- Auto-grant Pro status for 3 referrals
CREATE OR REPLACE FUNCTION check_referral_rewards()
RETURNS TRIGGER AS $$
DECLARE
    v_referrer_id UUID;
    v_referral_count INTEGER;
BEGIN
    v_referrer_id := NEW.referrer_id;

    -- Count total referrals for this referrer
    SELECT COUNT(*) INTO v_referral_count
    FROM referrals
    WHERE referrer_id = v_referrer_id;

    -- If count is a multiple of 3, grant Pro status (simulated for now by updating profile.plan)
    -- In a real app, this might insert into a 'subscriptions' table or extend an expiry.
    IF v_referral_count > 0 AND v_referral_count % 3 = 0 THEN
        -- Mark the latest referral as the one that triggered the reward
        UPDATE referrals SET reward_granted = true, reward_type = 'pro_month' WHERE id = NEW.id;

        -- Upgrade profile plan to 'pro' if it's currently 'free'
        UPDATE profiles 
        SET plan = 'pro' 
        WHERE id = v_referrer_id AND plan = 'free';

        -- Notify the user
        INSERT INTO notifications (user_id, type, title, body, icon)
        VALUES (
            v_referrer_id,
            'reward',
            'Pro Status Unlocked! 🚀',
            'You reached 3 referrals! We''ve activated 30 days of Pro status on your account.',
            '💎'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_check_referral_rewards ON referrals;
CREATE TRIGGER trg_check_referral_rewards
AFTER INSERT ON referrals
FOR EACH ROW
EXECUTE FUNCTION check_referral_rewards();
