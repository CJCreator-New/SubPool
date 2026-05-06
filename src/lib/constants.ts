import type { PoolCategory } from './types';

export interface Platform {
    id: string;
    name: string;
    icon: string;
    color: string;
    bg: string;
    category: PoolCategory;
}

export const PLATFORMS: Platform[] = [
    { id: 'netflix', name: 'Netflix', icon: '🎬', color: '#E50914', bg: '#1A0203', category: 'OTT' },
    { id: 'spotify', name: 'Spotify', icon: '🎵', color: '#1DB954', bg: '#011B09', category: 'OTT' },
    { id: 'youtube', name: 'YouTube', icon: '▶️', color: '#FF0000', bg: '#1A0000', category: 'OTT' },
    { id: 'disneyplus', name: 'Disney+', icon: '✨', color: '#113CCF', bg: '#000E24', category: 'OTT' },
    { id: 'hulu', name: 'Hulu', icon: '📺', color: '#1CE783', bg: '#001A0B', category: 'OTT' },
    { id: 'appletv', name: 'Apple TV+', icon: '🍎', color: '#F5F5F5', bg: '#1A1A1A', category: 'OTT' },
    { id: 'notion', name: 'Notion', icon: '📋', color: '#FFFFFF', bg: '#1A1A1A', category: 'AI_IDE' },
    { id: 'figma', name: 'Figma', icon: '🎨', color: '#A259FF', bg: '#140A24', category: 'AI_IDE' },
    { id: 'slack', name: 'Slack', icon: '💬', color: '#611F69', bg: '#0A0A1A', category: 'AI_IDE' },
    { id: 'github', name: 'GitHub', icon: '🐙', color: '#F0F6FC', bg: '#0D1117', category: 'AI_IDE' },
    { id: 'adobe', name: 'Adobe CC', icon: '🅰️', color: '#FF0000', bg: '#1A0000', category: 'AI_IDE' },
    { id: 'linear', name: 'Linear', icon: '🔏', color: '#5E6AD2', bg: '#0A0A1A', category: 'productivity' },
    { id: 'chatgpt', name: 'ChatGPT', icon: '🤖', color: '#10A37F', bg: '#031A14', category: 'ai' },
    { id: 'claude', name: 'Claude', icon: '🧠', color: '#D4A574', bg: '#1A1200', category: 'ai' },
    { id: 'cursor', name: 'Cursor', icon: '⌨️', color: '#8B5CF6', bg: '#0D0A1A', category: 'ai' },
    { id: 'midjourney', name: 'Midjourney', icon: '🎭', color: '#FFFFFF', bg: '#0A0A0A', category: 'ai' },
    { id: 'perplexity', name: 'Perplexity', icon: '🔍', color: '#20B2AA', bg: '#00131A', category: 'ai' },
];

export function getPlatform(id: string): Platform | undefined {
    return PLATFORMS.find((platform) => platform.id === id);
}

export function formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
}

export function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}

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

export function calcSavings(retailCents: number, poolCents: number): number {
    if (retailCents <= 0) return 0;
    return Math.round(((retailCents - poolCents) / retailCents) * 100);
}

export function abbrevNumber(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
    return String(n);
}

export interface NavItem {
    icon: string;
    label: string;
    path: string;
    badge?: string;
    section: string;
    requiresAuth?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
    { icon: '🏠', label: 'Overview', path: '/dashboard', section: 'DISCOVER', requiresAuth: true },
    { icon: '🌐', label: 'Browse', path: '/', section: 'DISCOVER' },
    { icon: '📈', label: 'Market', path: '/market', section: 'DISCOVER' },
    { icon: '💡', label: 'Savings Hub', path: '/savings', section: 'DISCOVER' },
    { icon: '🎯', label: 'Wishlist', path: '/wishlist', section: 'DISCOVER' },
    { icon: '🗂️', label: 'My Pools', path: '/my-pools', section: 'DISCOVER', requiresAuth: true },
    { icon: '➕', label: 'List a Pool', path: '/list', section: 'DISCOVER', requiresAuth: true },
    { icon: '💰', label: 'Ledger', path: '/ledger', section: 'MANAGE', requiresAuth: true },
    { icon: '💵', label: 'Payouts', path: '/payouts', section: 'MANAGE', requiresAuth: true },
    { icon: '🧾', label: 'Billing', path: '/billing', section: 'MANAGE', requiresAuth: true },
    { icon: '📊', label: 'Subscriptions', path: '/subscriptions', section: 'MANAGE', requiresAuth: true },
    { icon: '🏢', label: 'Enterprise', path: '/enterprise', section: 'MANAGE', requiresAuth: true },
    { icon: '💬', label: 'Messages', path: '/messages', section: 'MANAGE', requiresAuth: true },
    { icon: '🔔', label: 'Notifications', path: '/notifications', section: 'MANAGE', requiresAuth: true },
    { icon: '👤', label: 'Profile', path: '/profile', section: 'ACCOUNT', requiresAuth: true },
    { icon: '⭐', label: 'Plans', path: '/plans', section: 'ACCOUNT' },
    { icon: '🛡️', label: 'Admin', path: '/admin', section: 'ACCOUNT', requiresAuth: true },
];

export const NAV_SECTIONS = ['DISCOVER', 'MANAGE', 'ACCOUNT'] as const;

export const BOTTOM_TABS: Pick<NavItem, 'icon' | 'label' | 'path'>[] = [
    { icon: '🌐', label: 'Browse', path: '/' },
    { icon: '🗂️', label: 'My Pools', path: '/my-pools' },
    { icon: '➕', label: 'List', path: '/list' },
    { icon: '💰', label: 'Ledger', path: '/ledger' },
    { icon: '👤', label: 'Profile', path: '/profile' },
];

export const PLATFORM_FEE_BPS = 500;
export const PROCESSING_FEE_BPS = 290;
export const PROCESSING_FLAT_USD = 30; // 30 cents

export const PAGE_TITLES: Record<string, string> = {
    '/': 'Browse Pools',
    '/dashboard': 'Action Center',
    '/browse': 'Browse Pools',
    '/market': 'Market Intelligence',
    '/wishlist': 'Wishlist',
    '/my-pools': 'My Pools',
    '/list': 'List a Pool',
    '/create': 'Create a Pool',
    '/ledger': 'Ledger',
    '/payouts': 'Payouts',
    '/billing': 'Billing',
    '/subscriptions': 'My Subscriptions',
    '/messages': 'Messages',
    '/notifications': 'Notifications',
    '/profile': 'Profile',
    '/savings': 'Savings Hub',
    '/plans': 'Plans & Upgrades',
    '/admin': 'Admin Panel',
    '/payment/method': 'Payment Method',
    '/payment/confirm': 'Confirm Payment',
};

export const POOL_FILTERS = ['all', 'OTT', 'AI_IDE', 'productivity', 'ai', 'open only'] as const;
export type PoolFilter = (typeof POOL_FILTERS)[number];

export const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest first' },
    { value: 'price_asc', label: 'Price: low → high' },
    { value: 'price_desc', label: 'Price: high → low' },
    { value: 'rating', label: 'Highest rated' },
    { value: 'slots_remaining', label: 'Slots remaining' },
] as const;
