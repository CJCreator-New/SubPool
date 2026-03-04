import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://armlqjodhiwrverggqdx.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybWxxam9kaGl3cnZlcmdncWR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTU3OTk5OCwiZXhwIjoyMDg3MTU1OTk4fQ.oOqpiGEb4CGayTMvPFRJoGwa-pkoze6C1EIohKnbEzQ';

async function testViaRPC() {
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    console.log('Testing if we can call an RPC to check trigger status...\n');

    // Try to call any existing RPC functions
    const { data: rpcList, error: rpcError } = await supabaseAdmin.rpc('pg_net_http_collect_response', { 
        // This is just to see if we get a different error
        id: 0 
    });

    // The key insight: The trigger function might have an error that we can't see
    // Let's try a different approach - check if there are any existing users with profiles
    
    console.log('Checking existing users and their profiles...\n');
    
    // Get a few profiles
    const { data: profiles, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id, username, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

    if (profileError) {
        console.log('Error fetching profiles:', profileError.message);
    } else {
        console.log(`Found ${profiles.length} recent profiles:`);
        profiles.forEach(p => {
            console.log(`  - ${p.username} (${p.id}) created at ${p.created_at}`);
        });
    }

    // Check if there are any users in auth.users without profiles
    // We can't query auth.users directly, but we can check if the most recent profile is old
    
    console.log('\n=== ANALYSIS ===');
    console.log('The error "Database error saving new user" indicates the trigger on auth.users is failing.');
    console.log('This could be because:');
    console.log('1. The trigger "on_auth_user_created" does NOT exist on auth.users');
    console.log('2. The trigger function "handle_new_user" has a runtime error');
    console.log('3. There is a constraint violation in the trigger');
    console.log('\nThe most likely cause is #1 - the trigger was never created.');
    console.log('The schema.sql defines the trigger, but it may not have been executed on the database.');
}

testViaRPC();
