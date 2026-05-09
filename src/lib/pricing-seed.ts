export interface PlatformPricing {
    platform_id: string;
    platform_name: string;
    category: string; // Use slugs like 'ai-tools', 'video-streaming', etc.
    plan_name: string;
    billing_cycle: 'monthly' | 'yearly';
    country_code: string;
    currency: string;
    official_price: number;
    price_per_seat?: number | null;
    max_seats?: number | null;
    min_slots: number;
    supports_sharing: boolean;
    sharing_policy: 'allowed' | 'grey_area' | 'not_recommended';
    source: string;
}


export const PLATFORM_PRICING_SEED: PlatformPricing[] = [
    // ─── VIDEO STREAMING (video-streaming) ──────────────────────────────────
    {
        platform_id: 'netflix', platform_name: 'Netflix', category: 'video-streaming',
        plan_name: 'Premium 4K', billing_cycle: 'monthly', country_code: 'IN', currency: 'INR',
        official_price: 649, max_seats: 4, min_slots: 2,
        supports_sharing: true, sharing_policy: 'grey_area', source: 'manual'
    },
    {
        platform_id: 'prime-video', platform_name: 'Prime Video', category: 'video-streaming',
        plan_name: 'Annual', billing_cycle: 'yearly', country_code: 'IN', currency: 'INR',
        official_price: 1499, max_seats: 3, min_slots: 2,
        supports_sharing: true, sharing_policy: 'allowed', source: 'manual'
    },
    {
        platform_id: 'hotstar', platform_name: 'Disney+ Hotstar', category: 'video-streaming',
        plan_name: 'Premium', billing_cycle: 'monthly', country_code: 'IN', currency: 'INR',
        official_price: 299, max_seats: 4, min_slots: 2,
        supports_sharing: true, sharing_policy: 'grey_area', source: 'manual'
    },
    {
        platform_id: 'youtube-family', platform_name: 'YouTube Premium Family', category: 'video-streaming',
        plan_name: 'Family', billing_cycle: 'monthly', country_code: 'IN', currency: 'INR',
        official_price: 189, max_seats: 5, min_slots: 2,
        supports_sharing: true, sharing_policy: 'allowed', source: 'manual'
    },
    {
        platform_id: 'jiocinema', platform_name: 'JioCinema Premium', category: 'video-streaming',
        plan_name: 'Premium', billing_cycle: 'monthly', country_code: 'IN', currency: 'INR',
        official_price: 149, max_seats: 4, min_slots: 2,
        supports_sharing: true, sharing_policy: 'grey_area', source: 'manual'
    },
    
    // ─── AI TOOLS (ai-tools) ────────────────────────────────────────────────
    {
        platform_id: 'chatgpt-plus', platform_name: 'ChatGPT Plus', category: 'ai-tools',
        plan_name: 'Individual', billing_cycle: 'monthly', country_code: 'IN', currency: 'INR',
        official_price: 1950, max_seats: 1, min_slots: 1,
        supports_sharing: true, sharing_policy: 'grey_area', source: 'manual'
    },
    {
        platform_id: 'chatgpt-team', platform_name: 'ChatGPT Team', category: 'ai-tools',
        plan_name: 'Team', billing_cycle: 'monthly', country_code: 'IN', currency: 'INR',
        official_price: 2100, max_seats: 150, min_slots: 2,
        supports_sharing: true, sharing_policy: 'allowed', source: 'manual'
    },
    {
        platform_id: 'claude-pro', platform_name: 'Claude Pro', category: 'ai-tools',
        plan_name: 'Pro', billing_cycle: 'monthly', country_code: 'IN', currency: 'INR',
        official_price: 1700, max_seats: 1, min_slots: 1,
        supports_sharing: true, sharing_policy: 'grey_area', source: 'manual'
    },
    {
        platform_id: 'midjourney', platform_name: 'Midjourney', category: 'ai-tools',
        plan_name: 'Standard', billing_cycle: 'monthly', country_code: 'IN', currency: 'INR',
        official_price: 830, max_seats: 1, min_slots: 1,
        supports_sharing: true, sharing_policy: 'grey_area', source: 'manual'
    },

    // ─── MUSIC (music) ──────────────────────────────────────────────────────
    {
        platform_id: 'spotify-family', platform_name: 'Spotify Family', category: 'music',
        plan_name: 'Family', billing_cycle: 'monthly', country_code: 'IN', currency: 'INR',
        official_price: 179, max_seats: 6, min_slots: 2,
        supports_sharing: true, sharing_policy: 'allowed', source: 'manual'
    },
    {
        platform_id: 'apple-music-family', platform_name: 'Apple Music Family', category: 'music',
        plan_name: 'Family', billing_cycle: 'monthly', country_code: 'IN', currency: 'INR',
        official_price: 150, max_seats: 6, min_slots: 2,
        supports_sharing: true, sharing_policy: 'allowed', source: 'manual'
    },

    // ─── DTH & TV (dth-tv) ──────────────────────────────────────────────────
    {
        platform_id: 'tata-play', platform_name: 'Tata Play', category: 'dth-tv',
        plan_name: 'Family Pack', billing_cycle: 'monthly', country_code: 'IN', currency: 'INR',
        official_price: 600, max_seats: 4, min_slots: 2,
        supports_sharing: true, sharing_policy: 'allowed', source: 'manual'
    },


    // ─── AI IDE (Grey Area) ─────────────────────────────────────────────────
    // CHATGPT
    {
        platform_id: 'chatgpt', platform_name: 'ChatGPT', category: 'AI_IDE',
        plan_name: 'Plus', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 20, max_seats: 1, min_slots: 1,
        supports_sharing: true, sharing_policy: 'grey_area', source: 'manual'
    },
    {
        platform_id: 'chatgpt', platform_name: 'ChatGPT', category: 'AI_IDE',
        plan_name: 'Team', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 25, price_per_seat: 25, max_seats: 2, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    {
        platform_id: 'chatgpt', platform_name: 'ChatGPT', category: 'AI_IDE',
        plan_name: 'Plus', billing_cycle: 'monthly', country_code: 'IN', currency: 'USD',
        official_price: 20, max_seats: 1, min_slots: 1,
        supports_sharing: true, sharing_policy: 'grey_area', source: 'manual'
    },
    {
        platform_id: 'chatgpt', platform_name: 'ChatGPT', category: 'AI_IDE',
        plan_name: 'Team', billing_cycle: 'monthly', country_code: 'IN', currency: 'USD',
        official_price: 25, price_per_seat: 25, max_seats: 2, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    // CLAUDE
    {
        platform_id: 'claude', platform_name: 'Claude', category: 'AI_IDE',
        plan_name: 'Pro', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 20, max_seats: 1, min_slots: 1,
        supports_sharing: true, sharing_policy: 'grey_area', source: 'manual'
    },
    {
        platform_id: 'claude', platform_name: 'Claude', category: 'AI_IDE',
        plan_name: 'Team', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 25, price_per_seat: 25, max_seats: 5, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    {
        platform_id: 'claude', platform_name: 'Claude', category: 'AI_IDE',
        plan_name: 'Pro', billing_cycle: 'monthly', country_code: 'IN', currency: 'USD',
        official_price: 20, max_seats: 1, min_slots: 1,
        supports_sharing: true, sharing_policy: 'grey_area', source: 'manual'
    },
    {
        platform_id: 'claude', platform_name: 'Claude', category: 'AI_IDE',
        plan_name: 'Team', billing_cycle: 'monthly', country_code: 'IN', currency: 'USD',
        official_price: 25, price_per_seat: 25, max_seats: 5, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    // CURSOR
    {
        platform_id: 'cursor', platform_name: 'Cursor', category: 'dev-tools',
        plan_name: 'Pro', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 20, max_seats: 1, min_slots: 1,
        supports_sharing: true, sharing_policy: 'grey_area', source: 'manual'
    },
    {
        platform_id: 'cursor', platform_name: 'Cursor', category: 'dev-tools',
        plan_name: 'Business', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 40, price_per_seat: 40, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    {
        platform_id: 'cursor', platform_name: 'Cursor', category: 'dev-tools',
        plan_name: 'Pro', billing_cycle: 'monthly', country_code: 'IN', currency: 'USD',
        official_price: 20, max_seats: 1, min_slots: 1,
        supports_sharing: true, sharing_policy: 'grey_area', source: 'manual'
    },
    {
        platform_id: 'cursor', platform_name: 'Cursor', category: 'dev-tools',
        plan_name: 'Business', billing_cycle: 'monthly', country_code: 'IN', currency: 'USD',
        official_price: 40, price_per_seat: 40, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    // GITHUB COPILOT
    {
        platform_id: 'github_copilot', platform_name: 'GitHub Copilot', category: 'dev-tools',
        plan_name: 'Individual', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 10, max_seats: 1, min_slots: 1,
        supports_sharing: true, sharing_policy: 'grey_area', source: 'manual'
    },
    {
        platform_id: 'github_copilot', platform_name: 'GitHub Copilot', category: 'dev-tools',
        plan_name: 'Business', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 19, price_per_seat: 19, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    {
        platform_id: 'github_copilot', platform_name: 'GitHub Copilot', category: 'dev-tools',
        plan_name: 'Individual', billing_cycle: 'monthly', country_code: 'IN', currency: 'USD',
        official_price: 10, max_seats: 1, min_slots: 1,
        supports_sharing: true, sharing_policy: 'grey_area', source: 'manual'
    },
    {
        platform_id: 'github_copilot', platform_name: 'GitHub Copilot', category: 'dev-tools',
        plan_name: 'Business', billing_cycle: 'monthly', country_code: 'IN', currency: 'USD',
        official_price: 19, price_per_seat: 19, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    // REPLIT
    {
        platform_id: 'replit', platform_name: 'Replit', category: 'dev-tools',
        plan_name: 'Core', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 20, max_seats: 1, min_slots: 1,
        supports_sharing: true, sharing_policy: 'grey_area', source: 'manual'
    },
    {
        platform_id: 'replit', platform_name: 'Replit', category: 'dev-tools',
        plan_name: 'Teams', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 26, price_per_seat: 26, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    {
        platform_id: 'replit', platform_name: 'Replit', category: 'dev-tools',
        plan_name: 'Core', billing_cycle: 'monthly', country_code: 'IN', currency: 'USD',
        official_price: 20, max_seats: 1, min_slots: 1,
        supports_sharing: true, sharing_policy: 'grey_area', source: 'manual'
    },
    {
        platform_id: 'replit', platform_name: 'Replit', category: 'dev-tools',
        plan_name: 'Teams', billing_cycle: 'monthly', country_code: 'IN', currency: 'USD',
        official_price: 26, price_per_seat: 26, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    // JETBRAINS
    {
        platform_id: 'jetbrains', platform_name: 'JetBrains', category: 'dev-tools',
        plan_name: 'All Products Pack', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 28.90, max_seats: 1, min_slots: 1,
        supports_sharing: true, sharing_policy: 'grey_area', source: 'manual'
    },
    {
        platform_id: 'jetbrains', platform_name: 'JetBrains', category: 'dev-tools',
        plan_name: 'All Products Pack', billing_cycle: 'monthly', country_code: 'IN', currency: 'USD',
        official_price: 28.90, max_seats: 1, min_slots: 1,
        supports_sharing: true, sharing_policy: 'grey_area', source: 'manual'
    },

    // ─── TEAM SAAS (Not Recommended to share) ───────────────────────────────
    // FIGMA
    {
        platform_id: 'figma', platform_name: 'Figma', category: 'productivity',
        plan_name: 'Starter', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 0, max_seats: 1, min_slots: 1,
        supports_sharing: false, sharing_policy: 'not_recommended', source: 'manual'
    },
    {
        platform_id: 'figma', platform_name: 'Figma', category: 'productivity',
        plan_name: 'Professional', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 15, price_per_seat: 15, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    {
        platform_id: 'figma', platform_name: 'Figma', category: 'productivity',
        plan_name: 'Org', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 45, price_per_seat: 45, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    {
        platform_id: 'figma', platform_name: 'Figma', category: 'productivity',
        plan_name: 'Starter', billing_cycle: 'monthly', country_code: 'IN', currency: 'USD',
        official_price: 0, max_seats: 1, min_slots: 1,
        supports_sharing: false, sharing_policy: 'not_recommended', source: 'manual'
    },
    {
        platform_id: 'figma', platform_name: 'Figma', category: 'productivity',
        plan_name: 'Professional', billing_cycle: 'monthly', country_code: 'IN', currency: 'USD',
        official_price: 15, price_per_seat: 15, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    {
        platform_id: 'figma', platform_name: 'Figma', category: 'productivity',
        plan_name: 'Org', billing_cycle: 'monthly', country_code: 'IN', currency: 'USD',
        official_price: 45, price_per_seat: 45, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    // NOTION
    {
        platform_id: 'notion', platform_name: 'Notion', category: 'productivity',
        plan_name: 'Plus', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 10, price_per_seat: 10, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    {
        platform_id: 'notion', platform_name: 'Notion', category: 'productivity',
        plan_name: 'Business', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 18, price_per_seat: 18, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    {
        platform_id: 'notion', platform_name: 'Notion', category: 'productivity',
        plan_name: 'Plus', billing_cycle: 'monthly', country_code: 'IN', currency: 'USD',
        official_price: 10, price_per_seat: 10, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    {
        platform_id: 'notion', platform_name: 'Notion', category: 'productivity',
        plan_name: 'Business', billing_cycle: 'monthly', country_code: 'IN', currency: 'USD',
        official_price: 18, price_per_seat: 18, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    // SLACK
    {
        platform_id: 'slack', platform_name: 'Slack', category: 'productivity',
        plan_name: 'Pro', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 8.75, price_per_seat: 8.75, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    {
        platform_id: 'slack', platform_name: 'Slack', category: 'productivity',
        plan_name: 'Business+', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 15, price_per_seat: 15, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    {
        platform_id: 'slack', platform_name: 'Slack', category: 'productivity',
        plan_name: 'Pro', billing_cycle: 'monthly', country_code: 'IN', currency: 'USD',
        official_price: 8.75, price_per_seat: 8.75, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    {
        platform_id: 'slack', platform_name: 'Slack', category: 'productivity',
        plan_name: 'Business+', billing_cycle: 'monthly', country_code: 'IN', currency: 'USD',
        official_price: 15, price_per_seat: 15, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    // LINEAR
    {
        platform_id: 'linear', platform_name: 'Linear', category: 'productivity',

        plan_name: 'Basic', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 0, max_seats: 1, min_slots: 1,
        supports_sharing: false, sharing_policy: 'not_recommended', source: 'manual'
    },
    {
        platform_id: 'linear', platform_name: 'Linear', category: 'productivity',

        plan_name: 'Plus', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 10, price_per_seat: 10, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    {
        platform_id: 'linear', platform_name: 'Linear', category: 'productivity',

        plan_name: 'Basic', billing_cycle: 'monthly', country_code: 'IN', currency: 'USD',
        official_price: 0, max_seats: 1, min_slots: 1,
        supports_sharing: false, sharing_policy: 'not_recommended', source: 'manual'
    },
    {
        platform_id: 'linear', platform_name: 'Linear', category: 'productivity',

        plan_name: 'Plus', billing_cycle: 'monthly', country_code: 'IN', currency: 'USD',
        official_price: 10, price_per_seat: 10, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    // GITHUB TEAMS
    {
        platform_id: 'github_teams', platform_name: 'GitHub Teams', category: 'productivity',

        plan_name: 'Teams', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 4, price_per_seat: 4, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    {
        platform_id: 'github_teams', platform_name: 'GitHub Teams', category: 'productivity',

        plan_name: 'Teams', billing_cycle: 'monthly', country_code: 'IN', currency: 'USD',
        official_price: 4, price_per_seat: 4, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    }
];
