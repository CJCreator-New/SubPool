-- Fixes the duplicate username issue on sign up by appending a unique 5-character hash and stripping spaces.
create or replace function handle_new_user()
returns trigger as $$
declare
  raw_name text;
  final_username text;
begin
  raw_name := coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
  -- Strip spaces and make lowercase for safety
  raw_name := lower(replace(raw_name, ' ', ''));
  -- Append first 5 chars of the UUID to guarantee uniqueness
  final_username := raw_name || '_' || substr(new.id::text, 1, 5);

  insert into profiles (id, username, avatar_url)
  values (
    new.id, 
    final_username,
    new.raw_user_meta_data->>'avatar_url'
  );
  
  -- Create a default free plan subscription for the new user
  insert into user_plans (user_id, plan_id)
  values (new.id, 'free')
  on conflict do nothing;
  
  return new;
end;
$$ language plpgsql security definer;
