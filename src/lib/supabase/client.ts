// @ts-nocheck
// ─── Supabase Client ──────────────────────────────────────────────────────────
// Uses createClient from @supabase/supabase-js (Vite-compatible, not SSR).
// When env vars are absent the app falls back to mock data — see hooks.ts.

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Whether Supabase credentials are configured.
 * Hooks check this flag and fall back to mock data when false.
 */
export const isSupabaseConnected: boolean =
    Boolean(supabaseUrl) && Boolean(supabaseKey);

/**
 * Supabase singleton client.
 * Returns null when credentials are missing so the rest of the app
 * can branch without throwing.
 * 
 * Typed with the Database schema for full type safety on all queries.
 */
export const supabase: SupabaseClient<Database> | null = isSupabaseConnected
    ? createClient<Database>(supabaseUrl!, supabaseKey!)
    : null;

// ─── Typed table helpers (extend as schema grows) ─────────────────────────────

export type Tables = {
    pools: Record<string, unknown>;
    profiles: Record<string, unknown>;
    memberships: Record<string, unknown>;
    join_requests: Record<string, unknown>;
    ledger: Record<string, unknown>;
    notifications: Record<string, unknown>;
    messages: Record<string, unknown>;
    threads: Record<string, unknown>;
    wishlist: Record<string, unknown>;
    payouts: Record<string, unknown>;
    analytics_events: Record<string, unknown>;
    pool_market_metrics: Record<string, unknown>;
    platform_pricing: Record<string, unknown>;
};

/**
 * Convenience typed table accessor.
 * Usage: `db('pools').select('*')`
 */
export function db(table: keyof Tables) {
    if (!supabase) throw new Error('Supabase not connected');
    return supabase.from(table);
}
