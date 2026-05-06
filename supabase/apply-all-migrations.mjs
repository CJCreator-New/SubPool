// apply-all-migrations.mjs
// Applies all pending migrations to the live Supabase project
// using a direct Postgres connection.

import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

async function applyMigrations() {
    const password = 'Vty4PQA0jCsGIwPo';
    const projectRef = 'armlqjodhiwrverggqdx';
    const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');

    const host = `db.${projectRef}.supabase.co`;
    console.log('🚀 Starting Supabase Migration Push...');
    console.log(`📡 Connecting to: ${host}`);

    const sql = postgres({
        host: host,
        port: 5432,
        database: 'postgres',
        username: 'postgres',
        password: password,
        ssl: 'require',
        connect_timeout: 60,
        prepare: false
    });

    try {
        const files = fs.readdirSync(migrationsDir).sort();
        console.log(`📂 Found ${files.length} migration files.`);

        for (const file of files) {
            if (!file.endsWith('.sql')) continue;
            
            const filePath = path.join(migrationsDir, file);
            const query = fs.readFileSync(filePath, 'utf8');
            
            console.log(`📝 Applying: ${file}...`);
            try {
                await sql.unsafe(query);
                console.log(`✅ Success: ${file}`);
            } catch (e) {
                console.warn(`⚠️  Partial Failure in ${file}: ${e.message}`);
                // Continue to next file
            }
        }

        console.log('\n🌟 Migration sequence finished!');
    } catch (error) {
        console.error('\n❌ Migration failed:');
        console.error('File:', error.file || 'Unknown');
        console.error('Message:', error.message);
        process.exit(1);
    } finally {
        await sql.end();
    }
}

applyMigrations();
