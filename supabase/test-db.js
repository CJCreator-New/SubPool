import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://armlqjodhiwrverggqdx.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybWxxam9kaGl3cnZlcmdncWR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTU3OTk5OCwiZXhwIjoyMDg3MTU1OTk4fQ.oOqpiGEb4CGayTMvPFRJoGwa-pkoze6C1EIohKnbEzQ';

async function checkDatabase() {
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const tables = ['profiles', 'pools', 'memberships', 'join_requests', 'ledger', 'notifications', 'ratings', 'platform_pricing', 'pool_market_metrics', 'pricing_refresh_log', 'subpool_plans', 'user_plans', 'analytics_events'];

    for (const table of tables) {
        const { error } = await supabaseAdmin.from(table).select('id').limit(1);
        if (error && error.code === '42P01') { // undefined_table
            console.log(`❌ Missing: ${table}`);
        } else if (error && error.message.includes('Could not find the table')) {
            console.log(`❌ Missing: ${table}`);
        } else if (error) {
            console.log(`⚠️ Error on ${table}: ${error.message}`);
        } else {
            console.log(`✅ Exists: ${table}`);
        }
    }
}

checkDatabase();
