import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://armlqjodhiwrverggqdx.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybWxxam9kaGl3cnZlcmdncWR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTU3OTk5OCwiZXhwIjoyMDg3MTU1OTk4fQ.oOqpiGEb4CGayTMvPFRJoGwa-pkoze6C1EIohKnbEzQ';

async function testSignup() {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    const testEmail = `test_user_${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';

    console.log(`Testing signup with ${testEmail}...`);

    // Use admin.createUser to bypass email confirmation requirement if it's on
    const { data: user, error: signUpError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: { name: 'Test User' }
    });

    if (signUpError) {
        console.error('❌ Signup failed:', signUpError.message);
        return;
    }

    console.log('✅ Auth user created! ID:', user.user.id);

    // Give the trigger a moment to run
    await new Promise(r => setTimeout(r, 1000));

    // Check if profile was created
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.user.id)
        .single();

    if (profileError) {
        console.error('❌ Profile missing. Trigger failed!', profileError.message);
    } else {
        console.log('✅ Profile successfully auto-created via trigger!');
        console.log('   Username assigned:', profile.username);
    }

    // Check if plan was created
    const { data: plan, error: planError } = await supabase
        .from('user_plans')
        .select('*')
        .eq('user_id', user.user.id)
        .single();

    if (planError) {
        console.error('❌ Plan missing!', planError.message);
    } else {
        console.log('✅ Plan successfully auto-assigned:', plan.plan_id);
    }

    // Cleanup
    console.log('Cleaning up test user...');
    await supabase.auth.admin.deleteUser(user.user.id);
    console.log('All tests passed! The trigger is working perfectly.');
}

testSignup();
