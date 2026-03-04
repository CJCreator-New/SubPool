import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

console.log('🚀 Checking Database Migration Tools...');

try {
    // Check if Supabase CLI is installed globally or locally
    let hasSupabaseCli = false;
    try {
        execSync('npx supabase --version', { stdio: 'ignore' });
        hasSupabaseCli = true;
    } catch {
        console.log('ℹ️  Supabase CLI not found. We recommend using the Supabase CLI for migrations.');
    }

    if (!hasSupabaseCli) {
        console.log('\n⚠️ For production, you should run migrations via CLI or the Supabase Dashboard.');
        console.log('To apply schemas manually in the dashboard:');
        console.log('1. Go to: https://supabase.com/dashboard/project/_/sql/new');
        console.log('2. Paste the contents of `supabase/schema.sql`');
        console.log('3. Click "Run"');
    }

    // Check for package.json script
    const pkgPath = join(process.cwd(), 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

    if (!pkg.scripts['db:apply']) {
        console.log('\n🛠️ Adding `db:apply` script to package.json...');
        pkg.scripts['db:apply'] = 'node supabase/apply-migration.mjs';
        writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
        console.log('✅ Added `db:apply` script. Run `pnpm db:apply` to apply the latest migration bypass script.');
    } else {
        console.log('✅ `db:apply` script already exists.');
    }

} catch (err) {
    console.error('❌ Error setting up DB tools:', err.message);
}
