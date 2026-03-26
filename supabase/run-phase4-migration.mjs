import fs from 'fs';
import https from 'https';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('❌  Missing env vars. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
}

const sqlFile = './supabase/migrations/20260325210000_phase4_to_6_backend.sql';
if (!fs.existsSync(sqlFile)) {
    console.error('Migration file not found:', sqlFile);
    process.exit(1);
}

const sql = fs.readFileSync(sqlFile, 'utf8');

const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
if (!projectRef) {
    console.error('❌  Could not parse project ref from SUPABASE_URL');
    process.exit(1);
}

const fullSql = sql + '\nNOTIFY pgrst, \'reload schema\';\n';
const postData = JSON.stringify({ query: fullSql });

const options = {
    hostname: 'api.supabase.com',
    port: 443,
    path: `/v1/projects/${projectRef}/database/query`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log('🚀  Applying Phase 4-6 backend migration using HTTPS module...\n');

const req = https.request(options, (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('✅  Migration applied successfully!');
            process.exit(0);
        } else {
            console.error(`❌  API Error ${res.statusCode}:`, rawData);
            process.exit(1);
        }
    });
});

req.on('error', (e) => {
    console.error('❌  Request failed:', e.message);
    process.exit(1);
});

req.write(postData);
req.end();
