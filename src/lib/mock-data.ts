// â”€â”€â”€ SubPool â€” Mock Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// All data uses the typed interfaces from src/lib/types.ts.
// Loaded by Supabase hooks as fallback when no env vars are configured.

import type {
    Profile,
    Pool,
    Membership,
    LedgerEntry,
    Notification,
    SubscriptionDetail,
} from './types';

// â”€â”€â”€ Profiles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const CURRENT_USER: Profile = {
    id: 'user-you',
    username: 'yourusername',
    display_name: 'You',
    avatar_color: '#C8F135',
    is_verified: false,
    is_pro: false,
    rating: 4.8,
    review_count: 12,
    created_at: '2024-09-01T00:00:00Z',
    bio: null,
};

const RIYA_K: Profile = {
    id: 'user-rk', username: 'riyak', display_name: 'Riya K',
    avatar_color: '#C8F135', is_verified: true, is_pro: false,
    rating: 4.9, review_count: 38, created_at: '2024-06-01T00:00:00Z', bio: null,
    total_hosted: 12, // Trusted host
};
const ALEX_T: Profile = {
    id: 'user-at', username: 'alext', display_name: 'Alex T',
    avatar_color: '#4DFF91', is_verified: true, is_pro: false,
    rating: 4.7, review_count: 12, created_at: '2024-08-15T00:00:00Z', bio: null,
};
const SAM_D: Profile = {
    id: 'user-sd', username: 'samd', display_name: 'Sam D',
    avatar_color: '#7B61FF', is_verified: true, is_pro: true,
    rating: 4.8, review_count: 24, created_at: '2024-07-20T00:00:00Z', bio: null,
    total_hosted: 5, plan: 'host_plus', // Pro host
};
const JAY_M: Profile = {
    id: 'user-jm', username: 'jaym', display_name: 'Jay M',
    avatar_color: '#F5A623', is_verified: false, is_pro: false,
    rating: 4.6, review_count: 9, created_at: '2024-10-01T00:00:00Z', bio: null,
};
const PRIYA_S: Profile = {
    id: 'user-ps', username: 'priyas', display_name: 'Priya S',
    avatar_color: '#54A0FF', is_verified: true, is_pro: false,
    rating: 5.0, review_count: 7, created_at: '2024-11-01T00:00:00Z', bio: null,
};
const MARCUS_W: Profile = {
    id: 'user-mw', username: 'marcusw', display_name: 'Marcus W',
    avatar_color: '#00D1C1', is_verified: true, is_pro: true,
    rating: 4.5, review_count: 16, created_at: '2024-09-10T00:00:00Z', bio: null,
};
const ELENA_V: Profile = {
    id: 'user-ev', username: 'elenav', display_name: 'Elena V',
    avatar_color: '#FF4D4D', is_verified: true, is_pro: true,
    rating: 4.9, review_count: 21, created_at: '2024-05-01T00:00:00Z', bio: null,
};

