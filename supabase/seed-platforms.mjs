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
            { name: 'Claude Team', slug: 'claude-team', cat: 'ai-tools', sharing: 'seat_assignment', price: 2200, risk: 'safe', icon: '🧠' },
            { name: 'Gemini Advanced', slug: 'gemini-advanced', cat: 'ai-tools', sharing: 'family_invite', price: 1950, risk: 'safe', icon: '💎' },
            { name: 'Perplexity Pro', slug: 'perplexity-pro', cat: 'ai-tools', sharing: 'credential_share', price: 1600, risk: 'grey_area', icon: '🔍' },
            { name: 'Midjourney', slug: 'midjourney', cat: 'ai-tools', sharing: 'credential_share', price: 830, risk: 'grey_area', icon: '🎨' },
            { name: 'GitHub Copilot', slug: 'github-copilot', cat: 'ai-tools', sharing: 'seat_assignment', price: 830, risk: 'safe', icon: '💻' },
            { name: 'Cursor Pro', slug: 'cursor-pro', cat: 'ai-tools', sharing: 'credential_share', price: 1600, risk: 'grey_area', icon: '💻' },
            { name: 'Adobe Firefly', slug: 'adobe-firefly', cat: 'ai-tools', sharing: 'seat_assignment', price: 5800, risk: 'safe', icon: '🔥' },
            { name: 'ElevenLabs', slug: 'elevenlabs', cat: 'ai-tools', sharing: 'credential_share', price: 1600, risk: 'grey_area', icon: '🗣️' },
            { name: 'Runway ML', slug: 'runway-ml', cat: 'ai-tools', sharing: 'credential_share', price: 4100, risk: 'grey_area', icon: '🎬' },

            // EDUCATION
            { name: 'Coursera Plus', slug: 'coursera-plus', cat: 'education', sharing: 'credential_share', price: 6600, risk: 'grey_area', icon: '🎓' },
            { name: 'LinkedIn Learning', slug: 'linkedin-learning', cat: 'education', sharing: 'credential_share', price: 1300, risk: 'grey_area', icon: '💼' },
            { name: 'Udemy Business', slug: 'udemy-business', cat: 'education', sharing: 'seat_assignment', price: 2500, risk: 'safe', icon: '📚' },
            { name: 'Skillshare', slug: 'skillshare', cat: 'education', sharing: 'credential_share', price: 830, risk: 'grey_area', icon: '🎨' },
            { name: 'MasterClass', slug: 'masterclass', cat: 'education', sharing: 'family_invite', price: 2900, risk: 'safe', icon: '🌟' },
            { name: 'Duolingo Super', slug: 'duolingo-super', cat: 'education', sharing: 'family_invite', price: 580, risk: 'safe', icon: '🦉' },
            { name: 'Brilliant.org', slug: 'brilliant', cat: 'education', sharing: 'credential_share', price: 2500, risk: 'grey_area', icon: '💡' },
            { name: 'O\'Reilly Learning', slug: 'oreilly', cat: 'education', sharing: 'seat_assignment', price: 4100, risk: 'safe', icon: '📖' },

            // VIDEO STREAMING
            { name: 'Netflix Premium', slug: 'netflix-premium', cat: 'video-streaming', sharing: 'household_share', price: 649, risk: 'grey_area', icon: '🍿' },
            { name: 'Amazon Prime Video', slug: 'prime-video', cat: 'video-streaming', sharing: 'family_invite', price: 299, risk: 'safe', icon: '🎬' },
            { name: 'Disney+ Hotstar', slug: 'hotstar', cat: 'video-streaming', sharing: 'credential_share', price: 299, risk: 'grey_area', icon: '✨' },
            { name: 'YouTube Premium Family', slug: 'youtube-family', cat: 'video-streaming', sharing: 'family_invite', price: 189, risk: 'safe', icon: '▶️' },
            { name: 'JioCinema Premium', slug: 'jiocinema', cat: 'video-streaming', sharing: 'credential_share', price: 149, risk: 'grey_area', icon: '🎥' },
            { name: 'SonyLIV Premium', slug: 'sonyliv', cat: 'video-streaming', sharing: 'credential_share', price: 83, risk: 'grey_area', icon: '📺' },
            { name: 'ZEE5 Premium', slug: 'zee5', cat: 'video-streaming', sharing: 'credential_share', price: 42, risk: 'grey_area', icon: '🎭' },
            { name: 'Apple TV+', slug: 'apple-tv', cat: 'video-streaming', sharing: 'family_invite', price: 99, risk: 'safe', icon: '🍎' },
            { name: 'Aha Premium', slug: 'aha', cat: 'video-streaming', sharing: 'credential_share', price: 149, risk: 'grey_area', icon: '🎬' },
            
            // MUSIC
            { name: 'Spotify Family', slug: 'spotify-family', cat: 'music', sharing: 'family_invite', price: 179, risk: 'safe', icon: '🎧' },
            { name: 'Spotify Duo', slug: 'spotify-duo', cat: 'music', sharing: 'family_invite', price: 149, risk: 'safe', icon: '👥' },
            { name: 'Apple Music Family', slug: 'apple-music-family', cat: 'music', sharing: 'family_invite', price: 150, risk: 'safe', icon: '🎵' },
            { name: 'YouTube Music Family', slug: 'youtube-music-family', cat: 'music', sharing: 'family_invite', price: 189, risk: 'safe', icon: '📻' },
            { name: 'JioSaavn Pro', slug: 'jiosaavn', cat: 'music', sharing: 'family_invite', price: 99, risk: 'safe', icon: '🎶' },

            // GAMING
            { name: 'Xbox Game Pass', slug: 'xbox-game-pass', cat: 'gaming', sharing: 'credential_share', price: 499, risk: 'grey_area', icon: '🎮' },
            { name: 'PlayStation Plus', slug: 'ps-plus', cat: 'gaming', sharing: 'credential_share', price: 999, risk: 'grey_area', icon: '🎮' },
            { name: 'Nintendo Switch Online', slug: 'nintendo-online', cat: 'gaming', sharing: 'family_invite', price: 125, risk: 'safe', icon: '🕹️' },

            // DTH
            { name: 'Tata Play Family', slug: 'tata-play', cat: 'dth-tv', sharing: 'multi_room_add_on', price: 600, risk: 'safe', icon: '📡', hardware: true, location: true },
            { name: 'Airtel DTH Family', slug: 'airtel-dth', cat: 'dth-tv', sharing: 'multi_room_add_on', price: 600, risk: 'safe', icon: '📡', hardware: true, location: true },
            { name: 'Dish TV Family', slug: 'dish-tv', cat: 'dth-tv', sharing: 'multi_room_add_on', price: 500, risk: 'safe', icon: '📡', hardware: true, location: true },

            // PRODUCTIVITY
            { name: 'Notion Team', slug: 'notion-team', cat: 'productivity', sharing: 'seat_assignment', price: 800, risk: 'safe', icon: '📓' },
            { name: 'Figma Professional', slug: 'figma-pro', cat: 'productivity', sharing: 'seat_assignment', price: 1000, risk: 'safe', icon: '🎨' },
            { name: 'Slack Pro', slug: 'slack-pro', cat: 'productivity', sharing: 'seat_assignment', price: 580, risk: 'safe', icon: '💬' },
            { name: 'Zoom Business', slug: 'zoom-business', cat: 'productivity', sharing: 'seat_assignment', price: 1300, risk: 'safe', icon: '📹' },
            { name: 'Grammarly Business', slug: 'grammarly-business', cat: 'productivity', sharing: 'seat_assignment', price: 1000, risk: 'safe', icon: '✍️' },
            { name: 'Canva Teams', slug: 'canva-teams', cat: 'productivity', sharing: 'seat_assignment', price: 333, risk: 'safe', icon: '🎨' },

            // CLOUD STORAGE
            { name: 'Google One 2TB', slug: 'google-one', cat: 'cloud-storage', sharing: 'family_invite', price: 270, risk: 'safe', icon: '☁️' },
            { name: 'iCloud+ 2TB', slug: 'icloud-plus', cat: 'cloud-storage', sharing: 'family_invite', price: 750, risk: 'safe', icon: '☁️' },
            { name: 'Microsoft 365 Family', slug: 'm365-family', cat: 'cloud-storage', sharing: 'family_invite', price: 499, risk: 'safe', icon: '📦' }
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
