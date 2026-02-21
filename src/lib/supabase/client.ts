// ─── Supabase Client ──────────────────────────────────────────────────────────
// Uses createClient from @supabase/supabase-js (Vite-compatible, not SSR).
// When env vars are absent the app falls back to mock data — see hooks.ts.

import { createClient, SupabaseClient } from '@supabase/supabase-js';

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
 */
export const supabase: SupabaseClient | null = isSupabaseConnected
    ? createClient(supabaseUrl!, supabaseKey!)
    : null;

// ─── Typed table helpers (extend as schema grows) ─────────────────────────────

export type Tables = {
    pools: Record<string, unknown>;
    users: Record<string, unknown>;
    slots: Record<string, unknown>;
    ledger: Record<string, unknown>;
    notifications: Record<string, unknown>;
    messages: Record<string, unknown>;
    threads: Record<string, unknown>;
    wishlist: Record<string, unknown>;
    payouts: Record<string, unknown>;
};

/**
 * Convenience typed table accessor.
 * Usage: `db('pools').select('*')`
 */
export function db(table: keyof Tables) {
    if (!supabase) throw new Error('Supabase not connected');
    return supabase.from(table);
}