// â”€â”€â”€ Pools â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const MOCK_POOLS: Pool[] = [
    {
        id: 'pool-1', platform: 'netflix', owner_id: RIYA_K.id, owner: RIYA_K,
        category: 'OTT', status: 'open', plan_name: '4K',
        price_per_slot: 499, total_slots: 4, filled_slots: 3,
        auto_approve: false,
        description: 'Reliable Netflix 4K pool. Auto-renews monthly via SubPool escrow.',
        created_at: '2024-11-01T10:00:00Z', updated_at: '2025-01-15T08:00:00Z',
    },
    {
        id: 'pool-2', platform: 'spotify', owner_id: ALEX_T.id, owner: ALEX_T,
        category: 'OTT', status: 'open', plan_name: 'Duo',
        price_per_slot: 349, total_slots: 2, filled_slots: 1,
        auto_approve: true,
        description: 'Spotify Duo — 1 slot remaining. Instant approval.',
        created_at: '2024-12-10T09:00:00Z', updated_at: '2025-01-20T11:00:00Z',
    },
    {
        id: 'pool-3', platform: 'figma', owner_id: SAM_D.id, owner: SAM_D,
        category: 'AI_IDE', status: 'active', plan_name: 'Professional',
        price_per_slot: 600, total_slots: 5, filled_slots: 5,
        auto_approve: false,
        description: 'Full Figma Professional pool for designers. Join waitlist.',
        created_at: '2024-10-15T14:00:00Z', updated_at: '2025-01-10T16:00:00Z',
    },
    {
        id: 'pool-4', platform: 'notion', owner_id: JAY_M.id, owner: JAY_M,
        category: 'AI_IDE', status: 'open', plan_name: 'Plus',
        price_per_slot: 400, total_slots: 4, filled_slots: 2,
        auto_approve: true,
        description: 'Notion Team plan — 2 slots open. Great for solo devs.',
        created_at: '2025-01-05T08:30:00Z', updated_at: '2025-01-25T09:00:00Z',
    },
    {
        id: 'pool-5', platform: 'disneyplus', owner_id: PRIYA_S.id, owner: PRIYA_S,
        category: 'OTT', status: 'open', plan_name: 'Premium',
        price_per_slot: 375, total_slots: 4, filled_slots: 3,
        auto_approve: false,
        description: 'Disney+ Premium with 4K + Hulu bundle. 1 slot available.',
        created_at: '2025-01-12T12:00:00Z', updated_at: '2025-01-28T10:00:00Z',
    },
    {
        id: 'pool-6', platform: 'chatgpt', owner_id: MARCUS_W.id, owner: MARCUS_W,
        category: 'ai', status: 'open', plan_name: 'Plus',
        price_per_slot: 999, total_slots: 2, filled_slots: 1,
        auto_approve: true,
        description: 'ChatGPT Plus split. Full GPT-4 access for half the price.',
        created_at: '2025-01-18T15:00:00Z', updated_at: '2025-01-30T14:00:00Z',
    },
    {
        id: 'pool-7', platform: 'adobe', owner_id: ELENA_V.id, owner: ELENA_V,
        category: 'AI_IDE', status: 'open', plan_name: 'All Apps',
        price_per_slot: 1800, total_slots: 3, filled_slots: 1,
        auto_approve: false,
        description: 'Adobe Creative Cloud All Apps plan. Full suite access.',
        created_at: '2024-12-20T11:00:00Z', updated_at: '2025-01-22T09:00:00Z',
    },
    {
        id: 'pool-8', platform: 'youtube', owner_id: MARCUS_W.id, owner: MARCUS_W,
        category: 'OTT', status: 'open', plan_name: 'Premium Family',
        price_per_slot: 349, total_slots: 5, filled_slots: 4,
        auto_approve: true,
        description: 'Elite YouTube cluster. 1 slot remaining.',
        created_at: '2024-11-10T10:00:00Z', updated_at: '2025-01-29T16:00:00Z',
    },
];

// â”€â”€â”€ Memberships â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const MOCK_MEMBERSHIPS: Membership[] = [
    {
        id: 'mem-1', pool_id: 'pool-2', pool: MOCK_POOLS[1],
        user_id: CURRENT_USER.id, status: 'active',
        price_per_slot: 349, joined_at: '2025-01-20T11:00:00Z',
        created_at: '2025-01-20T11:00:00Z',
        next_billing_at: '2025-02-20T00:00:00Z',
        billing_anchor_day: 20, cancelled_at: null,
    },
    {
        id: 'mem-2', pool_id: 'pool-3', pool: MOCK_POOLS[2],
        user_id: CURRENT_USER.id, status: 'active',
        price_per_slot: 600, joined_at: '2025-01-15T14:30:00Z',
        created_at: '2025-01-15T14:30:00Z',
        next_billing_at: '2025-02-15T00:00:00Z',
        billing_anchor_day: 15, cancelled_at: null,
    },
    {
        id: 'mem-3', pool_id: 'pool-6', pool: MOCK_POOLS[5],
        user_id: CURRENT_USER.id, status: 'pending',
        price_per_slot: 999, joined_at: '2025-01-30T09:00:00Z',
        created_at: '2025-01-30T09:00:00Z',
        next_billing_at: null,
        billing_anchor_day: 30, cancelled_at: null,
    },
];

