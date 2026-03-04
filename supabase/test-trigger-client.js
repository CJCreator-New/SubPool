import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://armlqjodhiwrverggqdx.supabase.co';
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybWxxam9kaGl3cnZlcmdncWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1Nzk5OTgsImV4cCI6MjA4NzE1NTk5OH0.ZNct6NjZ-UA3enRHKxsWtDEPhkMpW1exloXo4aw-EfA';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testSignup() {
    const supabaseClient = createClient(SUPABASE_URL, ANON_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    const testEmail = `user${Math.floor(Math.random() * 100000)}@test.com`;
    const testPassword = 'TestPassword123!';

    console.log(`[Client Auth] Testing signup with ${testEmail}...`);

    const { data: user, error: signUpError } = await supabaseClient.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
            data: {
                name: 'Regular Test User'
            }
        }
    });

    if (signUpError) {
        console.error('❌ Signup failed:', signUpError.message);

        // Let's print out what the current trigger looks like if we can use the REST API
        try {
            const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
            // We can't easily fetch trigger def via REST without a specific function, but let's just abort
        } catch (e) { }

        return;
    }

    console.log('✅ Auth user created! ID:', user.user.id);

    // Wait for trigger
    await new Promise(r => setTimeout(r, 2000));

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', user.user.id)
        .single();

    if (profileError) {
        console.error('❌ Profile missing. Trigger failed to insert into profiles!');
    } else {
        console.log('✅ Profile successfully auto-created via trigger!');
        console.log('   Assigned Username:', profile.username);
    }

    // Cleanup
    await supabaseAdmin.auth.admin.deleteUser(user.user.id);
    console.log('Test completed.');
}

testSignup();
