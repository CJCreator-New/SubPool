-- ─── P3-34: Read Receipts ──────────────────────────────────────────────────
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- ─── P3-35: Push Notification Support ─────────────────────────────────────
-- 1. Create tokens table
CREATE TABLE IF NOT EXISTS push_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    token TEXT NOT NULL,
    platform TEXT CHECK (platform IN ('web', 'ios', 'android')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, token)
);

-- RLS — users can only manage their own tokens
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "push_tokens_own" ON push_tokens
    FOR ALL USING (auth.uid() = user_id);

-- 2. Trigger function to call an Edge Function on new notification (conceptual)
-- We won't implement the actual Edge Function HTTP call here, but the trigger setup.
CREATE OR REPLACE FUNCTION notify_push_service() RETURNS trigger AS $$
BEGIN
    -- In a real production setup, we'd use pg_net to call an edge function:
    -- SELECT net.http_post(
    --     url := 'https://your-project.supabase.co/functions/v1/send-push',
    --     body := json_build_object('notification_id', NEW.id)::text,
    --     headers := json_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || current_setting('request.jwt.claims')::json->>'role')::jsonb
    -- );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_push_on_notification ON notifications;
CREATE TRIGGER trg_push_on_notification
    AFTER INSERT ON notifications
    FOR EACH ROW EXECUTE PROCEDURE notify_push_service();
