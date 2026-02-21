// ─── Supabase Hooks — with mock-data fallback ─────────────────────────────────
// When Supabase is not connected, every hook returns typed mock data so the
// entire UI works offline and during development without any env setup.

import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConnected } from './client';
import {
    CURRENT_USER,
    MOCK_POOLS,
    MOCK_MEMBERSHIPS,
    MOCK_LEDGER,
    MOCK_NOTIFICATIONS,
} from '../mock-data';
import type {
    Profile,
    Pool,
    Membership,
    LedgerEntry,
    Notification,
} from '../types';

// ─── Generic hook state ───────────────────────────────────────────────────────

interface HookState<T> {
    data: T;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

// ─── useCurrentUser ───────────────────────────────────────────────────────────

export function useCurrentUser(): HookState<Profile> {
    const [data, setData] = useState<Profile>(CURRENT_USER);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        if (!isSupabaseConnected || !supabase) {
            setData(CURRENT_USER);
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
            setData(CURRENT_USER);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);
    return { data, loading, error, refetch: fetchData };
}

// ─── usePools ─────────────────────────────────────────────────────────────────

interface PoolFilters {
    category?: string;
    status?: string;
    searchQuery?: string;
    maxPrice?: number;
    sortBy?: string;
    ownerId?: string;
}

export function usePools(filters?: PoolFilters): HookState<Pool[]> {
    const [data, setData] = useState<Pool[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPools = useCallback(async () => {
        setLoading(true);
        setError(null);

        const isRealSupabase = isSupabaseConnected &&
            supabase &&
            !import.meta.env.VITE_SUPABASE_URL?.includes('placeholder') &&
            !import.meta.env.VITE_SUPABASE_URL?.includes('your_url');

        if (!isRealSupabase) {
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
                const platform = await import('../constants').then(m => m.getPlatform);
                result = result.filter((p) => {
                    const plat = platform(p.platform_id);
                    return (
                        plat?.name.toLowerCase().includes(q) ||
                        p.plan_name.toLowerCase().includes(q) ||
                        p.owner.display_name.toLowerCase().includes(q)
                    );
                });
            }
            if (filters?.maxPrice !== undefined) {
                result = result.filter((p) => p.price_per_slot <= (filters.maxPrice ?? Infinity) * 100);
            }
            if (filters?.sortBy === 'price_asc') result.sort((a, b) => a.price_per_slot - b.price_per_slot);
            else if (filters?.sortBy === 'price_desc') result.sort((a, b) => b.price_per_slot - a.price_per_slot);
            else if (filters?.sortBy === 'rating') result.sort((a, b) => b.owner.rating - a.owner.rating);
            else if (filters?.sortBy === 'slots_remaining') {
                result.sort((a, b) => (b.slots_total - b.slots_filled) - (a.slots_total - a.slots_filled));
            }
            setData(result);
            await new Promise(resolve => setTimeout(resolve, 800)); // Artificial delay for skeletons
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
                const platform = await import('../constants').then(m => m.getPlatform);
                result = result.filter((p) => {
                    const plat = platform(p.platform_id);
                    return (
                        plat?.name.toLowerCase().includes(q) ||
                        p.plan_name.toLowerCase().includes(q) ||
                        p.owner.display_name.toLowerCase().includes(q)
                    );
                });
            }

            setData(result);
        } catch (e) {
            console.warn('usePools: falling back to mock data', e);
            setError((e as Error).message);
            setData(MOCK_POOLS);
        } finally {
            setLoading(false);
        }
    }, [filters?.category, filters?.status, filters?.searchQuery, filters?.maxPrice, filters?.sortBy, filters?.ownerId]);

    useEffect(() => { fetchPools(); }, [fetchPools, filters?.ownerId]);
    return { data, loading, error, refetch: fetchPools };
}

// ─── usePool (single) ─────────────────────────────────────────────────────────

export function usePool(id: string): HookState<Pool | null> {
    const [data, setData] = useState<Pool | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        if (!isSupabaseConnected || !supabase) {
            setData(MOCK_POOLS.find((p) => p.id === id) ?? null);
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
            setData(MOCK_POOLS.find((p) => p.id === id) ?? null);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchData(); }, [fetchData]);
    return { data, loading, error, refetch: fetchData };
}

// ─── useMemberships ───────────────────────────────────────────────────────────

export function useMemberships(): HookState<Membership[]> {
    const [data, setData] = useState<Membership[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        if (!isSupabaseConnected || !supabase) {
            setData(MOCK_MEMBERSHIPS);
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
            setData(MOCK_MEMBERSHIPS);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);
    return { data, loading, error, refetch: fetchData };
}

// ─── useLedger ────────────────────────────────────────────────────────────────

export function useLedger(): HookState<LedgerEntry[]> {
    const [data, setData] = useState<LedgerEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        if (!isSupabaseConnected || !supabase) {
            setData(MOCK_LEDGER);
            setLoading(false);
            return;
        }
        try {
            const { data: rows, error: err } = await supabase
                .from('ledger')
                .select(`
                    *,
                    membership:memberships(
                        *,
                        pool:pools(*, owner:profiles(*))
                    )
                `)
                .order('due_date', { ascending: false });

            if (err) throw err;

            // Map join result to LedgerEntry format if necessary, or just cast if schema matches
            setData((rows ?? []) as any[]);
        } catch (e) {
            setError((e as Error).message);
            setData(MOCK_LEDGER);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);
    return { data, loading, error, refetch: fetchData };
}

// ─── useNotifications ────────────────────────────────────────────────────────

interface NotificationsHookResult extends HookState<Notification[]> {
    unreadCount: number;
    markRead: (id: string) => Promise<void>;
    markAllRead: () => Promise<void>;
}

export function useNotifications(): NotificationsHookResult {
    const [data, setData] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        if (!isSupabaseConnected || !supabase) {
            setData(MOCK_NOTIFICATIONS);
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
            setData(MOCK_NOTIFICATIONS);
        } finally {
            setLoading(false);
        }
    }, []);

    const markRead = async (id: string) => {
        if (!isSupabaseConnected || !supabase) return;
        const { error } = await supabase!.from('notifications').update({ read: true }).eq('id', id);
        if (!error) {
            setData((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
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

        const isRealSupabase = isSupabaseConnected &&
            supabase &&
            !(import.meta as any).env.VITE_SUPABASE_URL?.includes('placeholder') &&
            !(import.meta as any).env.VITE_SUPABASE_URL?.includes('your_url');

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

    return { data, loading, error, refetch: fetchData, unreadCount, markRead, markAllRead };
}