// â”€â”€â”€ Ledger â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const MOCK_LEDGER: LedgerEntry[] = [
    {
        id: 'led-1', pool_id: 'pool-1', pool_name: 'Netflix 4K', platform: 'netflix', platform_emoji: '🎬',
        membership_id: 'mem-1',
        counterparty_id: RIYA_K.id, counterparty_name: 'Riya K',
        counterparty_initials: 'RK', counterparty_color: '#C8F135',
        type: 'payment', status: 'paid', amount_cents: 499,
        due_at: '2025-01-15T00:00:00Z', settled_at: '2025-01-15T10:23:00Z', note: null,
    },
    {
        id: 'led-2', pool_id: 'pool-2', pool_name: 'Spotify Duo', platform: 'spotify', platform_emoji: '🎵',
        membership_id: 'mem-2',
        counterparty_id: ALEX_T.id, counterparty_name: 'Alex T',
        counterparty_initials: 'AT', counterparty_color: '#4DFF91',
        type: 'payment', status: 'owed', amount_cents: 349,
        due_at: '2025-02-01T00:00:00Z', settled_at: null, note: 'Due Feb 1st',
    },
    {
        id: 'led-3', pool_id: 'pool-8', pool_name: 'YouTube Premium', platform: 'youtube', platform_emoji: '▶️',
        membership_id: 'mem-3',
        counterparty_id: 'user-mp', counterparty_name: 'Maya P',
        counterparty_initials: 'MP', counterparty_color: '#F5A623',
        type: 'payout', status: 'owed', amount_cents: 349,
        due_at: '2025-02-05T00:00:00Z', settled_at: null, note: null,
    },
    {
        id: 'led-4', pool_id: 'pool-8', pool_name: 'YouTube Premium', platform: 'youtube', platform_emoji: '▶️',
        membership_id: 'mem-4',
        counterparty_id: 'user-lk', counterparty_name: 'Liam K',
        counterparty_initials: 'LK', counterparty_color: '#54A0FF',
        type: 'payout', status: 'owed', amount_cents: 349,
        due_at: '2025-01-28T00:00:00Z', settled_at: null, note: 'Overdue 3 days',
    },
    {
        id: 'led-5', pool_id: 'pool-6', pool_name: 'ChatGPT Plus', platform: 'chatgpt', platform_emoji: '🤖',
        membership_id: 'mem-5',
        counterparty_id: MARCUS_W.id, counterparty_name: 'Marcus W',
        counterparty_initials: 'MW', counterparty_color: '#00D1C1',
        type: 'payment', status: 'paid', amount_cents: 999,
        due_at: '2025-01-10T00:00:00Z', settled_at: '2025-01-10T08:05:00Z', note: null,
    },
    {
        id: 'led-6', pool_id: 'pool-3', pool_name: 'Figma Pro', platform: 'figma', platform_emoji: '🎨',
        membership_id: 'mem-6',
        counterparty_id: SAM_D.id, counterparty_name: 'Sam D',
        counterparty_initials: 'SD', counterparty_color: '#7B61FF',
        type: 'payment', status: 'paid', amount_cents: 600,
        due_at: '2025-01-01T00:00:00Z', settled_at: '2025-01-01T09:00:00Z', note: null,
    },
    {
        id: 'led-7', pool_id: 'pool-8', pool_name: 'YouTube Premium', platform: 'youtube', platform_emoji: '▶️',
        membership_id: 'mem-7',
        counterparty_id: 'user-cr', counterparty_name: 'Chris R',
        counterparty_initials: 'CR', counterparty_color: '#A29BFE',
        type: 'payout', status: 'owed', amount_cents: 349,
        due_at: '2025-02-05T00:00:00Z', settled_at: null, note: null,
    },
];

// â”€â”€â”€ Notifications â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: 'notif-1', user_id: CURRENT_USER.id, type: 'success',
        icon: 'âœ…', title: 'Payment received',
        body: 'Maya P paid $3.49 for YouTube Premium Family.',
        read: false, action_url: '/ledger',
        created_at: '2025-01-30T09:15:00Z',
    },
    {
        id: 'notif-2', user_id: CURRENT_USER.id, type: 'warning',
        icon: '⚠️', title: 'Overdue payment',
        body: "Liam K's $3.49 payment is 3 days overdue.",
        read: false, action_url: '/ledger',
        created_at: '2025-01-31T08:00:00Z',
    },
    {
        id: 'notif-3', user_id: CURRENT_USER.id, type: 'info',
        icon: 'ðŸ™‹', title: 'New join request',
        body: 'Someone wants to join your YouTube Premium Family pool.',
        read: true, action_url: '/my-pools',
        created_at: '2025-01-31T11:30:00Z',
    },
    {
        id: 'notif-4', user_id: CURRENT_USER.id, type: 'info',
        icon: 'ðŸ“¢', title: 'Slot available',
        body: 'A Spotify Duo slot you wishlisted is now open.',
        read: true, action_url: '/',
        created_at: '2025-01-29T14:00:00Z',
    },
    {
        id: 'notif-5', user_id: CURRENT_USER.id, type: 'success',
        icon: 'ðŸŽ‰', title: 'You saved $12 this month',
        body: 'Your active pools saved you $12.47 vs retail pricing.',
        read: true, action_url: '/savings',
        created_at: '2025-01-28T10:00:00Z',
    },
];

