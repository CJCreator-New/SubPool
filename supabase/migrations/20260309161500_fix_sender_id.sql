-- P1.3 Fix sender_id Security Vulnerability

ALTER TABLE messages 
    ALTER COLUMN sender_id SET DEFAULT auth.uid();

-- Ensure all existing nulls (if any) are set (not strictly needed but good practice)
-- UPDATE messages SET sender_id = auth.uid() WHERE sender_id IS NULL;

ALTER TABLE messages 
    ALTER COLUMN sender_id SET NOT NULL;

DROP POLICY IF EXISTS "Users can insert their own messages" ON messages;
CREATE POLICY "Users can insert their own messages" ON messages
    FOR INSERT WITH CHECK (sender_id = auth.uid());
