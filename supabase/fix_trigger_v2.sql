-- STEP 1: Check what triggers exist on auth.users
SELECT tgname, tgtype, proname 
FROM pg_trigger t 
JOIN pg_proc p ON t.tgfoid = p.oid 
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'auth' AND c.relname = 'users';

-- STEP 2: Check what the current handle_new_user function looks like
SELECT prosrc 
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- STEP 3: Drop the old trigger (if it exists) and start fresh
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- STEP 4: Recreate the function from scratch
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  raw_name text;
  final_username text;
BEGIN
  raw_name := coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
  raw_name := lower(replace(raw_name, ' ', ''));
  final_username := raw_name || '_' || substr(new.id::text, 1, 5);

  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    new.id, 
    final_username,
    new.raw_user_meta_data->>'avatar_url'
  );
  
  INSERT INTO public.user_plans (user_id, plan_id)
  VALUES (new.id, 'free')
  ON CONFLICT DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- STEP 5: Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
