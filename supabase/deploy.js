import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

async function deploy() {
    const password = 'Vty4PQA0jCsGIwPo';
    const projectRef = 'armlqjodhiwrverggqdx';
    const sqlFile = path.join(process.cwd(), 'supabase', 'schema.sql');

    const host = `db.${projectRef}.supabase.co`;
    console.log('🚀 Starting Supabase deployment (Port 5432)...');
    console.log(`📡 Connecting to: ${host}`);

    const sql = postgres({
        host: host,
        port: 6543,
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
