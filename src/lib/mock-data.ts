// ─── SubPool — Mock Data ───────────────────────────────────────────────────────
// All data uses the typed interfaces from src/lib/types.ts.
// Loaded by Supabase hooks as fallback when no env vars are configured.

import type {
    Profile,
    Pool,
    Membership,
    LedgerEntry,
    Notification,
} from './types';

// ─── Profiles ─────────────────────────────────────────────────────────────────

export const CURRENT_USER: Profile = {
    id: 'user-you',
    username: 'yourusername',
    display_name: 'You',
    avatar_color: '#C8F135',
    is_verified: false,
    is_pro: false,
    rating: 4.8,
    review_count: 12,
    joined_at: '2024-09-01T00:00:00Z',
    bio: null,
};

const RIYA_K: Profile = {
    id: 'user-rk', username: 'riyak', display_name: 'Riya K',
    avatar_color: '#C8F135', is_verified: true, is_pro: false,
    rating: 4.9, review_count: 38, joined_at: '2024-06-01T00:00:00Z', bio: null,
};
const ALEX_T: Profile = {
    id: 'user-at', username: 'alext', display_name: 'Alex T',
    avatar_color: '#4DFF91', is_verified: true, is_pro: false,
    rating: 4.7, review_count: 12, joined_at: '2024-08-15T00:00:00Z', bio: null,
};
const SAM_D: Profile = {
    id: 'user-sd', username: 'samd', display_name: 'Sam D',
    avatar_color: '#7B61FF', is_verified: true, is_pro: true,
    rating: 4.8, review_count: 24, joined_at: '2024-07-20T00:00:00Z', bio: null,
};
const JAY_M: Profile = {
    id: 'user-jm', username: 'jaym', display_name: 'Jay M',
    avatar_color: '#F5A623', is_verified: false, is_pro: false,
    rating: 4.6, review_count: 9, joined_at: '2024-10-01T00:00:00Z', bio: null,
};
const PRIYA_S: Profile = {
    id: 'user-ps', username: 'priyas', display_name: 'Priya S',
    avatar_color: '#54A0FF', is_verified: true, is_pro: false,
    rating: 5.0, review_count: 7, joined_at: '2024-11-01T00:00:00Z', bio: null,
};
const MARCUS_W: Profile = {
    id: 'user-mw', username: 'marcusw', display_name: 'Marcus W',
    avatar_color: '#00D1C1', is_verified: true, is_pro: true,
    rating: 4.5, review_count: 16, joined_at: '2024-09-10T00:00:00Z', bio: null,
};
const ELENA_V: Profile = {
    id: 'user-ev', username: 'elenav', display_name: 'Elena V',
    avatar_color: '#FF4D4D', is_verified: true, is_pro: true,
    rating: 4.9, review_count: 21, joined_at: '2024-05-01T00:00:00Z', bio: null,
};

// ─── Pools ────────────────────────────────────────────────────────────────────

