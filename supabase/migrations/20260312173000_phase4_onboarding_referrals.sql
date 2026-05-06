-- Phase 4.4: onboarding state and referral fields on profiles.

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS onboarding_step integer DEFAULT 0,
    ADD COLUMN IF NOT EXISTS onboarding_role text CHECK (onboarding_role IN ('host', 'joiner')),
    ADD COLUMN IF NOT EXISTS referral_code text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_referral_code
    ON public.profiles (referral_code)
    WHERE referral_code IS NOT NULL;

CREATE OR REPLACE FUNCTION public.assign_profile_referral_code()
RETURNS trigger AS $$
BEGIN
    IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
        NEW.referral_code := upper(substr(replace(NEW.id::text, '-', ''), 1, 8));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_assign_profile_referral_code ON public.profiles;
CREATE TRIGGER trg_assign_profile_referral_code
BEFORE INSERT OR UPDATE OF referral_code ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.assign_profile_referral_code();

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id FROM public.profiles WHERE referral_code IS NULL OR referral_code = '' LOOP
        BEGIN
            UPDATE public.profiles 
            SET referral_code = upper(substr(replace(r.id::text, '-', ''), 1, 8))
            WHERE id = r.id;
        EXCEPTION WHEN unique_violation THEN
            UPDATE public.profiles 
            SET referral_code = upper(substr(replace(r.id::text, '-', ''), 1, 6)) || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4))
            WHERE id = r.id;
        END;
    END LOOP;
END $$;
