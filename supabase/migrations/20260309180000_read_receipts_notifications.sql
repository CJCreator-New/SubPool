-- ─── P3.1: READ RECEIPTS & NOTIFICATION CENTER ─────────────────────────────

-- 1. Update messages for group read receipts
-- Using an array to track exactly who has seen each message
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_by UUID[] DEFAULT '{}';

-- 2. Create function to mark messages as read for a specific user in a pool
-- This function will be called whenever a user opens a chat room
CREATE OR REPLACE FUNCTION mark_messages_read(p_pool_id UUID) 
RETURNS void AS $$
BEGIN
    UPDATE messages 
    SET read_by = array_append(read_by, auth.uid())
    WHERE pool_id = p_pool_id 
    AND NOT (read_by @> ARRAY[auth.uid()]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Notification Center Enhancements
-- Ensure notifications have icons and proper types (already largely present but hardening)
-- Add an index for fetching latest unread notifications fast
CREATE INDEX IF NOT EXISTS idx_notifications_unread_user 
ON notifications(user_id, created_at DESC) 
WHERE read = false;

-- Add a column to track the source of the notification (e.g., message_id, pool_id)
-- This helps in grouping or clearing specific notification types
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS source_id UUID;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS source_type TEXT; -- 'message', 'pool', 'membership'

-- 4. RLS Policy for Bulk Updating Notifications (Mark all as read)
DROP POLICY IF EXISTS "notifs_bulk_update" ON notifications;
CREATE POLICY "notifs_bulk_update" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- 5. Helper Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read() 
RETURNS void AS $$
BEGIN
    UPDATE notifications 
    SET read = true 
    WHERE user_id = auth.uid() 
    AND read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