export const MOCK_POOLS: Pool[] = [
    {
        id: 'pool-1', platform_id: 'netflix', owner_id: RIYA_K.id, owner: RIYA_K,
        category: 'entertainment', status: 'open', plan_name: 'Standard 4K',
        price_per_slot: 499, slots_total: 4, slots_filled: 3,
        auto_approve: false,
        description: 'Reliable Netflix 4K pool. Auto-renews monthly via SubPool escrow.',
        created_at: '2024-11-01T10:00:00Z', updated_at: '2025-01-15T08:00:00Z',
    },
    {
        id: 'pool-2', platform_id: 'spotify', owner_id: ALEX_T.id, owner: ALEX_T,
        category: 'entertainment', status: 'open', plan_name: 'Duo',
        price_per_slot: 349, slots_total: 2, slots_filled: 1,
        auto_approve: true,
        description: 'Spotify Duo — 1 slot remaining. Instant approval.',
        created_at: '2024-12-10T09:00:00Z', updated_at: '2025-01-20T11:00:00Z',
    },
    {
        id: 'pool-3', platform_id: 'figma', owner_id: SAM_D.id, owner: SAM_D,
        category: 'work', status: 'full', plan_name: 'Professional',
        price_per_slot: 600, slots_total: 5, slots_filled: 5,
        auto_approve: false,
        description: 'Full Figma Professional pool for designers. Join waitlist.',
        created_at: '2024-10-15T14:00:00Z', updated_at: '2025-01-10T16:00:00Z',
    },
    {
        id: 'pool-4', platform_id: 'notion', owner_id: JAY_M.id, owner: JAY_M,
        category: 'productivity', status: 'open', plan_name: 'Team',
        price_per_slot: 400, slots_total: 4, slots_filled: 2,
        auto_approve: true,
        description: 'Notion Team plan — 2 slots open. Great for solo devs.',
        created_at: '2025-01-05T08:30:00Z', updated_at: '2025-01-25T09:00:00Z',
    },
    {
        id: 'pool-5', platform_id: 'disneyplus', owner_id: PRIYA_S.id, owner: PRIYA_S,
        category: 'entertainment', status: 'open', plan_name: 'Premium',
        price_per_slot: 375, slots_total: 4, slots_filled: 3,
        auto_approve: false,
        description: 'Disney+ Premium with 4K + Hulu bundle. 1 slot available.',
        created_at: '2025-01-12T12:00:00Z', updated_at: '2025-01-28T10:00:00Z',
    },
    {
        id: 'pool-6', platform_id: 'chatgpt', owner_id: MARCUS_W.id, owner: MARCUS_W,
        category: 'ai', status: 'open', plan_name: 'Plus',
        price_per_slot: 999, slots_total: 2, slots_filled: 1,
        auto_approve: true,
        description: 'ChatGPT Plus split. Full GPT-4 access for half the price.',
        created_at: '2025-01-18T15:00:00Z', updated_at: '2025-01-30T14:00:00Z',
    },
    {
        id: 'pool-7', platform_id: 'adobe', owner_id: ELENA_V.id, owner: ELENA_V,
        category: 'work', status: 'open', plan_name: 'All Apps',
        price_per_slot: 1800, slots_total: 3, slots_filled: 1,
        auto_approve: false,
        description: 'Adobe Creative Cloud All Apps plan. Full suite access.',
        created_at: '2024-12-20T11:00:00Z', updated_at: '2025-01-22T09:00:00Z',
    },
    {
        id: 'pool-8', platform_id: 'youtube', owner_id: CURRENT_USER.id, owner: CURRENT_USER,
        category: 'entertainment', status: 'open', plan_name: 'Premium Family',
        price_per_slot: 349, slots_total: 5, slots_filled: 4,
        auto_approve: true,
        description: 'My YouTube Premium Family pool. 1 slot remaining.',
        created_at: '2024-11-10T10:00:00Z', updated_at: '2025-01-29T16:00:00Z',
    },
];

// ─── Memberships ──────────────────────────────────────────────────────────────

export const MOCK_MEMBERSHIPS: Membership[] = [
    {
        id: 'mem-1', pool_id: 'pool-2', pool: MOCK_POOLS[1],
        user_id: CURRENT_USER.id, status: 'active',
        price_per_slot: 349, joined_at: '2025-01-20T11:00:00Z',
        next_billing_at: '2025-02-20T00:00:00Z',
        billing_anchor_day: 20, cancelled_at: null,
    },
    {
        id: 'mem-2', pool_id: 'pool-3', pool: MOCK_POOLS[2],
        user_id: CURRENT_USER.id, status: 'active',
        price_per_slot: 600, joined_at: '2024-11-01T00:00:00Z',
        next_billing_at: '2025-02-01T00:00:00Z',
        billing_anchor_day: 1, cancelled_at: null,
    },
    {
        id: 'mem-3', pool_id: 'pool-6', pool: MOCK_POOLS[5],
        user_id: CURRENT_USER.id, status: 'pending',
        price_per_slot: 999, joined_at: '2025-01-30T09:00:00Z',
        next_billing_at: null,
        billing_anchor_day: 30, cancelled_at: null,
    },
];

// ─── Ledger ───────────────────────────────────────────────────────────────────

