-- Add messages table for real-time pool chatting
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  pool_id uuid references pools(id) on delete cascade not null,
  sender_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table messages enable row level security;

-- Policies
-- Read: Users can read messages if they own the pool or are active members
DROP POLICY IF EXISTS "messages_read" ON messages;
CREATE POLICY "messages_read" ON messages
  for select
  using (
    auth.uid() = (select owner_id from pools where id = pool_id)
    or
    exists (
      select 1 from memberships
      where pool_id = messages.pool_id
      and user_id = auth.uid()
      and status = 'active'
    )
  );

-- Insert: Users can insert if they own the pool or are active members, AND they are the sender
DROP POLICY IF EXISTS "messages_insert" ON messages;
CREATE POLICY "messages_insert" ON messages
  for insert
  with check (
    auth.uid() = sender_id
    and (
      auth.uid() = (select owner_id from pools where id = pool_id)
      or
      exists (
        select 1 from memberships
        where pool_id = messages.pool_id
        and user_id = auth.uid()
        and status = 'active'
      )
    )
  );

-- Enable Realtime for the messages table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;
END $$;
