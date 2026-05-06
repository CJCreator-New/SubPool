// @ts-nocheck
// â”€â”€â”€ Supabase Hooks â€” with mock-data fallback â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// When Supabase is not connected, every hook returns typed mock data so the
// entire UI works offline and during development without any env setup.

import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConnected } from './client';
import { useAuth } from '../supabase/auth';
import { getHybridModeError, resolveDataMode } from '../data-mode';
import { getPlatform } from '../constants';
import {
    CURRENT_USER,
    MOCK_POOLS,
    MOCK_MEMBERSHIPS,
    MOCK_LEDGER,
    MOCK_NOTIFICATIONS,
} from '../mock-data';
import { PLATFORM_PRICING_SEED, PlatformPricing } from '../pricing-seed';
import type {
    Profile,
    Pool,
    Membership,
    LedgerEntry, Message,
    Notification,
} from '../types';
import type { ListQuery, ListResult } from '../list-query';

// â”€â”€â”€ Generic hook state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface HookState<T> {
    data: T;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export interface DataHookOptions {
    allowDemoFallback?: boolean;
}

// â”€â”€â”€ useCurrentUser â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function useCurrentUser(options?: DataHookOptions): HookState<Profile> {
    const [data, setData] = useState<Profile>(CURRENT_USER);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        const mode = resolveDataMode({ allowDemoFallback: options?.allowDemoFallback ?? false });
        if (mode === 'demo') {
            // Error: do not fall back to mock user
            setLoading(false);
            return;
        }
        if (!isSupabaseConnected || !supabase) {
            setError(getHybridModeError('current user'));
            setLoading(false);
            return;
        }
        try {
            const { data: { user }, error: authErr } = await supabase.auth.getUser();
            if (authErr || !user) throw authErr ?? new Error('Not signed in');
            const { data: profile, error: profileErr } = await supabase
                .from('profiles').select('*').eq('id', user.id).single();
            if (profileErr) throw profileErr;
            setData(profile as Profile);
        } catch (e) {
            setError((e as Error).message);
            // Error: do not fall back to mock user
        } finally {
            setLoading(false);
        }
    }, [options?.allowDemoFallback]);

    useEffect(() => { fetchData(); }, [fetchData]);
    return { data, loading, error, refetch: fetchData };
}

// â”€â”€â”€ usePools â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface PoolFilters extends Record<string, unknown> {
    category?: string;
    status?: string;
    searchQuery?: string;
    maxPrice?: number;
    sortBy?: string;
    ownerId?: string;
}

