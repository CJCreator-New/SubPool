// ─── SubPool — Application Constants ──────────────────────────────────────────

import type { PoolCategory } from './types';

// ─── Platform Registry ────────────────────────────────────────────────────────

export interface Platform {
    id: string;
    name: string;
    icon: string;           // emoji
    color: string;           // icon foreground/accent hex
    bg: string;           // dark tile background hex
    category: PoolCategory;
}

export const PLATFORMS: Platform[] = [
    // Entertainment
    { id: 'netflix', name: 'Netflix', icon: '🎬', color: '#E50914', bg: '#1A0203', category: 'entertainment' },
    { id: 'spotify', name: 'Spotify', icon: '🎵', color: '#1DB954', bg: '#011B09', category: 'entertainment' },
    { id: 'youtube', name: 'YouTube', icon: '▶️', color: '#FF0000', bg: '#1A0000', category: 'entertainment' },
    { id: 'disneyplus', name: 'Disney+', icon: '✨', color: '#113CCF', bg: '#000E24', category: 'entertainment' },
    { id: 'hulu', name: 'Hulu', icon: '📺', color: '#1CE783', bg: '#001A0B', category: 'entertainment' },
    { id: 'appletv', name: 'Apple TV+', icon: '🍎', color: '#F5F5F5', bg: '#1A1A1A', category: 'entertainment' },
    // Work & Productivity
    { id: 'notion', name: 'Notion', icon: '📋', color: '#FFFFFF', bg: '#1A1A1A', category: 'work' },
    { id: 'figma', name: 'Figma', icon: '🎨', color: '#A259FF', bg: '#140A24', category: 'work' },
    { id: 'slack', name: 'Slack', icon: '💬', color: '#611F69', bg: '#0A0A1A', category: 'work' },
    { id: 'github', name: 'GitHub', icon: '🐙', color: '#F0F6FC', bg: '#0D1117', category: 'work' },
    { id: 'adobe', name: 'Adobe CC', icon: '🅰️', color: '#FF0000', bg: '#1A0000', category: 'work' },
    { id: 'linear', name: 'Linear', icon: '📐', color: '#5E6AD2', bg: '#0A0A1A', category: 'productivity' },
    // AI
    { id: 'chatgpt', name: 'ChatGPT', icon: '🤖', color: '#10A37F', bg: '#031A14', category: 'ai' },
    { id: 'claude', name: 'Claude', icon: '🧠', color: '#D4A574', bg: '#1A1200', category: 'ai' },
    { id: 'cursor', name: 'Cursor', icon: '⌨️', color: '#8B5CF6', bg: '#0D0A1A', category: 'ai' },
    { id: 'midjourney', name: 'Midjourney', icon: '🎭', color: '#FFFFFF', bg: '#0A0A0A', category: 'ai' },
    { id: 'perplexity', name: 'Perplexity', icon: '🔍', color: '#20B2AA', bg: '#00131A', category: 'ai' },
];

export function getPlatform(id: string): Platform | undefined {
    return PLATFORMS.find((p) => p.id === id);
}

// ─── Format helpers ───────────────────────────────────────────────────────────

/**
 * Format cents to a price string.
 * formatPrice(499)  → "$4.99"
 * formatPrice(1800) → "$18.00"
 */
export function formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Format an ISO date string to a short label.
 * formatDate("2025-02-28T00:00:00Z") → "Feb 28"
 */
export function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}

/**
 * Relative time from now.
 * timeAgo("2025-01-30T10:30:00Z") → "2h ago" / "3d ago" / "just now"
 */
export function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days = Math.floor(diff / 86_400_000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return formatDate(iso);
}

/**
 * Calculate savings percentage.
 * calcSavings(totalRetailCents, slots) compare against per-slot cost.
 * e.g. calcSavings(1599, 499) → 69  (69% saved vs Netflix full price)
 */
export function calcSavings(retailCents: number, poolCents: number): number {
    if (retailCents <= 0) return 0;
    return Math.round(((retailCents - poolCents) / retailCents) * 100);
}

/**
 * Format a number with comma thousands separators.
 * abbrevNumber(3200) → "3.2k"
 */
export function abbrevNumber(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
    return String(n);
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export interface NavItem {
    icon: string;
    label: string;
    path: string;
    badge?: string;
    section: string;
}

export const NAV_ITEMS: NavItem[] = [
    // DISCOVER
    { icon: '🌐', label: 'Browse', path: '/', section: 'DISCOVER' },
    { icon: '📈', label: 'Market', path: '/market', section: 'DISCOVER' },
    { icon: '🎯', label: 'Wishlist', path: '/wishlist', section: 'DISCOVER' },
    { icon: '🗂️', label: 'My Pools', path: '/my-pools', section: 'DISCOVER' },
    { icon: '➕', label: 'List a Pool', path: '/list', section: 'DISCOVER' },
    // MANAGE
    { icon: '💰', label: 'Ledger', path: '/ledger', section: 'MANAGE', badge: '3' },
    { icon: '💵', label: 'Payouts', path: '/payouts', section: 'MANAGE' },
    { icon: '📅', label: 'Billing', path: '/billing', section: 'MANAGE' },
    { icon: '💬', label: 'Messages', path: '/messages', section: 'MANAGE', badge: '4' },
    { icon: '🔔', label: 'Notifications', path: '/notifications', section: 'MANAGE', badge: '2' },
    // ACCOUNT
    { icon: '👤', label: 'Profile', path: '/profile', section: 'ACCOUNT' },
    { icon: '📊', label: 'Savings', path: '/savings', section: 'ACCOUNT' },
];

export const NAV_SECTIONS = ['DISCOVER', 'MANAGE', 'ACCOUNT'] as const;

export const BOTTOM_TABS: Pick<NavItem, 'icon' | 'label' | 'path'>[] = [
    { icon: '🌐', label: 'Browse', path: '/' },
    { icon: '🗂️', label: 'My Pools', path: '/my-pools' },
    { icon: '➕', label: 'List', path: '/list' },
    { icon: '💰', label: 'Ledger', path: '/ledger' },
    { icon: '👤', label: 'Profile', path: '/profile' },
];

// ─── Fees ─────────────────────────────────────────────────────────────────────

export const PLATFORM_FEE_BPS = 500;  // 5 %
export const PROCESSING_FEE_BPS = 290;  // 2.9 %
export const PROCESSING_FLAT_USD = 0.30;

// ─── Page titles ──────────────────────────────────────────────────────────────

export const PAGE_TITLES: Record<string, string> = {
    '/': 'Browse Pools',
    '/market': 'Market Intelligence',
    '/wishlist': 'Wishlist',
    '/my-pools': 'My Pools',
    '/list': 'List a Pool',
    '/ledger': 'Ledger',
    '/payouts': 'Payouts',
    '/billing': 'Billing',
    '/messages': 'Messages',
    '/notifications': 'Notifications',
    '/profile': 'Profile',
    '/savings': 'Savings',
    '/payment/method': 'Payment Method',
    '/payment/confirm': 'Confirm Payment',
};

// ─── Filter options ───────────────────────────────────────────────────────────

export const POOL_FILTERS = ['all', 'entertainment', 'work', 'productivity', 'ai', 'open only'] as const;
export type PoolFilter = (typeof POOL_FILTERS)[number];

export const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest first' },
    { value: 'price_asc', label: 'Price: low → high' },
    { value: 'price_desc', label: 'Price: high → low' },
    { value: 'rating', label: 'Highest rated' },
    { value: 'slots_remaining', label: 'Slots remaining' },
] as const;
