import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConnected } from './client';
import { getHybridModeError, resolveDataMode } from '../data-mode';
import type { JoinRequest } from '../types';
import type { DataHookOptions, HookState } from './hooks';

export function useJoinRequests(options?: DataHookOptions): HookState<JoinRequest[]> {
    const [data, setData] = useState<JoinRequest[]>([]);
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
            setError(getHybridModeError('join requests'));
            setData([]);
            setLoading(false);
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch join requests for pools owned by the current user
            const { data: rows, error: err } = await supabase
                .from('join_requests')
                .select(`
                    id,
                    pool_id,
                    requester_id,
                    message,
                    status,
                    created_at,
                    pool:pools!inner(id, platform, plan_name, owner_id),
                    requester:profiles(id, display_name, username, avatar_color)
                `)
                .eq('pool.owner_id', user.id)
                .order('created_at', { ascending: false });

            if (err) throw err;

            // Clean up the joined structure to match JoinRequest type precisely
            const formatted = (rows || []).map((row: any) => ({
                id: row.id,
                pool_id: row.pool_id,
                requester_id: row.requester_id,
                message: row.message,
                status: row.status,
                created_at: row.created_at,
                pool: row.pool,
                requester: row.requester
            }));

            setData(formatted as JoinRequest[]);
        } catch (e) {
            setError((e as Error).message);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [options?.allowDemoFallback]);

    useEffect(() => {
        fetchData();

        const isRealSupabase = resolveDataMode({ allowDemoFallback: options?.allowDemoFallback ?? false }) === 'production' &&
            isSupabaseConnected &&
            supabase;

        if (!isRealSupabase) return;

        const channel = supabase!
            .channel('join_requests_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'join_requests',
                },
                () => {
                    fetchData();
                }
            )
            .subscribe();

        return () => {
            supabase!.removeChannel(channel);
        };
    }, [fetchData, options?.allowDemoFallback]);

    return { data, loading, error, refetch: fetchData };
}
