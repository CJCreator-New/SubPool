-- PROFILES
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  bio text,
  rating numeric(3,2) default 0,
  rating_count integer default 0,
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "profiles_read" on profiles 
  for select using (true);
create policy "profiles_own_update" on profiles 
  for update using (auth.uid() = id);
create policy "profiles_own_insert" on profiles 
  for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, username)
  values (
    new.id, 
    coalesce(
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- POOLS
create table pools (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references profiles(id) on delete cascade not null,
  platform text not null,
  plan_name text not null,
  total_cost numeric(10,2) not null check (total_cost > 0),
  total_slots integer not null check (total_slots >= 2),
  filled_slots integer default 0 check (filled_slots >= 0),
  price_per_slot numeric(10,2) not null,
  category text not null check (category in 
    ('entertainment','work','productivity','ai')),
  status text default 'open' check (status in ('open','full','closed')),
  billing_cycle text default 'monthly' 
    check (billing_cycle in ('monthly','yearly')),
  created_at timestamptz default now(),
  constraint filled_not_exceed_total 
    check (filled_slots <= total_slots)
);
alter table pools enable row level security;
create policy "pools_read_all" on pools for select using (true);
create policy "pools_owner_insert" on pools for insert 
  with check (auth.uid() = owner_id);
create policy "pools_owner_update" on pools for update 
  using (auth.uid() = owner_id);
create policy "pools_owner_delete" on pools for delete 
  using (auth.uid() = owner_id);

-- MEMBERSHIPS
create table memberships (
  id uuid default gen_random_uuid() primary key,
  pool_id uuid references pools(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  status text default 'pending' 
    check (status in ('pending','active','removed')),
  price_per_slot numeric(10,2) not null,
  joined_at timestamptz default now(),
  unique(pool_id, user_id)
);
alter table memberships enable row level security;
create policy "memberships_read" on memberships for select
  using (auth.uid() = user_id 
    or auth.uid() = (select owner_id from pools where id = pool_id));
create policy "memberships_insert" on memberships for insert
  with check (auth.uid() = user_id);
create policy "memberships_owner_update" on memberships for update
  using (auth.uid() = (select owner_id from pools where id = pool_id));

-- JOIN REQUESTS
create table join_requests (
  id uuid default gen_random_uuid() primary key,
  pool_id uuid references pools(id) on delete cascade not null,
  requester_id uuid references profiles(id) on delete cascade not null,
  status text default 'pending' 
    check (status in ('pending','approved','rejected')),
  message text,
  created_at timestamptz default now(),
  unique(pool_id, requester_id)
);
alter table join_requests enable row level security;
create policy "requests_read" on join_requests for select
  using (auth.uid() = requester_id
    or auth.uid() = (select owner_id from pools where id = pool_id));
create policy "requests_insert" on join_requests for insert
  with check (auth.uid() = requester_id);
create policy "requests_owner_update" on join_requests for update
  using (auth.uid() = (select owner_id from pools where id = pool_id));

-- LEDGER
create table ledger (
  id uuid default gen_random_uuid() primary key,
  membership_id uuid references memberships(id) on delete cascade not null,
  amount numeric(10,2) not null check (amount > 0),
  due_date date not null,
  status text default 'owed' check (status in ('owed','paid')),
  paid_at timestamptz,
  created_at timestamptz default now()
);
alter table ledger enable row level security;
create policy "ledger_read" on ledger for select
  using (
    auth.uid() = (select user_id from memberships where id = membership_id)
    or auth.uid() = (
      select p.owner_id from pools p 
      join memberships m on m.pool_id = p.id 
      where m.id = membership_id
    )
  );
create policy "ledger_member_update" on ledger for update
  using (auth.uid() = (select user_id from memberships where id = membership_id));

-- NOTIFICATIONS
create table notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  type text not null,
  title text not null,
  body text not null,
  read boolean default false,
  action_url text,
  created_at timestamptz default now()
);
alter table notifications enable row level security;
create policy "notifs_own_read" on notifications for select
  using (auth.uid() = user_id);
create policy "notifs_own_update" on notifications for update
  using (auth.uid() = user_id);
create policy "notifs_insert_service" on notifications for insert
  with check (true);
-- Enable realtime
alter publication supabase_realtime add table notifications;

-- RATINGS
create table ratings (
  id uuid default gen_random_uuid() primary key,
  rater_id uuid references profiles(id) on delete cascade not null,
  rated_id uuid references profiles(id) on delete cascade not null,
  pool_id uuid references pools(id) on delete cascade not null,
  score integer not null check (score between 1 and 5),
  review text,
  created_at timestamptz default now(),
  unique(rater_id, pool_id)
);
alter table ratings enable row level security;
create policy "ratings_read" on ratings for select using (true);
create policy "ratings_insert" on ratings for insert
  with check (auth.uid() = rater_id);

-- PERFORMANCE INDEXES
create index idx_pools_status on pools(status);
create index idx_pools_category on pools(category);
create index idx_pools_owner on pools(owner_id);
create index idx_pools_created on pools(created_at desc);
create index idx_ledger_due on ledger(due_date);
create index idx_ledger_status on ledger(status);
create index idx_notifs_user_unread on notifications(user_id, read);
create index idx_memberships_pool on memberships(pool_id);
create index idx_memberships_user on memberships(user_id);

-- SEED DATA (development only)
-- NOTE: In a real Supabase environment, owner_id must match a valid user in auth.users.
-- These are placeholders for demonstration and development.

-- Insert some dummy profiles for seeds (normally auto-created)
-- Using hardcoded UUIDs for stable seeding in dev environment
INSERT INTO profiles (id, username, bio, rating, rating_count)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'riyak', 'Music and coding lover', 4.9, 38),
  ('00000000-0000-0000-0000-000000000002', 'alext', 'Always sharing great deals', 4.7, 12),
  ('00000000-0000-0000-0000-000000000003', 'samd', 'Design systems nerd', 4.8, 24),
  ('00000000-0000-0000-0000-000000000004', 'jaym', 'Building things in public', 4.6, 9);

INSERT INTO pools (owner_id, platform, plan_name, total_cost, total_slots, filled_slots, price_per_slot, category, status)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'netflix', 'Standard 4K', 19.99, 4, 3, 4.99, 'entertainment', 'open'),
  ('00000000-0000-0000-0000-000000000002', 'spotify', 'Duo', 14.99, 2, 1, 7.49, 'entertainment', 'open'),
  ('00000000-0000-0000-0000-000000000003', 'figma', 'Professional', 75.00, 5, 5, 15.00, 'work', 'full'),
  ('00000000-0000-0000-0000-000000000004', 'notion', 'Team', 40.00, 4, 2, 10.00, 'productivity', 'open');