export function usePools(filters?: PoolFilters, options?: DataHookOptions): HookState<Pool[]> {
    const [data, setData] = useState<Pool[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPools = useCallback(async () => {
        setLoading(true);
        setError(null);

        const mode = resolveDataMode({ allowDemoFallback: options?.allowDemoFallback ?? false });
        const isRealSupabase = mode === 'production' && isSupabaseConnected && supabase;

        if (mode === 'demo') {
            let result = [...MOCK_POOLS];
            if (filters?.ownerId) {
                result = result.filter(p => p.owner_id === filters.ownerId);
            }
            if (filters?.category && filters.category !== 'all') {
                result = result.filter((p) => p.category === filters.category);
            }
            if (filters?.status === 'open only') {
                result = result.filter((p) => p.status === 'open');
            } else if (filters?.status && filters.status !== 'all') {
                result = result.filter((p) => p.status === filters.status);
            }
            if (filters?.searchQuery) {
                const q = filters.searchQuery.toLowerCase();
                result = result.filter((p) => {
                    const plat = getPlatform(p.platform);
                    return (
                        plat?.name.toLowerCase().includes(q) ||
                        p.plan_name.toLowerCase().includes(q) ||
                        (p.owner?.display_name ?? p.owner?.username ?? '').toLowerCase().includes(q)
                    );
                });
            }
            if (filters?.maxPrice !== undefined) {
                result = result.filter((p) => p.price_per_slot <= (filters.maxPrice ?? Infinity) * 100);
            }
            if (filters?.sortBy === 'price_asc') result.sort((a, b) => a.price_per_slot - b.price_per_slot);
            else if (filters?.sortBy === 'price_desc') result.sort((a, b) => b.price_per_slot - a.price_per_slot);
            else if (filters?.sortBy === 'rating') result.sort((a, b) => (b.owner?.rating ?? 0) - (a.owner?.rating ?? 0));
            else if (filters?.sortBy === 'slots_remaining') {
                result.sort((a, b) => (b.total_slots - b.filled_slots) - (a.total_slots - a.filled_slots));
            }
            setData(result);
            // Demo delay removed for production
            setLoading(false);
            return;
        }
        if (!isRealSupabase) {
            setError(getHybridModeError('pool listings'));
            setData([]);
            setLoading(false);
            return;
        }

        try {
            let query = supabase!.from('pools').select('*, owner:profiles(*)');

            if (filters?.ownerId) {
                query = query.eq('owner_id', filters.ownerId);
            }
            if (filters?.category && filters.category !== 'all') {
                query = query.eq('category', filters.category);
            }
            if (filters?.status === 'open only') {
                query = query.eq('status', 'open');
            } else if (filters?.status && filters.status !== 'all') {
                query = query.eq('status', filters.status);
            }

            // Ordering
            if (filters?.sortBy === 'price_asc') query = query.order('price_per_slot', { ascending: true });
            else if (filters?.sortBy === 'price_desc') query = query.order('price_per_slot', { ascending: false });
            else query = query.order('created_at', { ascending: false });

            const { data: rows, error: err } = await query;
            if (err) throw err;

            let result = rows as Pool[];

            if (filters?.searchQuery) {
                const q = filters.searchQuery.toLowerCase();
                result = result.filter((p) => {
                    const plat = getPlatform(p.platform);
                    return (
                        plat?.name.toLowerCase().includes(q) ||
                        p.plan_name.toLowerCase().includes(q) ||
                        (p.owner?.display_name ?? p.owner?.username ?? '').toLowerCase().includes(q)
                    );
                });
            }

            setData(result);
        } catch (e) {
            console.warn('usePools: falling back to mock data', e);
            setError((e as Error).message);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [filters?.category, filters?.status, filters?.searchQuery, filters?.maxPrice, filters?.sortBy, filters?.ownerId, options?.allowDemoFallback]);

    useEffect(() => { 
        fetchPools(); 

        const mode = resolveDataMode({ allowDemoFallback: options?.allowDemoFallback ?? false });
        if (mode !== 'production' || !isSupabaseConnected || !supabase) return;

        const channel = supabase.channel('pools-all')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'pools' },
                (payload) => {
                    if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
                        fetchPools(); // Refetch to get joined profile data
                    }
                }
            )
            .subscribe();

        return () => { supabase?.removeChannel(channel); };
    }, [fetchPools, filters?.ownerId, supabase]);
    return { data, loading, error, refetch: fetchPools };
}

