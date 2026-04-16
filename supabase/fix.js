import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://armlqjodhiwrverggqdx.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybWxxam9kaGl3cnZlcmdncWR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTU3OTk5OCwiZXhwIjoyMDg3MTU1OTk4fQ.oOqpiGEb4CGayTMvPFRJoGwa-pkoze6C1EIohKnbEzQ';

const sql = `
create or replace function handle_new_user()
returns trigger as $$
declare
  raw_name text;
  final_username text;
begin
  raw_name := coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
  -- Strip spaces
  raw_name := replace(raw_name, ' ', '');
  final_username := raw_name || '_' || substr(new.id::text, 1, 5);

  insert into profiles (id, username, avatar_url)
  values (
    new.id, 
    final_username,
    new.raw_user_meta_data->>'avatar_url'
  );
  
  insert into user_plans (user_id, plan_id)
  values (new.id, 'free')
  on conflict do nothing;
  
  return new;
end;
$$ language plpgsql security definer;
`;

async function run() {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });

  console.log('Applying trigger fix...');
  const { data, error } = await supabase.rpc('exec_sql', { query: sql }).catch(() => ({ data: null, error: { message: 'fallback' } }));

  if (error) {
    console.log('Fallback to REST API... (requires personal access token if strict, but maybe works with service role key if exec_sql exists)');
    const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

    const res = await fetch(
      `https://armlqjodhiwrverggqdx.supabase.co/rest/v1/`,
      // Wait, we can just use the internal Supabase API endpoint if it's open, but it's not.
      // Let's use the standard pg_query rpc if there is one. We'll just stick to the REST API from earlier.
      // Actually, we can use the `postgres` library with the pooler URL!
    );
  }
}
run();
