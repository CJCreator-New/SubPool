-- 1. FIX SIGNUP TRIGGER (Strips spaces, handles NULLs, appends 5-char hash)
create or replace function handle_new_user()
returns trigger as $$
declare
  raw_name text;
  final_username text;
begin
  raw_name := coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
  raw_name := lower(replace(raw_name, ' ', ''));
  final_username := raw_name || '_' || substr(new.id::text, 1, 5);

  -- 1a. Create Profile
  insert into profiles (id, username, avatar_url)
  values (
    new.id, 
    final_username,
    new.raw_user_meta_data->>'avatar_url'
  );
  
  -- 1b. Assign Free Plan (Safe guard in case user_plans table is missing)
  -- The trigger execution will not fail if this block succeeds
  begin
    insert into user_plans (user_id, plan_id)
    values (new.id, 'free')
    on conflict do nothing;
  exception when undefined_table then
    -- Do nothing if table doesn't exist yet
  end;
  
  return new;
end;
$$ language plpgsql security definer;

-- 2. CREATE MISSING TABLES IF THEY DON'T EXIST

-- PLATFORM PRICING TABLE
create table if not exists platform_pricing (
  id uuid default gen_random_uuid() primary key,
  platform_id text not null,
  platform_name text not null,
  category text not null check (category in ('OTT','AI_IDE','TEAM_SAAS')),
  plan_name text not null,
  billing_cycle text not null check (billing_cycle in ('monthly','yearly')),
  country_code text not null,
  currency text not null,
  official_price numeric(10,2) not null,
  price_per_seat numeric(10,2),
  max_seats integer,
  min_slots integer default 2,
  supports_sharing boolean default true,
  sharing_policy text,
  source text not null,
  last_checked_at timestamptz default now(),
  is_active boolean default true,
  created_at timestamptz default now(),
  unique(platform_id, plan_name, billing_cycle, country_code)
);

-- POOL MARKET METRICS TABLE  
create table if not exists pool_market_metrics (
  id uuid default gen_random_uuid() primary key,
  platform_id text not null,
  plan_name text,
  country_code text default 'GLOBAL',
  currency text default 'USD',
  avg_slot_price numeric(10,2),
  min_slot_price numeric(10,2),
  max_slot_price numeric(10,2),
  median_slot_price numeric(10,2),
  avg_fill_time_hours numeric(8,2),
  avg_fill_rate numeric(5,2),
  active_pools_count integer default 0,
  total_pools_count integer default 0,
  sample_size integer default 0,
  computed_at timestamptz default now(),
  unique(platform_id, plan_name, country_code)
);

-- PRICING REFRESH LOG
create table if not exists pricing_refresh_log (
  id uuid default gen_random_uuid() primary key,
  platform_id text not null,
  source text not null,
  status text check (status in ('success','failed','partial')),
  records_updated integer default 0,
  error_message text,
  duration_ms integer,
  refreshed_at timestamptz default now()
);

-- SUBPOOL PLAN TIERS TABLE
create table if not exists subpool_plans (
  id text primary key,
  name text not null,
  tagline text,
  price_monthly numeric(10,2) default 0,
  price_yearly numeric(10,2) default 0,
  max_pools_hosted integer,
  max_pools_joined integer,
  max_members_per_pool integer default 4,
  has_analytics boolean default false,
  has_auto_approve boolean default false,
  has_priority_listing boolean default false,
  has_bulk_reminders boolean default false,
  has_market_intelligence boolean default false,
  has_export boolean default false,
  stripe_price_id_monthly text,
  stripe_price_id_yearly text,
  is_active boolean default true,
  sort_order integer default 0
);

-- SEED SUBPOOL PLANS if empty
insert into subpool_plans (id, name, tagline, price_monthly, price_yearly, max_pools_hosted, max_pools_joined, max_members_per_pool, has_analytics, has_auto_approve, has_priority_listing, has_bulk_reminders, has_market_intelligence, has_export, is_active, sort_order)
values
('free', 'Free', 'Get started, no credit card', 0, 0, 1, 3, 4, false, false, false, false, false, false, true, 1),
('pro', 'Pro', 'For active savers and small hosts', 4.99, 47.88, 5, null, 6, true, false, false, true, false, true, true, 2),
('host_plus', 'Host Plus', 'For power hosts and resellers', 9.99, 95.88, null, null, 10, true, true, true, true, true, true, true, 3)
on conflict (id) do nothing;

-- USER PLAN SUBSCRIPTIONS
create table if not exists user_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade unique,
  plan_id text references subpool_plans(id) default 'free',
  billing_cycle text check (billing_cycle in ('monthly','yearly')),
  started_at timestamptz default now(),
  expires_at timestamptz,
  stripe_subscription_id text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ANALYTICS EVENTS
create table if not exists analytics_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  event_name text not null,
  properties jsonb default '{}'::jsonb,
  session_id text,
  created_at timestamptz default now()
);

-- 3. ENABLE RLS
alter table platform_pricing enable row level security;
alter table pool_market_metrics enable row level security;
alter table pricing_refresh_log enable row level security;
alter table subpool_plans enable row level security;
alter table user_plans enable row level security;
alter table analytics_events enable row level security;

-- 4. CREATE POLICIES (Using DO blocks to ignore "already exists" errors)
DO $$
BEGIN
    if not exists (select 1 from pg_policies where policyname = 'platform_pricing_read' and tablename = 'platform_pricing') then
        create policy "platform_pricing_read" on platform_pricing for select using (true);
    end if;
    if not exists (select 1 from pg_policies where policyname = 'metrics_read' and tablename = 'pool_market_metrics') then
        create policy "metrics_read" on pool_market_metrics for select using (true);
    end if;
    if not exists (select 1 from pg_policies where policyname = 'refresh_log_read' and tablename = 'pricing_refresh_log') then
        create policy "refresh_log_read" on pricing_refresh_log for select using (true);
    end if;
    if not exists (select 1 from pg_policies where policyname = 'subpool_plans_read' and tablename = 'subpool_plans') then
        create policy "subpool_plans_read" on subpool_plans for select using (true);
    end if;
    if not exists (select 1 from pg_policies where policyname = 'user_plans_own' and tablename = 'user_plans') then
        create policy "user_plans_own" on user_plans for all using (auth.uid() = user_id);
    end if;
    if not exists (select 1 from pg_policies where policyname = 'analytics_insert' and tablename = 'analytics_events') then
        create policy "analytics_insert" on analytics_events for insert with check (true);
    end if;
    if not exists (select 1 from pg_policies where policyname = 'analytics_read_admin' and tablename = 'analytics_events') then
        create policy "analytics_read_admin" on analytics_events for select using (true);
    end if;
END
$$;
