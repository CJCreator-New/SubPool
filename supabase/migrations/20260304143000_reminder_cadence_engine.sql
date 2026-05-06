-- Reminder cadence engine
-- Adds persisted notification preferences and dispatch logs for throttling.

create table if not exists notification_preferences (
  user_id uuid primary key references profiles(id) on delete cascade,
  all_notifs boolean not null default true,
  payment_reminders boolean not null default true,
  weekly_digest boolean not null default true,
  digest_day smallint not null default 1 check (digest_day between 0 and 6), -- 0=Sun
  digest_hour_utc smallint not null default 9 check (digest_hour_utc between 0 and 23),
  reminder_cooldown_minutes integer not null default 720 check (reminder_cooldown_minutes between 30 and 10080),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists reminder_dispatch_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  reminder_type text not null check (reminder_type in ('payment_due','payment_overdue','weekly_digest')),
  dedupe_key text not null unique,
  payload jsonb not null default '{}'::jsonb,
  dispatched_at timestamptz not null default now()
);

create index if not exists idx_notification_preferences_user on notification_preferences(user_id);
create index if not exists idx_reminder_log_user_type_time on reminder_dispatch_log(user_id, reminder_type, dispatched_at desc);

alter table notification_preferences enable row level security;
DROP POLICY IF EXISTS "notif_prefs_own_read" ON notification_preferences;
DROP POLICY IF EXISTS "notif_prefs_own_read" ON notification_preferences;
CREATE POLICY "notif_prefs_own_read" ON notification_preferences
  for select using (auth.uid() = user_id);
DROP POLICY IF EXISTS "notif_prefs_own_insert" ON notification_preferences;
DROP POLICY IF EXISTS "notif_prefs_own_insert" ON notification_preferences;
CREATE POLICY "notif_prefs_own_insert" ON notification_preferences
  for insert with check (auth.uid() = user_id);
DROP POLICY IF EXISTS "notif_prefs_own_update" ON notification_preferences;
DROP POLICY IF EXISTS "notif_prefs_own_update" ON notification_preferences;
CREATE POLICY "notif_prefs_own_update" ON notification_preferences
  for update using (auth.uid() = user_id);

alter table reminder_dispatch_log enable row level security;
DROP POLICY IF EXISTS "reminder_log_own_read" ON reminder_dispatch_log;
DROP POLICY IF EXISTS "reminder_log_own_read" ON reminder_dispatch_log;
CREATE POLICY "reminder_log_own_read" ON reminder_dispatch_log
  for select using (auth.uid() = user_id);

create or replace function touch_notification_preferences_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_notification_preferences_updated_at on notification_preferences;
create trigger trg_notification_preferences_updated_at
before update on notification_preferences
for each row
execute procedure touch_notification_preferences_updated_at();