// â”€â”€â”€ Analytics â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const MOCK_EARNINGS_DATA = [
    { month: 'Mar', earned: 85, would_have_paid: 120 },
    { month: 'Apr', earned: 90, would_have_paid: 120 },
    { month: 'May', earned: 90, would_have_paid: 120 },
    { month: 'Jun', earned: 110, would_have_paid: 140 },
    { month: 'Jul', earned: 115, would_have_paid: 140 },
    { month: 'Aug', earned: 140, would_have_paid: 160 },
    { month: 'Sep', earned: 150, would_have_paid: 180 },
    { month: 'Oct', earned: 155, would_have_paid: 180 },
    { month: 'Nov', earned: 160, would_have_paid: 180 },
    { month: 'Dec', earned: 180, would_have_paid: 200 },
    { month: 'Jan', earned: 195, would_have_paid: 210 },
    { month: 'Feb', earned: 210, would_have_paid: 210 },
];

export const MOCK_PAYMENT_TIMELINE = [
    {
        name: 'Riya K',
        avatar: 'R',
        payments: [
            { month: 'Sep', status: 'paid' },
            { month: 'Oct', status: 'paid' },
            { month: 'Nov', status: 'paid' },
            { month: 'Dec', status: 'paid' },
            { month: 'Jan', status: 'paid' },
            { month: 'Feb', status: 'paid' },
        ] as { month: string; status: 'paid' | 'late' | 'missed' | 'pending' }[],
    },
    {
        name: 'Alex T',
        avatar: 'A',
        payments: [
            { month: 'Sep', status: 'paid' },
            { month: 'Oct', status: 'late' },
            { month: 'Nov', status: 'paid' },
            { month: 'Dec', status: 'paid' },
            { month: 'Jan', status: 'paid' },
            { month: 'Feb', status: 'paid' },
        ] as { month: string; status: 'paid' | 'late' | 'missed' | 'pending' }[],
    },
    {
        name: 'Liam K',
        avatar: 'L',
        payments: [
            { month: 'Sep', status: 'paid' },
            { month: 'Oct', status: 'paid' },
            { month: 'Nov', status: 'missed' },
            { month: 'Dec', status: 'paid' },
            { month: 'Jan', status: 'late' },
            { month: 'Feb', status: 'pending' },
        ] as { month: string; status: 'paid' | 'late' | 'missed' | 'pending' }[],
    },
    {
        name: 'Maya P',
        avatar: 'M',
        payments: [
            { month: 'Sep', status: 'paid' },
            { month: 'Oct', status: 'paid' },
            { month: 'Nov', status: 'paid' },
            { month: 'Dec', status: 'paid' },
            { month: 'Jan', status: 'paid' },
            { month: 'Feb', status: 'pending' },
        ] as { month: string; status: 'paid' | 'late' | 'missed' | 'pending' }[],
    },
];

// â”€â”€â”€ Mock Subscription Details â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function _mockPayments(poolName: string, emoji: string, cents: number, months: number): import('./types').PaymentRecord[] {
    const records: import('./types').PaymentRecord[] = [];
    const now = new Date();
    for (let i = 0; i < months; i++) {
        const due = new Date(now.getFullYear(), now.getMonth() - i, 15);
        const isPaid = i > 0; // current month is owed
        records.push({
            id: `pay-${poolName}-${i}`,
            amount_cents: cents,
            status: isPaid ? 'paid' : 'owed',
            due_at: due.toISOString(),
            settled_at: isPaid ? new Date(due.getTime() + 86400000).toISOString() : null,
        });
    }
    return records;
}

