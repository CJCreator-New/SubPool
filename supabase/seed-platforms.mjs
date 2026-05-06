// seed-platforms.mjs
// Seeds the platforms table with curated data from the blueprint.

import postgres from 'postgres';

async function seed() {
    const password = 'Vty4PQA0jCsGIwPo';
    const projectRef = 'armlqjodhiwrverggqdx';

    const sql = postgres({
        host: `db.${projectRef}.supabase.co`,
        port: 5432,
        database: 'postgres',
        username: 'postgres',
        password: password,
        ssl: 'require',
        connect_timeout: 60,
        prepare: false
    });

    try {
        console.log('🚀 Seeding Platforms Catalog...');

        // 1. Get Categories to map slugs to IDs
        const categories = await sql`SELECT id, slug FROM categories`;
        const catMap = Object.fromEntries(categories.map(c => [c.slug, c.id]));

        const platforms = [
            // AI TOOLS
            { name: 'ChatGPT Plus', slug: 'chatgpt-plus', cat: 'ai-tools', sharing: 'credential_share', price: 1950, risk: 'grey_area', icon: '🤖' },
            { name: 'ChatGPT Team', slug: 'chatgpt-team', cat: 'ai-tools', sharing: 'seat_assignment', price: 2100, risk: 'safe', icon: '🤖' },
            { name: 'Claude Pro', slug: 'claude-pro', cat: 'ai-tools', sharing: 'credential_share', price: 1700, risk: 'grey_area', icon: '🧠' },
            { name: 'Perplexity Pro', slug: 'perplexity-pro', cat: 'ai-tools', sharing: 'credential_share', price: 1600, risk: 'grey_area', icon: '🔍' },
            { name: 'Midjourney', slug: 'midjourney', cat: 'ai-tools', sharing: 'credential_share', price: 830, risk: 'grey_area', icon: '🎨' },
            { name: 'Cursor Pro', slug: 'cursor-pro', cat: 'ai-tools', sharing: 'credential_share', price: 1600, risk: 'grey_area', icon: '💻' },

            // VIDEO STREAMING
            { name: 'Netflix Premium', slug: 'netflix-premium', cat: 'video-streaming', sharing: 'household_share', price: 649, risk: 'grey_area', icon: '🍿' },
            { name: 'Amazon Prime Video', slug: 'prime-video', cat: 'video-streaming', sharing: 'family_invite', price: 299, risk: 'safe', icon: '🎬' },
            { name: 'Disney+ Hotstar', slug: 'hotstar', cat: 'video-streaming', sharing: 'credential_share', price: 299, risk: 'grey_area', icon: '✨' },
            { name: 'YouTube Premium Family', slug: 'youtube-family', cat: 'video-streaming', sharing: 'family_invite', price: 189, risk: 'safe', icon: '▶️' },
            
            // MUSIC
            { name: 'Spotify Family', slug: 'spotify-family', cat: 'music', sharing: 'family_invite', price: 179, risk: 'safe', icon: '🎧' },
            { name: 'Apple Music Family', slug: 'apple-music-family', cat: 'music', sharing: 'family_invite', price: 150, risk: 'safe', icon: '🎵' },

            // DTH
            { name: 'Tata Play Family', slug: 'tata-play', cat: 'dth-tv', sharing: 'multi_room_add_on', price: 600, risk: 'safe', icon: '📡', hardware: true, location: true }
        ];

        for (const p of platforms) {
            console.log(`📝 Seeding: ${p.name}`);
            await sql`
                INSERT INTO platforms (
                    name, slug, category_id, sharing_type, retail_price_inr, tos_risk_level, icon, hardware_required, requires_same_location
                )
                VALUES (
                    ${p.name}, ${p.slug}, ${catMap[p.cat]}, ${p.sharing}, ${p.price}, ${p.risk}, ${p.icon}, ${p.hardware || false}, ${p.location || false}
                )
                ON CONFLICT (slug) DO UPDATE SET
                    name = EXCLUDED.name,
                    category_id = EXCLUDED.category_id,
                    sharing_type = EXCLUDED.sharing_type,
                    retail_price_inr = EXCLUDED.retail_price_inr,
                    tos_risk_level = EXCLUDED.tos_risk_level,
                    icon = EXCLUDED.icon,
                    hardware_required = EXCLUDED.hardware_required,
                    requires_same_location = EXCLUDED.requires_same_location;
            `;
        }

        console.log('\n🌟 Platform seeding complete!');
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
    } finally {
        await sql.end();
    }
}

seed();
