export interface PlatformPricing {
    platform_id: string;
    platform_name: string;
    category: 'OTT' | 'AI_IDE' | 'TEAM_SAAS';
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
    // ─── OTT ────────────────────────────────────────────────────────────────
    // NETFLIX
    {
        platform_id: 'netflix', platform_name: 'Netflix', category: 'OTT',
        plan_name: 'Basic', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 6.99, max_seats: 1, min_slots: 1,
        supports_sharing: false, sharing_policy: 'allowed', source: 'manual'
    },
    {
        platform_id: 'netflix', platform_name: 'Netflix', category: 'OTT',
        plan_name: 'Standard', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 15.49, max_seats: 2, min_slots: 2,
        supports_sharing: true, sharing_policy: 'allowed', source: 'manual'
    },
    {
        platform_id: 'netflix', platform_name: 'Netflix', category: 'OTT',
        plan_name: '4K', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 22.99, max_seats: 4, min_slots: 2,
        supports_sharing: true, sharing_policy: 'allowed', source: 'manual'
    },
    {
        platform_id: 'netflix', platform_name: 'Netflix', category: 'OTT',
        plan_name: 'Basic', billing_cycle: 'monthly', country_code: 'IN', currency: 'INR',
        official_price: 149, max_seats: 1, min_slots: 1,
        supports_sharing: false, sharing_policy: 'allowed', source: 'manual'
    },
    {
        platform_id: 'netflix', platform_name: 'Netflix', category: 'OTT',
        plan_name: 'Standard', billing_cycle: 'monthly', country_code: 'IN', currency: 'INR',
        official_price: 499, max_seats: 2, min_slots: 2,
        supports_sharing: true, sharing_policy: 'allowed', source: 'manual'
    },
    {
        platform_id: 'netflix', platform_name: 'Netflix', category: 'OTT',
        plan_name: '4K', billing_cycle: 'monthly', country_code: 'IN', currency: 'INR',
        official_price: 649, max_seats: 4, min_slots: 2,
        supports_sharing: true, sharing_policy: 'allowed', source: 'manual'
    },
    // PRIME VIDEO
    {
        platform_id: 'prime', platform_name: 'Prime Video', category: 'OTT',
        plan_name: 'Individual', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 8.99, max_seats: 3, min_slots: 2,
        supports_sharing: true, sharing_policy: 'allowed', source: 'manual'
    },
    {
        platform_id: 'prime', platform_name: 'Prime Video', category: 'OTT',
        plan_name: 'Individual', billing_cycle: 'monthly', country_code: 'IN', currency: 'INR',
        official_price: 299, max_seats: 3, min_slots: 2,
        supports_sharing: true, sharing_policy: 'allowed', source: 'manual'
    },
    // DISNEY / HOTSTAR
    {
        platform_id: 'disneyplus', platform_name: 'Disney+', category: 'OTT',
        plan_name: 'Premium', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 7.99, max_seats: 4, min_slots: 2,
        supports_sharing: true, sharing_policy: 'allowed', source: 'manual'
    },
    {
        platform_id: 'disneyplus', platform_name: 'Disney+ Hotstar', category: 'OTT',
        plan_name: 'Mobile', billing_cycle: 'monthly', country_code: 'IN', currency: 'INR',
        official_price: 149, max_seats: 1, min_slots: 1,
        supports_sharing: false, sharing_policy: 'allowed', source: 'manual'
    },
    {
        platform_id: 'disneyplus', platform_name: 'Disney+ Hotstar', category: 'OTT',
        plan_name: 'Super', billing_cycle: 'monthly', country_code: 'IN', currency: 'INR',
        official_price: 299, max_seats: 2, min_slots: 2,
        supports_sharing: true, sharing_policy: 'allowed', source: 'manual'
    },
    {
        platform_id: 'disneyplus', platform_name: 'Disney+ Hotstar', category: 'OTT',
        plan_name: 'Premium', billing_cycle: 'monthly', country_code: 'IN', currency: 'INR',
        official_price: 499, max_seats: 4, min_slots: 2,
        supports_sharing: true, sharing_policy: 'allowed', source: 'manual'
    },
    // YOUTUBE PREMIUM
    {
        platform_id: 'youtube', platform_name: 'YouTube Premium', category: 'OTT',
        plan_name: 'Individual', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 13.99, max_seats: 1, min_slots: 1,
        supports_sharing: false, sharing_policy: 'allowed', source: 'manual'
    },
    {
        platform_id: 'youtube', platform_name: 'YouTube Premium', category: 'OTT',
        plan_name: 'Family', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 22.99, max_seats: 5, min_slots: 2,
        supports_sharing: true, sharing_policy: 'allowed', source: 'manual'
    },
    {
        platform_id: 'youtube', platform_name: 'YouTube Premium', category: 'OTT',
        plan_name: 'Individual', billing_cycle: 'monthly', country_code: 'IN', currency: 'INR',
        official_price: 129, max_seats: 1, min_slots: 1,
        supports_sharing: false, sharing_policy: 'allowed', source: 'manual'
    },
    {
        platform_id: 'youtube', platform_name: 'YouTube Premium', category: 'OTT',
        plan_name: 'Family', billing_cycle: 'monthly', country_code: 'IN', currency: 'INR',
        official_price: 189, max_seats: 5, min_slots: 2,
        supports_sharing: true, sharing_policy: 'allowed', source: 'manual'
    },
    // APPLE TV+
    {
        platform_id: 'appletv', platform_name: 'Apple TV+', category: 'OTT',
        plan_name: 'Individual', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 9.99, max_seats: 6, min_slots: 2,
        supports_sharing: true, sharing_policy: 'allowed', source: 'manual'
    },
    {
        platform_id: 'appletv', platform_name: 'Apple TV+', category: 'OTT',
        plan_name: 'Individual', billing_cycle: 'monthly', country_code: 'IN', currency: 'INR',
        official_price: 99, max_seats: 6, min_slots: 2,
        supports_sharing: true, sharing_policy: 'allowed', source: 'manual'
    },
    // SPOTIFY
    {
        platform_id: 'spotify', platform_name: 'Spotify', category: 'OTT',
        plan_name: 'Individual', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 10.99, max_seats: 1, min_slots: 1,
        supports_sharing: false, sharing_policy: 'allowed', source: 'manual'
    },
    {
        platform_id: 'spotify', platform_name: 'Spotify', category: 'OTT',
        plan_name: 'Duo', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 14.99, max_seats: 2, min_slots: 2,
        supports_sharing: true, sharing_policy: 'allowed', source: 'manual'
    },
    {
        platform_id: 'spotify', platform_name: 'Spotify', category: 'OTT',
        plan_name: 'Family', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 16.99, max_seats: 6, min_slots: 2,
        supports_sharing: true, sharing_policy: 'allowed', source: 'manual'
    },
    {
        platform_id: 'spotify', platform_name: 'Spotify', category: 'OTT',
        plan_name: 'Individual', billing_cycle: 'monthly', country_code: 'IN', currency: 'INR',
        official_price: 119, max_seats: 1, min_slots: 1,
        supports_sharing: false, sharing_policy: 'allowed', source: 'manual'
    },
    {
        platform_id: 'spotify', platform_name: 'Spotify', category: 'OTT',
        plan_name: 'Duo', billing_cycle: 'monthly', country_code: 'IN', currency: 'INR',
        official_price: 149, max_seats: 2, min_slots: 2,
        supports_sharing: true, sharing_policy: 'allowed', source: 'manual'
    },
    {
        platform_id: 'spotify', platform_name: 'Spotify', category: 'OTT',
        plan_name: 'Family', billing_cycle: 'monthly', country_code: 'IN', currency: 'INR',
        official_price: 179, max_seats: 6, min_slots: 2,
        supports_sharing: true, sharing_policy: 'allowed', source: 'manual'
    },
    // MAX
    {
        platform_id: 'max', platform_name: 'Max', category: 'OTT',
        plan_name: 'Ad-lite', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 9.99, max_seats: 2, min_slots: 2,
        supports_sharing: true, sharing_policy: 'allowed', source: 'manual'
    },
    {
        platform_id: 'max', platform_name: 'Max', category: 'OTT',
        plan_name: 'Ad-free', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 15.99, max_seats: 2, min_slots: 2,
        supports_sharing: true, sharing_policy: 'allowed', source: 'manual'
    },
    {
        platform_id: 'max', platform_name: 'Max', category: 'OTT',
        plan_name: 'Ultimate', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 19.99, max_seats: 3, min_slots: 2,
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
        platform_id: 'cursor', platform_name: 'Cursor', category: 'AI_IDE',
        plan_name: 'Pro', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 20, max_seats: 1, min_slots: 1,
        supports_sharing: true, sharing_policy: 'grey_area', source: 'manual'
    },
    {
        platform_id: 'cursor', platform_name: 'Cursor', category: 'AI_IDE',
        plan_name: 'Business', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 40, price_per_seat: 40, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    {
        platform_id: 'cursor', platform_name: 'Cursor', category: 'AI_IDE',
        plan_name: 'Pro', billing_cycle: 'monthly', country_code: 'IN', currency: 'USD',
        official_price: 20, max_seats: 1, min_slots: 1,
        supports_sharing: true, sharing_policy: 'grey_area', source: 'manual'
    },
    {
        platform_id: 'cursor', platform_name: 'Cursor', category: 'AI_IDE',
        plan_name: 'Business', billing_cycle: 'monthly', country_code: 'IN', currency: 'USD',
        official_price: 40, price_per_seat: 40, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    // GITHUB COPILOT
    {
        platform_id: 'github_copilot', platform_name: 'GitHub Copilot', category: 'AI_IDE',
        plan_name: 'Individual', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 10, max_seats: 1, min_slots: 1,
        supports_sharing: true, sharing_policy: 'grey_area', source: 'manual'
    },
    {
        platform_id: 'github_copilot', platform_name: 'GitHub Copilot', category: 'AI_IDE',
        plan_name: 'Business', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 19, price_per_seat: 19, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    {
        platform_id: 'github_copilot', platform_name: 'GitHub Copilot', category: 'AI_IDE',
        plan_name: 'Individual', billing_cycle: 'monthly', country_code: 'IN', currency: 'USD',
        official_price: 10, max_seats: 1, min_slots: 1,
        supports_sharing: true, sharing_policy: 'grey_area', source: 'manual'
    },
    {
        platform_id: 'github_copilot', platform_name: 'GitHub Copilot', category: 'AI_IDE',
        plan_name: 'Business', billing_cycle: 'monthly', country_code: 'IN', currency: 'USD',
        official_price: 19, price_per_seat: 19, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    // REPLIT
    {
        platform_id: 'replit', platform_name: 'Replit', category: 'AI_IDE',
        plan_name: 'Core', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 20, max_seats: 1, min_slots: 1,
        supports_sharing: true, sharing_policy: 'grey_area', source: 'manual'
    },
    {
        platform_id: 'replit', platform_name: 'Replit', category: 'AI_IDE',
        plan_name: 'Teams', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 26, price_per_seat: 26, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    {
        platform_id: 'replit', platform_name: 'Replit', category: 'AI_IDE',
        plan_name: 'Core', billing_cycle: 'monthly', country_code: 'IN', currency: 'USD',
        official_price: 20, max_seats: 1, min_slots: 1,
        supports_sharing: true, sharing_policy: 'grey_area', source: 'manual'
    },
    {
        platform_id: 'replit', platform_name: 'Replit', category: 'AI_IDE',
        plan_name: 'Teams', billing_cycle: 'monthly', country_code: 'IN', currency: 'USD',
        official_price: 26, price_per_seat: 26, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    // JETBRAINS
    {
        platform_id: 'jetbrains', platform_name: 'JetBrains', category: 'AI_IDE',
        plan_name: 'All Products Pack', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 28.90, max_seats: 1, min_slots: 1,
        supports_sharing: true, sharing_policy: 'grey_area', source: 'manual'
    },
    {
        platform_id: 'jetbrains', platform_name: 'JetBrains', category: 'AI_IDE',
        plan_name: 'All Products Pack', billing_cycle: 'monthly', country_code: 'IN', currency: 'USD',
        official_price: 28.90, max_seats: 1, min_slots: 1,
        supports_sharing: true, sharing_policy: 'grey_area', source: 'manual'
    },

    // ─── TEAM SAAS (Not Recommended to share) ───────────────────────────────
    // FIGMA
    {
        platform_id: 'figma', platform_name: 'Figma', category: 'TEAM_SAAS',
        plan_name: 'Starter', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 0, max_seats: 1, min_slots: 1,
        supports_sharing: false, sharing_policy: 'not_recommended', source: 'manual'
    },
    {
        platform_id: 'figma', platform_name: 'Figma', category: 'TEAM_SAAS',
        plan_name: 'Professional', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 15, price_per_seat: 15, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    {
        platform_id: 'figma', platform_name: 'Figma', category: 'TEAM_SAAS',
        plan_name: 'Org', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 45, price_per_seat: 45, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    {
        platform_id: 'figma', platform_name: 'Figma', category: 'TEAM_SAAS',
        plan_name: 'Starter', billing_cycle: 'monthly', country_code: 'IN', currency: 'USD',
        official_price: 0, max_seats: 1, min_slots: 1,
        supports_sharing: false, sharing_policy: 'not_recommended', source: 'manual'
    },
    {
        platform_id: 'figma', platform_name: 'Figma', category: 'TEAM_SAAS',
        plan_name: 'Professional', billing_cycle: 'monthly', country_code: 'IN', currency: 'USD',
        official_price: 15, price_per_seat: 15, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    {
        platform_id: 'figma', platform_name: 'Figma', category: 'TEAM_SAAS',
        plan_name: 'Org', billing_cycle: 'monthly', country_code: 'IN', currency: 'USD',
        official_price: 45, price_per_seat: 45, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    // NOTION
    {
        platform_id: 'notion', platform_name: 'Notion', category: 'TEAM_SAAS',
        plan_name: 'Plus', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 10, price_per_seat: 10, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    {
        platform_id: 'notion', platform_name: 'Notion', category: 'TEAM_SAAS',
        plan_name: 'Business', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 18, price_per_seat: 18, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    {
        platform_id: 'notion', platform_name: 'Notion', category: 'TEAM_SAAS',
        plan_name: 'Plus', billing_cycle: 'monthly', country_code: 'IN', currency: 'USD',
        official_price: 10, price_per_seat: 10, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    {
        platform_id: 'notion', platform_name: 'Notion', category: 'TEAM_SAAS',
        plan_name: 'Business', billing_cycle: 'monthly', country_code: 'IN', currency: 'USD',
        official_price: 18, price_per_seat: 18, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    // SLACK
    {
        platform_id: 'slack', platform_name: 'Slack', category: 'TEAM_SAAS',
        plan_name: 'Pro', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 8.75, price_per_seat: 8.75, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    {
        platform_id: 'slack', platform_name: 'Slack', category: 'TEAM_SAAS',
        plan_name: 'Business+', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 15, price_per_seat: 15, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    {
        platform_id: 'slack', platform_name: 'Slack', category: 'TEAM_SAAS',
        plan_name: 'Pro', billing_cycle: 'monthly', country_code: 'IN', currency: 'USD',
        official_price: 8.75, price_per_seat: 8.75, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    {
        platform_id: 'slack', platform_name: 'Slack', category: 'TEAM_SAAS',
        plan_name: 'Business+', billing_cycle: 'monthly', country_code: 'IN', currency: 'USD',
        official_price: 15, price_per_seat: 15, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    // LINEAR
    {
        platform_id: 'linear', platform_name: 'Linear', category: 'TEAM_SAAS',
        plan_name: 'Basic', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 0, max_seats: 1, min_slots: 1,
        supports_sharing: false, sharing_policy: 'not_recommended', source: 'manual'
    },
    {
        platform_id: 'linear', platform_name: 'Linear', category: 'TEAM_SAAS',
        plan_name: 'Plus', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 10, price_per_seat: 10, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    {
        platform_id: 'linear', platform_name: 'Linear', category: 'TEAM_SAAS',
        plan_name: 'Basic', billing_cycle: 'monthly', country_code: 'IN', currency: 'USD',
        official_price: 0, max_seats: 1, min_slots: 1,
        supports_sharing: false, sharing_policy: 'not_recommended', source: 'manual'
    },
    {
        platform_id: 'linear', platform_name: 'Linear', category: 'TEAM_SAAS',
        plan_name: 'Plus', billing_cycle: 'monthly', country_code: 'IN', currency: 'USD',
        official_price: 10, price_per_seat: 10, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    // GITHUB TEAMS
    {
        platform_id: 'github_teams', platform_name: 'GitHub Teams', category: 'TEAM_SAAS',
        plan_name: 'Teams', billing_cycle: 'monthly', country_code: 'US', currency: 'USD',
        official_price: 4, price_per_seat: 4, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    },
    {
        platform_id: 'github_teams', platform_name: 'GitHub Teams', category: 'TEAM_SAAS',
        plan_name: 'Teams', billing_cycle: 'monthly', country_code: 'IN', currency: 'USD',
        official_price: 4, price_per_seat: 4, max_seats: null, min_slots: 2,
        supports_sharing: true, sharing_policy: 'not_recommended', source: 'manual'
    }
];