export const MOCK_SUBSCRIPTION_DETAILS: SubscriptionDetail[] = [
    // 1. Netflix 4K â€” Active, renewing soon
    {
        membership: MOCK_MEMBERSHIPS[0],
        platform: { id: 'netflix', name: 'Netflix', icon: '🎬', color: '#E50914', bg: '#1A0203' },
        planPricing: { official_price: 22.99, currency: 'USD' },
        renewalStatus: 'renewing_soon',
        daysUntilRenewal: 5,
        billingCycle: 'monthly',
        totalPaid: 499 * 4,
        savingsVsRetail: 78,
        paymentHistory: _mockPayments('netflix', '🎬', 499, 5),
        lastPaymentAt: new Date(Date.now() - 25 * 86400000).toISOString(),
        memberSince: '2025-10-01T10:00:00Z',
    },
    // 2. Spotify Duo â€” Active, healthy
    {
        membership: {
            ...MOCK_MEMBERSHIPS[0],
            id: 'mem-sub-2',
            pool_id: 'pool-2',
            pool: MOCK_POOLS[1],
            price_per_slot: 349,
            created_at: '2025-09-15T00:00:00Z',
            next_billing_at: new Date(Date.now() + 18 * 86400000).toISOString(),
            billing_anchor_day: 15,
        },
        platform: { id: 'spotify', name: 'Spotify', icon: '🎵', color: '#1DB954', bg: '#011B09' },
        planPricing: { official_price: 14.99, currency: 'USD' },
        renewalStatus: 'active',
        daysUntilRenewal: 18,
        billingCycle: 'monthly',
        totalPaid: 349 * 5,
        savingsVsRetail: 77,
        paymentHistory: _mockPayments('spotify', '🎵', 349, 6),
        lastPaymentAt: new Date(Date.now() - 12 * 86400000).toISOString(),
        memberSince: '2025-09-15T00:00:00Z',
    },
    // 3. Figma Professional â€” Active, healthy
    {
        membership: MOCK_MEMBERSHIPS[1],
        platform: { id: 'figma', name: 'Figma', icon: '🎨', color: '#A259FF', bg: '#140A24' },
        planPricing: { official_price: 15.00, currency: 'USD' },
        renewalStatus: 'active',
        daysUntilRenewal: 22,
        billingCycle: 'monthly',
        totalPaid: 600 * 6,
        savingsVsRetail: 60,
        paymentHistory: _mockPayments('figma', '🎨', 600, 6),
        lastPaymentAt: new Date(Date.now() - 8 * 86400000).toISOString(),
        memberSince: '2024-11-01T00:00:00Z',
    },
    // 4. ChatGPT Plus â€” Pending activation
    {
        membership: MOCK_MEMBERSHIPS[2],
        platform: { id: 'chatgpt', name: 'ChatGPT', icon: '🤖', color: '#10A37F', bg: '#031A14' },
        planPricing: { official_price: 20.00, currency: 'USD' },
        renewalStatus: 'active',
        daysUntilRenewal: null,
        billingCycle: 'monthly',
        totalPaid: 0,
        savingsVsRetail: 50,
        paymentHistory: [],
        lastPaymentAt: null,
        memberSince: '2026-01-30T09:00:00Z',
    },
    // 5. YouTube Premium Family â€” Active, overdue alert
    {
        membership: {
            ...MOCK_MEMBERSHIPS[0],
            id: 'mem-sub-5',
            pool_id: 'pool-8',
            pool: MOCK_POOLS[7],
            price_per_slot: 349,
            created_at: '2025-06-01T00:00:00Z',
            next_billing_at: new Date(Date.now() - 2 * 86400000).toISOString(),
            billing_anchor_day: 1,
        },
        platform: { id: 'youtube', name: 'YouTube', icon: '▶️', color: '#FF0000', bg: '#1A0000' },
        planPricing: { official_price: 22.99, currency: 'USD' },
        renewalStatus: 'overdue',
        daysUntilRenewal: -2,
        billingCycle: 'monthly',
        totalPaid: 349 * 8,
        savingsVsRetail: 85,
        paymentHistory: [
            { id: 'pay-yt-0', amount_cents: 349, status: 'overdue', due_at: new Date(Date.now() - 2 * 86400000).toISOString(), settled_at: null },
            ..._mockPayments('youtube', '▶️', 349, 5).slice(1),
        ],
        lastPaymentAt: new Date(Date.now() - 32 * 86400000).toISOString(),
        memberSince: '2025-06-01T00:00:00Z',
    },
    // 6. Notion Plus â€” Active, healthy
    {
        membership: {
            ...MOCK_MEMBERSHIPS[0],
            id: 'mem-sub-6',
            pool_id: 'pool-4',
            pool: MOCK_POOLS[3],
            price_per_slot: 400,
            created_at: '2025-08-01T00:00:00Z',
            next_billing_at: new Date(Date.now() + 12 * 86400000).toISOString(),
            billing_anchor_day: 1,
        },
        platform: { id: 'notion', name: 'Notion', icon: 'ðŸ“‹', color: '#FFFFFF', bg: '#1A1A1A' },
        planPricing: { official_price: 10.00, currency: 'USD' },
        renewalStatus: 'active',
        daysUntilRenewal: 12,
        billingCycle: 'monthly',
        totalPaid: 400 * 7,
        savingsVsRetail: 60,
        paymentHistory: _mockPayments('notion', 'ðŸ“‹', 400, 6),
        lastPaymentAt: new Date(Date.now() - 18 * 86400000).toISOString(),
        memberSince: '2025-08-01T00:00:00Z',
    },
    // 7. Adobe CC All Apps â€” Active, expiring soon
    {
        membership: {
            ...MOCK_MEMBERSHIPS[0],
            id: 'mem-sub-7',
            pool_id: 'pool-7',
            pool: MOCK_POOLS[6],
            price_per_slot: 1800,
            created_at: '2025-03-01T00:00:00Z',
            next_billing_at: new Date(Date.now() + 2 * 86400000).toISOString(),
            billing_anchor_day: 1,
        },
        platform: { id: 'adobe', name: 'Adobe CC', icon: 'ðŸ…°️', color: '#FF0000', bg: '#1A0000' },
        planPricing: { official_price: 59.99, currency: 'USD' },
        renewalStatus: 'expiring',
        daysUntilRenewal: 2,
        billingCycle: 'monthly',
        totalPaid: 1800 * 11,
        savingsVsRetail: 70,
        paymentHistory: _mockPayments('adobe', 'ðŸ…°️', 1800, 6),
        lastPaymentAt: new Date(Date.now() - 28 * 86400000).toISOString(),
        memberSince: '2025-03-01T00:00:00Z',
    },
    // 8. Cursor Pro â€” Active, healthy
    {
        membership: {
            ...MOCK_MEMBERSHIPS[0],
            id: 'mem-sub-8',
            pool_id: 'pool-cursor',
            pool: {
                id: 'pool-cursor', platform: 'cursor', owner_id: 'user-sd', owner: {
                    id: 'user-sd', username: 'samd', display_name: 'Sam D',
                    avatar_color: '#7B61FF', is_verified: true, is_pro: true,
                    rating: 4.8, review_count: 24, created_at: '2024-07-20T00:00:00Z', bio: null,
                },
                category: 'ai', status: 'open', plan_name: 'Pro',
                price_per_slot: 999, total_slots: 2, filled_slots: 2,
                auto_approve: false, description: 'Cursor Pro split â€” full AI coding.',
                created_at: '2025-07-01T00:00:00Z', updated_at: '2026-01-15T00:00:00Z',
            },
            price_per_slot: 999,
            joined_at: '2025-08-15T00:00:00Z',
            next_billing_at: new Date(Date.now() + 14 * 86400000).toISOString(),
            billing_anchor_day: 15,
        },
        platform: { id: 'cursor', name: 'Cursor', icon: 'âŒ¨️', color: '#8B5CF6', bg: '#0D0A1A' },
        planPricing: { official_price: 20.00, currency: 'USD' },
        renewalStatus: 'active',
        daysUntilRenewal: 14,
        billingCycle: 'monthly',
        totalPaid: 999 * 6,
        savingsVsRetail: 50,
        paymentHistory: _mockPayments('cursor', 'âŒ¨️', 999, 6),
        lastPaymentAt: new Date(Date.now() - 16 * 86400000).toISOString(),
        memberSince: '2025-08-15T00:00:00Z',
    },
];