export function usePoolsPaginated(
    query: ListQuery<PoolFilters>,
    options?: DataHookOptions,
): HookState<ListResult<Pool>> {
    const [data, setData] = useState<ListResult<Pool>>({ items: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPools = useCallback(async () => {
        setLoading(true);
        setError(null);

        const mode = resolveDataMode({ allowDemoFallback: options?.allowDemoFallback ?? false });
        if (mode !== 'production') {
            const base = MOCK_POOLS;
            const start = query.cursor ? Number(query.cursor) : 0;
            const limit = query.limit || 9;
            const filtered = base.filter((pool) => {
                if (query.filters?.category && query.filters.category !== 'all') {
                    if (pool.category !== query.filters.category) return false;
                }
                if (query.filters?.status === 'open only' && pool.status !== 'open') return false;
                if (query.filters?.searchQuery) {
                    const q = query.filters.searchQuery.toLowerCase();
                    const plat = getPlatform(pool.platform);
                    const owner = (pool.owner?.display_name ?? pool.owner?.username ?? '').toLowerCase();
                    if (!plat?.name.toLowerCase().includes(q) && !pool.plan_name.toLowerCase().includes(q) && !owner.includes(q)) {
                        return false;
                    }
                }
                return true;
            });
            const page = filtered.slice(start, start + limit);
            const nextCursor = start + limit < filtered.length ? String(start + limit) : undefined;
            setData({ items: page, nextCursor, totalApprox: filtered.length });
            setLoading(false);
            return;
        }

        try {
            let supabaseQuery = supabase!.from('pools').select('*, owner:profiles(*)').order('created_at', { ascending: false });

            if (query.filters?.category && query.filters.category !== 'all') {
                supabaseQuery = supabaseQuery.eq('category', query.filters.category);
            }
            if (query.filters?.status === 'open only') {
                supabaseQuery = supabaseQuery.eq('status', 'open');
            }
            if (query.filters?.searchQuery) {
                // Use the search_vector column with full-text search
                supabaseQuery = supabaseQuery.textSearch('search_vector', query.filters.searchQuery, {
                    type: 'websearch',
                    config: 'english'
                });
            }

            const start = query.cursor ? Number(query.cursor) : 0;
            const end = start + query.limit - 1;
            const { data: rows, error: err } = await supabaseQuery.range(start, end);
            if (err) throw err;

            const filtered = (rows ?? []) as Pool[];
            const nextCursor = filtered.length === query.limit ? String(start + query.limit) : undefined;
            setData({ items: filtered, nextCursor });
        } catch (e) {
            setError((e as Error).message);
            setData({ items: [] });
        } finally {
            setLoading(false);
        }
    }, [options?.allowDemoFallback, query.cursor, query.filters?.category, query.filters?.searchQuery, query.filters?.status, query.limit]);

    useEffect(() => { fetchPools(); }, [fetchPools]);
    return { data, loading, error, refetch: fetchPools };
}

// â”€â”€â”€ usePool (single) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function usePool(id: string, options?: DataHookOptions): HookState<Pool | null> {
    const [data, setData] = useState<Pool | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        const mode = resolveDataMode({ allowDemoFallback: options?.allowDemoFallback ?? false });
        if (mode === 'demo') {
            setData(null);
            setLoading(false);
            return;
        }
        if (!isSupabaseConnected || !supabase) {
            setError(getHybridModeError('pool details'));
            setData(null);
            setLoading(false);
            return;
        }
        try {
            const { data: row, error: err } = await supabase
                .from('pools').select('*, owner:profiles(*)').eq('id', id).single();
            if (err) throw err;
            setData(row as Pool);
        } catch (e) {
            setError((e as Error).message);
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [id, options?.allowDemoFallback]);

    useEffect(() => { 
        fetchData(); 

        const mode = resolveDataMode({ allowDemoFallback: options?.allowDemoFallback ?? false });
        if (mode !== 'production' || !isSupabaseConnected || !supabase || !id) return;

        const channel = supabase.channel(`pool:${id}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'pools', filter: `id=eq.${id}` },
                () => { fetchData(); }
            )
            .subscribe();

        return () => { supabase?.removeChannel(channel); };
    }, [fetchData, supabase]);

    return { data, loading, error, refetch: fetchData };
}

// â”€â”€â”€ useMemberships â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function useMemberships(options?: DataHookOptions): HookState<Membership[]> {
    const [data, setData] = useState<Membership[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        const mode = resolveDataMode({ allowDemoFallback: options?.allowDemoFallback ?? false });
        if (mode === 'demo') {
            setData([]);
            setLoading(false);
            return;
        }
        if (!isSupabaseConnected || !supabase) {
            setError(getHybridModeError('memberships'));
            setData([]);
            setLoading(false);
            return;
        }
        try {
            const { data: rows, error: err } = await supabase
                .from('memberships').select('*, pool:pools(*, owner:profiles(*))');
            if (err) throw err;
            setData((rows ?? []) as Membership[]);
        } catch (e) {
            setError((e as Error).message);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [options?.allowDemoFallback]);

    useEffect(() => { fetchData(); }, [fetchData]);
    return { data, loading, error, refetch: fetchData };
}

// â”€â”€â”€ useLedger â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function useLedger(options?: DataHookOptions): HookState<LedgerEntry[]> {
    const [data, setData] = useState<LedgerEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        const mode = resolveDataMode({ allowDemoFallback: options?.allowDemoFallback ?? false });
        if (mode === 'demo') {
            setData([]);
            setLoading(false);
            return;
        }
        if (!isSupabaseConnected || !supabase) {
            setError(getHybridModeError('ledger'));
            setData([]);
            setLoading(false);
            return;
        }
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not signed in');

            // Find all memberships where user is member OR pool owner.
            // But usually the UI just wants all ledger entries relevant to the user.
            // Instead of a complex RLS, let's just fetch ledger rows where user is member,
            // OR where pool owner is user.
            // Our DB RLS for ledger should allow this.
            const { data: rows, error: err } = await supabase
                .from('ledger')
                .select(`
                    *,
                    membership:memberships(
                        *,
                        user:profiles(*),
                        pool:pools(*, owner:profiles(*))
                    )
                `)
                .order('due_date', { ascending: false });

            if (err) throw err;

            const entries: LedgerEntry[] = (rows ?? []).map((row: any) => {
                const membership = row.membership;
                const pool = membership?.pool;
                const platform = getPlatform(pool?.platform || '');

                const isOwner = pool?.owner_id === user.id;
                const type = isOwner ? 'payout' : 'payment';

                let counterPartyProfile = isOwner ? membership?.user : pool?.owner;
                let counterpartyName = counterPartyProfile?.display_name || counterPartyProfile?.username || 'Unknown';

                return {
                    id: row.id,
                    membership_id: row.membership_id,
                    pool_id: pool?.id || '',
                    pool_name: pool?.plan_name ? `${platform?.name || pool.platform} ${pool.plan_name}` : 'Unknown Pool',
                    platform: pool?.platform || '',
                    platform_emoji: platform?.icon || '📦',
                    counterparty_id: counterPartyProfile?.id || '',
                    counterparty_name: counterpartyName,
                    counterparty_initials: counterpartyName.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase() || '??',
                    counterparty_color: counterPartyProfile?.avatar_color || '#cccccc',
                    type,
                    status: row.status,
                    amount_cents: Math.round(Number(row.amount) * 100),
                    due_at: row.due_date,
                    settled_at: row.paid_at,
                    note: null
                } as LedgerEntry;
            });

            setData(entries);
        } catch (e) {
            setError((e as Error).message);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [options?.allowDemoFallback]);

    useEffect(() => { fetchData(); }, [fetchData]);
    return { data, loading, error, refetch: fetchData };
}

// â”€â”€â”€ useNotifications â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface NotificationsHookResult extends HookState<Notification[]> {
    unreadCount: number;
    markRead: (id: string) => Promise<void>;
    markUnread: (id: string) => Promise<void>;
    markAllRead: () => Promise<void>;
}

export function useNotifications(options?: DataHookOptions): NotificationsHookResult {
    const [data, setData] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        const mode = resolveDataMode({ allowDemoFallback: options?.allowDemoFallback ?? false });
        if (mode === 'demo') {
            setData([]);
            setLoading(false);
            return;
        }
        if (!isSupabaseConnected || !supabase) {
            setError(getHybridModeError('notifications'));
            setData([]);
            setLoading(false);
            return;
        }
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: rows, error: err } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (err) throw err;
            setData((rows ?? []) as Notification[]);
        } catch (e) {
            setError((e as Error).message);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [options?.allowDemoFallback]);

    const markRead = async (id: string) => {
        if (!isSupabaseConnected || !supabase) return;
        const { error } = await supabase!.from('notifications').update({ read: true }).eq('id', id);
        if (!error) {
            setData((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
        }
    };

    const markUnread = async (id: string) => {
        if (!isSupabaseConnected || !supabase) return;
        const { error } = await supabase!.from('notifications').update({ read: false }).eq('id', id);
        if (!error) {
            setData((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)));
        }
    };

    const markAllRead = async () => {
        if (!isSupabaseConnected || !supabase) return;
        const { data: { user } } = await supabase!.auth.getUser();
        if (!user) return;
        const { error } = await supabase!.from('notifications').update({ read: true }).eq('user_id', user.id);
        if (!error) {
            setData((prev) => prev.map((n) => ({ ...n, read: true })));
        }
    };

    useEffect(() => {
        fetchData();

        const isRealSupabase = resolveDataMode({ allowDemoFallback: options?.allowDemoFallback ?? false }) === 'production' &&
            isSupabaseConnected &&
            supabase;

        if (!isRealSupabase) return;

        let channel: any;

        supabase!.auth.getUser().then(({ data: { user } }) => {
            if (!user) return;

            // Subscribe to real-time updates for notifications filtered by user_id
            channel = supabase!
                .channel(`notifs:${user.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`
                    },
                    (payload: any) => {
                        setData((prev) => [payload.new as Notification, ...prev]);
                    }
                )
                .subscribe();
        });

        return () => {
            if (channel) supabase!.removeChannel(channel);
        };
    }, [fetchData]);

    const unreadCount = data.filter((n) => !n.read).length;

    return { data, loading, error, refetch: fetchData, unreadCount, markRead, markUnread, markAllRead };
}

// â”€â”€â”€ usePlatformPricing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function usePlatformPricing(platformId: string, planName: string, currency: string, options?: DataHookOptions) {
    const [data, setData] = useState<PlatformPricing | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchPricing = useCallback(async () => {
        setLoading(true);
        const mode = resolveDataMode({ allowDemoFallback: options?.allowDemoFallback ?? false });
        if (mode === 'production' && isSupabaseConnected && supabase) {
            const { data: row } = await supabase
                .from('platform_pricing')
                .select('*')
                .eq('platform_id', platformId)
                .ilike('plan_name', planName)
                .eq('currency', currency)
                .maybeSingle();

            if (row) {
                setData(row as PlatformPricing);
                setLoading(false);
                return;
            }
        }

        // Fallback to seed data
        const seed = PLATFORM_PRICING_SEED.find(
            s => s.platform_id === platformId &&
                s.plan_name.toLowerCase() === planName.toLowerCase() &&
                s.currency === currency
        );
        setData(seed || null);
        setLoading(false);
    }, [platformId, planName, currency, options?.allowDemoFallback]);

    useEffect(() => {
        fetchPricing();
    }, [fetchPricing]);

    return { data, loading };
}

// â”€â”€â”€ useMessages â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface MessagesHookResult {
    data: Message[];
    loading: boolean;
    error: string | null;
    typingUsers: string[];
    refetch: () => Promise<void>;
    sendMessage: (content: string, replyToId?: string) => Promise<void>;
    toggleReaction: (messageId: string, emoji: string) => Promise<void>;
    markAsRead: () => Promise<void>;
    setTyping: (isTyping: boolean) => void;
}

export function useMessages(poolId?: string, options?: { allowDemoFallback?: boolean }): MessagesHookResult {
    const { profile } = useAuth();
    const [data, setData] = useState<Message[]>([]);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!poolId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);

        const mode = resolveDataMode({ allowDemoFallback: options?.allowDemoFallback ?? false });
        if (mode === 'demo') {
            setData([]);
            setLoading(false);
            return;
        }

        if (!isSupabaseConnected || !supabase) {
            setError(getHybridModeError('messages'));
            setData([]);
            setLoading(false);
            return;
        }

        try {
            const { data: rows, error: err } = await supabase
                .from('messages')
                .select('*, sender:profiles(*), message_reactions(*)')
                .eq('pool_id', poolId)
                .order('created_at', { ascending: true });

            if (err) throw err;
            setData((rows ?? []) as Message[]);
        } catch (e) {
            setError((e as Error).message);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [poolId, options?.allowDemoFallback]);

    useEffect(() => {
        fetchData();

        const isRealSupabase = resolveDataMode({ allowDemoFallback: options?.allowDemoFallback ?? false }) === 'production' &&
            isSupabaseConnected &&
            supabase;

        if (!isRealSupabase || !poolId) return;

        const channel = supabase!
            .channel(`messages:${poolId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `pool_id=eq.${poolId}`
                },
                () => {
                    fetchData();
                }
            )
            .on('broadcast', { event: 'typing' }, ({ payload }) => {
                const { user, isTyping } = payload;
                if (user) {
                    setTypingUsers(prev => {
                        if (isTyping && !prev.includes(user)) return [...prev, user];
                        if (!isTyping) return prev.filter(u => u !== user);
                        return prev;
                    });
                }
            })
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'message_reactions'
                },
                (payload: any) => {
                    const reaction = payload.new || payload.old;
                    // Only refetch if the reaction belongs to a message in our current view
                    // Use a functional update check to avoid stale closure if possible, 
                    // or just refetch and let the backend decide.
                    // For simplicity and correctness with Realtime, we refetch.
                    if (reaction && reaction.message_id) {
                        fetchData();
                    }
                }
            )
            .subscribe();

        return () => {
            supabase!.removeChannel(channel);
        };
    }, [fetchData, poolId, options?.allowDemoFallback]);

    const handleSendMessage = async (content: string, replyToId?: string) => {
        if (!isSupabaseConnected || !supabase || !poolId || !profile) return;

        try {
            const { error } = await supabase.from('messages').insert({
                pool_id: poolId,
                content,
                reply_to_id: replyToId || null,
                sender_id: profile.id,
                message_type: 'text'
            });

            if (error) throw error;
            
            // Clear typing when message sent
            setTypingStatus(false);
        } catch (e) {
            console.error('Failed to send message:', e);
            throw e;
        }
    };

    const toggleReaction = async (messageId: string, emoji: string) => {
        if (!isSupabaseConnected || !supabase) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Check if it already exists
        const { data: existing } = await supabase
            .from('message_reactions')
            .select('id')
            .eq('message_id', messageId)
            .eq('user_id', user.id)
            .eq('emoji', emoji)
            .maybeSingle();

        if (existing) {
            await supabase.from('message_reactions').delete().eq('id', existing.id);
        } else {
            await supabase.from('message_reactions').insert({
                message_id: messageId,
                user_id: user.id,
                emoji
            } as any);
        }
    };

    const setTypingStatus = (isTyping: boolean) => {
        if (!isSupabaseConnected || !supabase || !poolId || !profile) return;
        const channel = supabase!.channel(`messages:${poolId}`);
        const username = profile.display_name || profile.username || 'Member';
        channel.send({
            type: 'broadcast',
            event: 'typing',
            payload: { user: username, isTyping }
        });
    };

    const markAsRead = async () => {
        if (!isSupabaseConnected || !supabase || !poolId || !profile) return;
        const { error } = await supabase.rpc('mark_messages_read', { p_pool_id: poolId });
        if (!error) {
            setData((prev) => prev.map((message) => ({
                ...message,
                read_by: Array.from(new Set([...(message.read_by ?? []), profile.id])),
            })));
        }
    };

    return {
        data,
        loading,
        error,
        typingUsers,
        refetch: fetchData,
        sendMessage: handleSendMessage,
        toggleReaction,
        markAsRead,
        setTyping: setTypingStatus
    };
}