export const MOCK_LEDGER: LedgerEntry[] = [
    {
        id: 'led-1', pool_id: 'pool-1', pool_name: 'Netflix 4K', platform_emoji: '🎬',
        counterparty_id: RIYA_K.id, counterparty_name: 'Riya K',
        counterparty_initials: 'RK', counterparty_color: '#C8F135',
        type: 'payment', status: 'paid', amount_cents: 499,
        due_at: '2025-01-15T00:00:00Z', settled_at: '2025-01-15T10:23:00Z', note: null,
    },
    {
        id: 'led-2', pool_id: 'pool-2', pool_name: 'Spotify Duo', platform_emoji: '🎵',
        counterparty_id: ALEX_T.id, counterparty_name: 'Alex T',
        counterparty_initials: 'AT', counterparty_color: '#4DFF91',
        type: 'payment', status: 'owed', amount_cents: 349,
        due_at: '2025-02-01T00:00:00Z', settled_at: null, note: 'Due Feb 1st',
    },
    {
        id: 'led-3', pool_id: 'pool-8', pool_name: 'YouTube Premium', platform_emoji: '▶️',
        counterparty_id: 'user-mp', counterparty_name: 'Maya P',
        counterparty_initials: 'MP', counterparty_color: '#F5A623',
        type: 'payout', status: 'pending', amount_cents: 349,
        due_at: '2025-02-05T00:00:00Z', settled_at: null, note: null,
    },
    {
        id: 'led-4', pool_id: 'pool-8', pool_name: 'YouTube Premium', platform_emoji: '▶️',
        counterparty_id: 'user-lk', counterparty_name: 'Liam K',
        counterparty_initials: 'LK', counterparty_color: '#54A0FF',
        type: 'payout', status: 'overdue', amount_cents: 349,
        due_at: '2025-01-28T00:00:00Z', settled_at: null, note: 'Overdue 3 days',
    },
    {
        id: 'led-5', pool_id: 'pool-6', pool_name: 'ChatGPT Plus', platform_emoji: '🤖',
        counterparty_id: MARCUS_W.id, counterparty_name: 'Marcus W',
        counterparty_initials: 'MW', counterparty_color: '#00D1C1',
        type: 'payment', status: 'paid', amount_cents: 999,
        due_at: '2025-01-10T00:00:00Z', settled_at: '2025-01-10T08:05:00Z', note: null,
    },
    {
        id: 'led-6', pool_id: 'pool-3', pool_name: 'Figma Pro', platform_emoji: '🎨',
        counterparty_id: SAM_D.id, counterparty_name: 'Sam D',
        counterparty_initials: 'SD', counterparty_color: '#7B61FF',
        type: 'payment', status: 'paid', amount_cents: 600,
        due_at: '2025-01-01T00:00:00Z', settled_at: '2025-01-01T09:00:00Z', note: null,
    },
    {
        id: 'led-7', pool_id: 'pool-8', pool_name: 'YouTube Premium', platform_emoji: '▶️',
        counterparty_id: 'user-cr', counterparty_name: 'Chris R',
        counterparty_initials: 'CR', counterparty_color: '#A29BFE',
        type: 'payout', status: 'owed', amount_cents: 349,
        due_at: '2025-02-05T00:00:00Z', settled_at: null, note: null,
    },
];

// ─── Notifications ────────────────────────────────────────────────────────────

export const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: 'notif-1', user_id: CURRENT_USER.id, type: 'success',
        icon: '✅', title: 'Payment received',
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
        icon: '🙋', title: 'New join request',
        body: 'Someone wants to join your YouTube Premium Family pool.',
        read: true, action_url: '/my-pools',
        created_at: '2025-01-31T11:30:00Z',
    },
    {
        id: 'notif-4', user_id: CURRENT_USER.id, type: 'info',
        icon: '📢', title: 'Slot available',
        body: 'A Spotify Duo slot you wishlisted is now open.',
        read: true, action_url: '/',
        created_at: '2025-01-29T14:00:00Z',
    },
    {
        id: 'notif-5', user_id: CURRENT_USER.id, type: 'success',
        icon: '🎉', title: 'You saved $12 this month',
        body: 'Your active pools saved you $12.47 vs retail pricing.',
        read: true, action_url: '/savings',
        created_at: '2025-01-28T10:00:00Z',
    },
];
