import postgres from 'postgres';

const regions = [
    'ap-south-1', 'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2',
    'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
    'eu-central-1', 'eu-west-1', 'eu-west-2'
];

async function discover() {
    const password = 'jtGP6EwAsKnrS4cI';
    const projectRef = 'armlqjodhiwrverggqdx';

    for (const region of regions) {
        for (const port of [5432, 6543]) {
            const host = `aws-0-${region}.pooler.supabase.com`;
            console.log(`🔍 Testing ${host}:${port}...`);

            const sql = postgres({
                host: host,
                port: port,
                database: 'postgres',
                username: `postgres.${projectRef}`,
                password: password,
                ssl: 'require',
                connect_timeout: 2,
                prepare: false
            });

            try {
                await sql`SELECT 1`;
                console.log(`✅ SUCCESS! Correct connection: ${host}:${port}`);
                process.exit(0);
            } catch (e) {
                // Ignore expected errors
            } finally {
                await sql.end();
            }
        }
    }
    console.log('🏁 Discovery finished. No match.');
}

discover();
