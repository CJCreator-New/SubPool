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
create policy "messages_read" on messages
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
create policy "messages_insert" on messages
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
alter publication supabase_realtime add table messages;
