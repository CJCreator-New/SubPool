import postgres from 'postgres';

async function test() {
    const password = 'jtGP6EwAsKnrS4cI';
    const host = 'db.armlqjodhiwrverggqdx.supabase.co';
    const sql = postgres(`postgresql://postgres:${password}@${host}:5432/postgres`, {
        ssl: 'require',
        connect_timeout: 5
    });

    try {
        console.log('Testing connection...');
        const result = await sql`SELECT version();`;
        console.log('Success:', result[0].version);

        console.log('Checking existing tables...');
        const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`;
        console.log('Tables:', tables.map(t => t.table_name).join(', ') || 'None');

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await sql.end();
    }
}
test();
