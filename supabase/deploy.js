import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

async function deploy() {
    const password = 'jtGP6EwAsKnrS4cI';
    const projectRef = 'armlqjodhiwrverggqdx';
    // Using a known IP for Singapore pooler
    const ip = '13.214.234.136';
    const sqlFile = path.join(process.cwd(), 'supabase', 'schema.sql');

    console.log('🚀 Starting Supabase deployment via Direct IP (Singapore Pooler)...');
    console.log(`📡 Connecting to: ${ip}`);

    const sql = postgres({
        host: ip,
        port: 5432,
        database: 'postgres',
        username: `postgres.${projectRef}`,
        password: password,
        ssl: 'require',
        connect_timeout: 10,
        prepare: false
    });

    try {
        const schema = fs.readFileSync(sqlFile, 'utf8');
        console.log('📝 Executing schema.sql...');
        await sql.unsafe(schema);
        console.log('✅ Deployment successful!');
    } catch (error) {
        console.error('❌ Deployment failed:');
        console.error('Message:', error.message);
        process.exit(1);
    } finally {
        await sql.end();
    }
}

deploy();
