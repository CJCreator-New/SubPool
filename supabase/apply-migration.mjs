// apply-migration.mjs
// Applies the security hardening migration to the live Supabase project
// using the service role key (bypasses RLS so DDL can run).
// Usage: node supabase/apply-migration.mjs

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('❌  Missing env vars. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
}

// Read the migration SQL
const sql = readFileSync(
    new URL('./migrations/20260221183907_security_hardening.sql', import.meta.url),
    'utf8'
);

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
});

console.log('🚀  Applying security hardening migration...\n');

const { data, error } = await supabase.rpc('exec_sql', { query: sql }).catch(() => ({ data: null, error: { message: 'exec_sql RPC not found — using direct REST fallback' } }));

if (error) {
    // exec_sql is not a built-in — use the Supabase Management API instead
    console.log('ℹ️   Falling back to Supabase Management API...');

    const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    if (!projectRef) {
        console.error('❌  Could not parse project ref from SUPABASE_URL');
        process.exit(1);
    }

    const res = await fetch(
        `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({ query: sql }),
        }
    );

    if (!res.ok) {
        const body = await res.text();
        // Management API requires a different token — print manual instructions
        console.log('\n⚠️  Automatic migration could not run (Management API requires a Personal Access Token).');
        console.log('    Please run this migration manually in the Supabase SQL Editor:\n');
        console.log('    1. Open: https://supabase.com/dashboard/project/armlqjodhiwrverggqdx/sql/new');
        console.log('    2. Paste the contents of:');
        console.log('       supabase/migrations/20260221183907_security_hardening.sql');
        console.log('    3. Click "Run"\n');
        process.exit(0);
    }

    const result = await res.json();
    console.log('✅  Migration applied successfully!', result);
} else {
    console.log('✅  Migration applied successfully!', data);
}