/**
 * Hook to manage push notification tokens.
 */
export function usePushNotifications() {
    const registerToken = useCallback(async (token: string, platform: 'web' | 'ios' | 'android' = 'web') => {
        if (!isSupabaseConnected || !supabase) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        try {
            const { error } = await supabase
                .from('push_tokens')
                .upsert({
                    user_id: user.id,
                    token,
                    platform,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id, token' });

            if (error) throw error;
        } catch (e) {
            console.error('Push token registration failed:', e);
        }
    }, []);

    return { registerToken };
}

export interface MonthlyEarning {
    month: string;
    earned: number;
    pending: number;
}

export interface HostEarningsSummaryRow {
    pool_id: string;
    platform: string;
    plan_name: string;
    paid_count: number;
    pending_count: number;
    total_earned: number;
    total_pending: number;
    last_payout_at: string | null;
}

export function useHostEarnings() {
    const [summary, setSummary] = useState<HostEarningsSummaryRow[]>([]);
    const [monthly, setMonthly] = useState<MonthlyEarning[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        const mode = resolveDataMode({ allowDemoFallback: true });
        if (mode === 'demo') {
            setSummary([]);
            setMonthly([
                { month: 'Jan', earned: 4200, pending: 150 },
                { month: 'Feb', earned: 3800, pending: 200 }
            ]);
            setLoading(false);
            return;
        }

        if (!isSupabaseConnected || !supabase) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const { data: summ, error: err1 } = await supabase
                .from('host_earnings_summary')
                .select('*');
            if (err1) throw err1;

            const { data: mnth, error: err2 } = await supabase
                .rpc('get_monthly_earnings');
            if (err2) throw err2;

            setSummary(summ as HostEarningsSummaryRow[]);
            setMonthly(mnth as unknown as MonthlyEarning[]);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    return { summary, monthly, loading, error };
}

export function useReferralStats() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ count: 0, rewardsGranted: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        const mode = resolveDataMode({ allowDemoFallback: true });
        if (mode === 'demo') {
            setStats({ count: 12, rewardsGranted: 3 });
            setLoading(false);
            return;
        }

        if (!user?.id || !supabase) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const { count: total, error: err1 } = await supabase
                .from('referrals')
                .select('*', { count: 'exact', head: true })
                .eq('referrer_id', user.id);
            if (err1) throw err1;

            const { count: rewarded, error: err2 } = await supabase
                .from('referrals')
                .select('*', { count: 'exact', head: true })
                .eq('referrer_id', user.id)
                .eq('reward_granted', true);
            if (err2) throw err2;

            setStats({
                count: total ?? 0,
                rewardsGranted: rewarded ?? 0
            });
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);
    useEffect(() => { fetchData(); }, [fetchData]);

    return { stats, loading, error, refetch: fetchData };
}

export function useAdminUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*, referrals:referrals(count)')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setUsers(data || []);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    return { users, loading, error, refetch: fetchData };
}

