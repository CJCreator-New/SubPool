import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from './client';
import type { Pool } from '../types';

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const poolKeys = {
    all: ['pools'] as const,
    lists: () => [...poolKeys.all, 'list'] as const,
    list: (filters: string) => [...poolKeys.lists(), { filters }] as const,
    mine: (userId: string) => [...poolKeys.lists(), 'mine', userId] as const,
    details: () => [...poolKeys.all, 'detail'] as const,
    detail: (id: string) => [...poolKeys.details(), id] as const,
};

export const adminKeys = {
    all: ['admin'] as const,
    users: (page: number, limit: number) => [...adminKeys.all, 'users', { page, limit }] as const,
    pools: (page: number, limit: number) => [...adminKeys.all, 'pools', { page, limit }] as const,
};

// ─── Queries ─────────────────────────────────────────────────────────────────

/**
 * Hook for fetching pools with filters and search.
 * Replaces the manual state management in the old usePools hook.
 */
export function usePoolsQuery(search?: string, category?: string) {
    return useQuery({
        queryKey: poolKeys.list(`${search}-${category}`),
        queryFn: async () => {
            if (!supabase) throw new Error('Supabase not connected');
            
            let query = supabase
                .from('pools')
                .select('*, owner:profiles(username, display_name, avatar_url, avatar_color)')
                .order('created_at', { ascending: false });

            if (category && category !== 'all') {
                query = query.eq('category', category);
            }

            if (search) {
                // Assuming search_vector is now available as per Phase 2
                query = query.textSearch('search_vector', search);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as any as Pool[];
        },
        staleTime: 1000 * 60 * 2, // 2 minutes for pool listings
    });
}

/**
 * Infinite query for pool listings.
 */
export function useInfinitePoolsQuery(filters: { search?: string, category?: string, status?: string, minPrice?: number, maxPrice?: number, minRating?: number }) {
    return useInfiniteQuery({
        queryKey: poolKeys.list(JSON.stringify(filters)),
        queryFn: async ({ pageParam = 0 }) => {
            const { resolveDataMode } = await import('../data-mode');
            const mode = resolveDataMode({ allowDemoFallback: true });
            
            if (mode === 'demo') {
                const { MOCK_POOLS } = await import('../mock-data');
                const limit = 9;
                const start = pageParam as number;
                const filtered = MOCK_POOLS.filter(p => {
                    if (filters.category && filters.category !== 'all' && p.category !== filters.category) return false;
                    if (filters.search) {
                        const q = filters.search.toLowerCase();
                        if (!p.platform.toLowerCase().includes(q) && !p.plan_name.toLowerCase().includes(q)) return false;
                    }
                    return true;
                });
                const items = filtered.slice(start, start + limit);
                return {
                    items: items as any[],
                    nextCursor: items.length === limit ? start + limit : undefined,
                };
            }

            if (!supabase) throw new Error('Supabase not connected');
            const limit = 9;
            const from = pageParam as number;
            const to = from + limit - 1;

            let query = supabase
                .from('pools')
                .select('*, owner:profiles(username, display_name, avatar_url, avatar_color, rating)', { count: 'exact' });

            if (filters.category && filters.category !== 'all') {
                query = query.eq('category', filters.category);
            }
            if (filters.status === 'open') {
                query = query.eq('status', 'open');
            }
            if (filters.minPrice !== undefined) {
                query = query.gte('price_per_slot', filters.minPrice);
            }
            if (filters.maxPrice !== undefined) {
                query = query.lte('price_per_slot', filters.maxPrice);
            }

            if (filters.search) {
                query = query.textSearch('search_vector', filters.search, { type: 'websearch', config: 'english' });
            }

            const { data, error } = await query
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;
            
            const items = (data || []) as any as Pool[];
            return {
                items,
                nextCursor: items.length === limit ? from + limit : undefined,
            };
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        staleTime: 1000 * 60 * 2,
    });
}

/**
 * Hook for fetching a single pool's details.
 */
export function usePoolDetailQuery(poolId: string) {
    return useQuery({
        queryKey: poolKeys.detail(poolId),
        queryFn: async () => {
            if (!supabase) throw new Error('Supabase not connected');
            const { data, error } = await supabase
                .from('pools')
                .select('*, owner:profiles(*)')
                .eq('id', poolId)
                .single();
            if (error) throw error;
            return data as any as Pool;
        },
        enabled: !!poolId,
    });
}

// ─── Admin Queries ────────────────────────────────────────────────────────────

/**
 * Paginated admin user list.
 */
export function useAdminUsersQuery(page = 0, limit = 20) {
    return useQuery({
        queryKey: adminKeys.users(page, limit),
        queryFn: async () => {
            if (!supabase) throw new Error('Supabase not connected');
            const from = page * limit;
            const to = from + limit - 1;

            const { data, error, count } = await supabase
                .from('profiles')
                .select('*, referrals!referred_id(count)', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;
            return { data, count };
        },
    });
}

/**
 * Paginated admin pool list.
 */
export function useAdminPoolsQuery(page = 0, limit = 20) {
    return useQuery({
        queryKey: adminKeys.pools(page, limit),
        queryFn: async () => {
            if (!supabase) throw new Error('Supabase not connected');
            const from = page * limit;
            const to = from + limit - 1;

            const { data, error, count } = await supabase
                .from('pools')
                .select('*, owner:profiles(username, email)', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;
            return { data, count };
        },
    });
}

// ─── User Queries ─────────────────────────────────────────────────────────────

/**
 * Hook for fetching the authenticated user's profile.
 */
export function useProfileQuery(userId?: string) {
    return useQuery({
        queryKey: ['profile', userId],
        queryFn: async () => {
            if (!supabase) throw new Error('Supabase not connected');
            if (!userId) return null;
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            if (error) throw error;
            return data as any;
        },
        enabled: !!userId,
    });
}

/**
 * Hook for fetching dashboard action summary (requests, payments, notifications).
 */
export function useActionSummaryQuery(userId?: string) {
    return useQuery({
        queryKey: ['action-summary', userId],
        queryFn: async () => {
            if (!supabase || !userId) throw new Error('Initialization error');

            // 1. Fetch Incoming Join Requests (Host)
            const { data: hostPools } = await supabase
                .from('pools')
                .select('id')
                .eq('owner_id', userId);

            const poolIds = hostPools?.map(p => p.id) || [];
            
            let pendingRequests: any[] = [];
            if (poolIds.length > 0) {
                const { data } = await supabase
                    .from('join_requests')
                    .select('*, requester:profiles(*), pool:pools(*)')
                    .in('pool_id', poolIds)
                    .eq('status', 'pending');
                pendingRequests = data || [];
            }

            // 2. Fetch Pending Payments (Member)
            const { data: ledgerRows } = await supabase
                .from('ledger')
                .select('*, memberships!inner(*, pool:pools(*))')
                .eq('memberships.user_id', userId)
                .eq('status', 'owed');

            const duePayments = (ledgerRows || []).map(row => ({
                id: row.id,
                membership_id: row.membership_id,
                pool_id: row.memberships.pool_id,
                pool_name: row.memberships.pool.plan_name,
                platform: row.memberships.pool.platform,
                amount_cents: row.amount, // Standardized in Phase 2
                due_at: row.due_date,
            }));

            // 3. Unread Notifications
            const { data: notifications } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .eq('read', false)
                .order('created_at', { ascending: false });

            // 4. Savings Logic
            const { data: memberships } = await supabase
                .from('memberships')
                .select('*, pool:pools(*)')
                .eq('user_id', userId)
                .eq('status', 'active');

            let monthlySpend = 0;
            let monthlyRetail = 0;

            memberships?.forEach(m => {
                monthlySpend += (m.price_per_slot || 0);
                monthlyRetail += (m.pool?.total_cost || m.price_per_slot * (m.pool?.total_slots || 1));
            });

            return {
                pendingRequests,
                duePayments,
                unreadNotifications: notifications || [],
                monthlySavingsCents: (monthlyRetail - monthlySpend),
            };
        },
        enabled: !!userId,
        staleTime: 1000 * 60, // 1 minute refresh
    });
}

/**
 * Hook for fetching referral statistics.
 */
export function useReferralStatsQuery(userId?: string) {
    return useQuery({
        queryKey: ['referral-stats', userId],
        queryFn: async () => {
            const { resolveDataMode } = await import('../data-mode');
            const mode = resolveDataMode({ allowDemoFallback: true });
            
            if (mode === 'demo') {
                return { count: 12, rewardsGranted: 3 };
            }

            if (!supabase || !userId) throw new Error('Initialization error');

            const { count: total, error: err1 } = await supabase
                .from('referrals')
                .select('*', { count: 'exact', head: true })
                .eq('referrer_id', userId);
            if (err1) throw err1;

            const { count: rewarded, error: err2 } = await supabase
                .from('referrals')
                .select('*', { count: 'exact', head: true })
                .eq('referrer_id', userId)
                .eq('reward_granted', true);
            if (err2) throw err2;

            return { count: total || 0, rewardsGranted: rewarded || 0 };
        },
        enabled: !!userId,
    });
}

/**
 * Hook for fetching pools owned by the current user.
 */
export function useMyPoolsQuery(userId?: string) {
    return useQuery({
        queryKey: poolKeys.mine(userId || ''),
        queryFn: async () => {
            if (!supabase || !userId) throw new Error('Initialization error');
            const { data, error } = await supabase
                .from('pools')
                .select('*, memberships(count)')
                .eq('owner_id', userId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data as any[];
        },
        enabled: !!userId,
    });
}

/**
 * Hook for fetching global admin analytics.
 */
export function useAdminAnalyticsQuery() {
    return useQuery({
        queryKey: ['admin-analytics'],
        queryFn: async () => {
            if (!supabase) throw new Error('Supabase not connected');

            // Fetch various analytics in parallel
            const [
                { data: earnings },
                { data: userStats }
            ] = await Promise.all([
                supabase.from('host_earnings_summary').select('*'),
                supabase.from('profiles').select('id, plan, created_at')
            ]);

            return {
                earnings: earnings || [],
                userStats: userStats || []
            };
        },
    });
}

/**
 * Hook for fetching current user's memberships.
 */
export function useMembershipsQuery(userId?: string) {
    return useQuery({
        queryKey: ['memberships', userId],
        queryFn: async () => {
            const { resolveDataMode } = await import('../data-mode');
            const mode = resolveDataMode({ allowDemoFallback: true });

            if (mode === 'demo') {
                const { MOCK_MEMBERSHIPS } = await import('../mock-data');
                return MOCK_MEMBERSHIPS;
            }

            if (!supabase || !userId) throw new Error('Initialization error');
            const { data, error } = await supabase
                .from('memberships')
                .select('*, pool:pools(*, owner:profiles(*))')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data as any[];
        },
        enabled: !!userId,
    });
}

/**
 * Hook for fetching join requests for pools owned by the user.
 */
export function useJoinRequestsQuery(userId?: string) {
    return useQuery({
        queryKey: ['join-requests', userId],
        queryFn: async () => {
            const { resolveDataMode } = await import('../data-mode');
            const mode = resolveDataMode({ allowDemoFallback: true });

            if (mode === 'demo') {
                return [];
            }

            if (!supabase || !userId) throw new Error('Initialization error');
            
            // Get pools owned by user first
            const { data: pools } = await supabase
                .from('pools')
                .select('id')
                .eq('owner_id', userId);
            
            if (!pools || pools.length === 0) return [];

            const poolIds = pools.map(p => p.id);

            const { data, error } = await supabase
                .from('join_requests')
                .select('*, pool:pools(*), profiles(*)')
                .in('pool_id', poolIds)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data as any[];
        },
        enabled: !!userId,
    });
}

/**
 * Hook for fetching the platform ledger (transactions).
 */
export function useLedgerQuery(options?: { allowDemoFallback?: boolean }) {
    return useQuery({
        queryKey: ['ledger', options?.allowDemoFallback],
        queryFn: async () => {
            const { resolveDataMode } = await import('../data-mode');
            const mode = resolveDataMode({ allowDemoFallback: options?.allowDemoFallback ?? true });

            if (mode === 'demo') {
                const { MOCK_LEDGER } = await import('../mock-data');
                return MOCK_LEDGER;
            }

            if (!supabase) throw new Error('Supabase not connected');
            
            const { data, error } = await supabase
                .from('ledger')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data as any[];
        }
    });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Mutation for joining a pool.
 */
export function useJoinPoolMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ poolId, userId, message }: { poolId: string, userId: string, message?: string }) => {
            const { joinPool } = await import('./mutations');
            const result = await joinPool(poolId, userId, message);
            if (!result.success) throw new Error(result.error || 'Failed to join pool');
            return result.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: poolKeys.detail(variables.poolId) });
        },
    });
}

/**
 * Mutation for approving a membership request.
 */
export function useApproveRequestMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (requestId: string) => {
            const { approveRequest } = await import('./mutations');
            const result = await approveRequest(requestId);
            if (!result.success) throw new Error(result.error || 'Failed to approve request');
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: poolKeys.lists() });
        },
    });
}

/**
 * Mutation for marking a ledger entry as paid.
 */
export function useMarkLedgerPaidMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (ledgerId: string) => {
            const { markLedgerPaid } = await import('./mutations');
            const result = await markLedgerPaid(ledgerId);
            if (!result.success) throw new Error(result.error || 'Failed to mark ledger as paid');
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ledger'] });
        },
    });
}

/**
 * Mutation for rejecting a membership request.
 */
export function useRejectRequestMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (requestId: string) => {
            const { rejectRequest } = await import('./mutations');
            const result = await rejectRequest(requestId);
            if (!result.success) throw new Error(result.error || 'Failed to reject request');
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: poolKeys.lists() });
        },
    });
}
