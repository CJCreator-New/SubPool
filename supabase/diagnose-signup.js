import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://armlqjodhiwrverggqdx.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybWxxam9kaGl3cnZlcmdncWR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTU3OTk5OCwiZXhwIjoyMDg3MTU1OTk4fQ.oOqpiGEb4CGayTMvPFRJoGwa-pkoze6C1EIohKnbEzQ';

async function diagnose() {
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    console.log('=== DIAGNOSTIC CHECKS ===\n');

    // 1. Check if subpool_plans has 'free' plan
    console.log('1. Checking subpool_plans for "free" plan...');
    const { data: plans, error: plansError } = await supabaseAdmin
        .from('subpool_plans')
        .select('id, name');
    
    if (plansError) {
        console.log('❌ Error fetching plans:', plansError.message);
    } else {
        console.log('✅ Plans found:', plans.map(p => p.id).join(', '));
        if (!plans.find(p => p.id === 'free')) {
            console.log('⚠️ WARNING: "free" plan is missing!');
        }
    }

    // 2. Check if trigger exists by querying pg_trigger (via RPC)
    console.log('\n2. Checking if trigger exists on auth.users...');
    
    // We can't directly query pg_trigger via REST, but we can check if the function exists
    // by trying to call a test RPC or checking the profiles table structure
    
    // 3. Check profiles table structure
    console.log('\n3. Checking profiles table structure...');
    const { data: profileSample, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id, username')
        .limit(1);
    
    if (profileError) {
        console.log('❌ Error querying profiles:', profileError.message);
    } else {
        console.log('✅ Profiles table accessible');
    }

    // 4. Check user_plans table structure and constraints
    console.log('\n4. Checking user_plans table...');
    const { data: userPlansSample, error: userPlansError } = await supabaseAdmin
        .from('user_plans')
        .select('id, user_id, plan_id')
        .limit(1);
    
    if (userPlansError) {
        console.log('❌ Error querying user_plans:', userPlansError.message);
    } else {
        console.log('✅ user_plans table accessible');
    }

    // 5. Try to manually insert a profile and user_plan to test constraints
    console.log('\n5. Testing manual insert (with dummy UUID)...');
    const testUserId = '00000000-0000-0000-0000-000000000099';
    
    // First clean up any existing test data
    await supabaseAdmin.from('user_plans').delete().eq('user_id', testUserId);
    await supabaseAdmin.from('profiles').delete().eq('id', testUserId);
    
    // Try inserting profile
    const { error: insertProfileError } = await supabaseAdmin
        .from('profiles')
        .insert({
            id: testUserId,
            username: 'test_user_99'
        });
    
    if (insertProfileError) {
        console.log('❌ Cannot insert profile:', insertProfileError.message);
        console.log('   Details:', JSON.stringify(insertProfileError, null, 2));
    } else {
        console.log('✅ Profile insert works');
        
        // Try inserting user_plan
        const { error: insertPlanError } = await supabaseAdmin
            .from('user_plans')
            .insert({
                user_id: testUserId,
                plan_id: 'free'
            });
        
        if (insertPlanError) {
            console.log('❌ Cannot insert user_plan:', insertPlanError.message);
            console.log('   Details:', JSON.stringify(insertPlanError, null, 2));
        } else {
            console.log('✅ user_plan insert works');
        }
        
        // Cleanup
        await supabaseAdmin.from('user_plans').delete().eq('user_id', testUserId);
        await supabaseAdmin.from('profiles').delete().eq('id', testUserId);
    }

    // 6. Check RLS policies on profiles
    console.log('\n6. Checking if RLS might be blocking trigger...');
    console.log('   (Trigger runs as SECURITY DEFINER, should bypass RLS)');
    console.log('   But if the trigger function was created incorrectly, it might fail');

    console.log('\n=== POSSIBLE ISSUES ===');
    console.log('1. The trigger "on_auth_user_created" might not exist on auth.users');
    console.log('2. The trigger function "handle_new_user" might have an error');
    console.log('3. The "free" plan might be missing from subpool_plans');
    console.log('4. There might be a constraint violation in the trigger');
}

diagnose();