export function useAdminPools() {
    const [pools, setPools] = useState<Pool[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('pools')
                .select('*, owner:profiles(*)')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setPools(data || []);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    return { pools, loading, error, refetch: fetchData };
}

export { useJoinRequests } from './useJoinRequests';
// â”€â”€â”€ useWatchedPlatforms â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function useWatchedPlatforms(options?: DataHookOptions) {
    const [data, setData] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const mode = resolveDataMode({ allowDemoFallback: options?.allowDemoFallback ?? false });
        
        if (mode === 'demo') {
            const saved = localStorage.getItem('subpool_watched_platforms');
            setData(saved ? JSON.parse(saved) : []);
            setLoading(false);
            return;
        }

        if (!isSupabaseConnected || !supabase) {
            setData([]);
            setLoading(false);
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: rows, error: err } = await supabase
                .from('user_watched_platforms')
                .select('platform_id')
                .eq('user_id', user.id);

            if (err) throw err;
            setData((rows ?? []).map((r: any) => r.platform_id));
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    }, [options?.allowDemoFallback]);

    const toggleWatch = async (platformId: string) => {
        const mode = resolveDataMode({ allowDemoFallback: options?.allowDemoFallback ?? false });
        const isWatched = data.includes(platformId);

        if (mode === 'demo') {
            const next = isWatched ? data.filter(id => id !== platformId) : [...data, platformId];
            setData(next);
            localStorage.setItem('subpool_watched_platforms', JSON.stringify(next));
            return;
        }

        if (!isSupabaseConnected || !supabase) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            if (isWatched) {
                await supabase.from('user_watched_platforms').delete().eq('user_id', user.id).eq('platform_id', platformId);
            } else {
                await supabase.from('user_watched_platforms').insert({ user_id: user.id, platform_id: platformId });
            }
            fetchData();
        } catch (e) {
            console.error('Failed to toggle watch:', e);
        }
    };

    useEffect(() => { fetchData(); }, [fetchData]);

    return { data, loading, error, toggleWatch, refetch: fetchData };
}
