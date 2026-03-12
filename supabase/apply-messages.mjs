import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env
dotenv.config({ path: resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('❌  Missing env vars. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
}

const sql = readFileSync(
    new URL('./migrations/20260305_add_messages.sql', import.meta.url),
    'utf8'
);

console.log('🚀  Applying messages migration...\n');

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
    console.error('❌ Migration failed:', body);
    process.exit(1);
}

const result = await res.json();
console.log('✅  Migration applied successfully!', result);
