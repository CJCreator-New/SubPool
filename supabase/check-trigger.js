import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://armlqjodhiwrverggqdx.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybWxxam9kaGl3cnZlcmdncWR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTU3OTk5OCwiZXhwIjoyMDg3MTU1OTk4fQ.oOqpiGEb4CGayTMvPFRJoGwa-pkoze6C1EIohKnbEzQ';

async function checkTrigger() {
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    console.log('Checking if the trigger function exists...\n');

    // Try to call an RPC that would reveal if the trigger exists
    // We'll use a direct SQL query via the Postgres extension if available

    // Method 1: Try to query pg_trigger via a custom RPC
    // Since we can't do that directly, let's try creating a test user and see the exact error

    const testEmail = `trigger_test_${Date.now()}@test.com`;
    const testPassword = 'TestPassword123!';

    console.log(`Creating test user: ${testEmail}`);

    const { data: user, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: {
            name: 'Trigger Test User'
        }
    });

    if (signUpError) {
        console.log('\n❌ Admin user creation failed:', signUpError.message);
        console.log('Full error:', JSON.stringify(signUpError, null, 2));
        return;
    }

    console.log('\n✅ Auth user created via admin API!');
    console.log('User ID:', user.user.id);

    // Check if profile was created
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', user.user.id)
        .single();

    if (profileError) {
        console.log('\n❌ Profile not found - trigger did NOT fire!');
        console.log('Error:', profileError.message);
    } else {
        console.log('\n✅ Profile created by trigger!');
        console.log('Username:', profile.username);
    }

    // Check if user_plan was created
    const { data: userPlan, error: planError } = await supabaseAdmin
        .from('user_plans')
        .select('*')
        .eq('user_id', user.user.id)
        .single();

    if (planError) {
        console.log('\n❌ User plan not found');
    } else {
        console.log('\n✅ User plan created:', userPlan.plan_id);
    }

    // Cleanup
    console.log('\nCleaning up test user...');
    await supabaseAdmin.auth.admin.deleteUser(user.user.id);
    console.log('Done.');
}

checkTrigger();
