// @ts-nocheck
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from './client';
import type { Pool, Category, Platform, PayoutRequest, Profile, Notification } from '../types';

/**
 * Categories & Platforms
 */
export function useCategoriesQuery() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data;
    }
  });
}

export function usePlatformsQuery(categoryId?: string) {
  return useQuery<Platform[]>({
    queryKey: ['platforms', categoryId],
    queryFn: async () => {
      let query = supabase.from('platforms').select('*, categories:category_id(*)');
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      const { data, error } = await query.order('name');
      if (error) throw error;
      return data;
    }
  });
}


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
                query = query.textSearch('search_vector', search);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as any as Pool[];
        },
        staleTime: 1000 * 60 * 2,
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

export function useAdminPayoutsQuery() {
    return useQuery({
        queryKey: [...adminKeys.all, 'payouts'],
        queryFn: async () => {
            if (!supabase) throw new Error('Supabase not connected');
            const { data, error } = await supabase
                .from('payout_requests')
                .select('*, user:profiles(username, email)')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data as any[];
        },
    });
}

export function useAdminAnalyticsQuery() {
    return useQuery({
        queryKey: [...adminKeys.all, 'analytics'],
        queryFn: async () => {
            if (!supabase) throw new Error('Supabase not connected');
            
            const { data: users } = await supabase.from('profiles').select('plan');
            const { data: pools } = await supabase.from('pools').select('id');
            const { data: ledger } = await supabase.from('ledger').select('amount, created_at').eq('status', 'paid');

            const earningsMap: Record<string, number> = {};
            ledger?.forEach(row => {
                const month = new Date(row.created_at).toLocaleString('en-US', { month: 'short' });
                earningsMap[month] = (earningsMap[month] || 0) + row.amount;
            });

            const earnings = Object.entries(earningsMap).map(([month, total_revenue]) => ({
                month,
                total_revenue
            }));

            return {
                userStats: users || [],
                poolsCount: pools?.length || 0,
                earnings: earnings.length > 0 ? earnings : [{ month: 'May', total_revenue: 0 }]
            };
        },
    });
}

// ─── User Queries ─────────────────────────────────────────────────────────────

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

export function useActionSummaryQuery(userId?: string) {
    return useQuery({
        queryKey: ['action-summary', userId],
        queryFn: async () => {
            if (!supabase || !userId) throw new Error('Initialization error');
            const { data: hostPools } = await supabase.from('pools').select('id').eq('owner_id', userId);
            const poolIds = hostPools?.map(p => p.id) || [];
            let pendingRequests = [];
            if (poolIds.length > 0) {
                const { data } = await supabase.from('join_requests').select('*, requester:profiles(*), pool:pools(*)').in('pool_id', poolIds).eq('status', 'pending');
                pendingRequests = data || [];
            }
            const { data: ledgerRows } = await supabase.from('ledger').select('*, memberships!inner(*, pool:pools(*))').eq('memberships.user_id', userId).eq('status', 'owed');
            const duePayments = (ledgerRows || []).map((row: any) => ({
                id: row.id,
                membership_id: row.membership_id,
                pool_id: row.memberships.pool_id,
                pool_name: row.memberships.pool.plan_name,
                platform: row.memberships.pool.platform,
                amount_cents: row.amount,
                due_at: row.due_date,
            }));
            const { data: notifications } = await supabase.from('notifications').select('*').eq('user_id', userId).eq('read', false).order('created_at', { ascending: false });
            const { data: memberships } = await supabase.from('memberships').select('*, pool:pools(*)').eq('user_id', userId).eq('status', 'active');
            let monthlySpend = 0;
            let monthlyRetail = 0;
            memberships?.forEach((m: any) => {
                monthlySpend += (m.price_per_slot || 0);
                monthlyRetail += (m.pool?.total_cost || m.price_per_slot * (m.pool?.total_slots || 1));
            });
            return { pendingRequests, duePayments, unreadNotifications: notifications || [], monthlySavingsCents: (monthlyRetail - monthlySpend) };
        },
        enabled: !!userId,
        staleTime: 1000 * 60,
    });
}

export function useReferralStatsQuery(userId?: string) {
    return useQuery({
        queryKey: ['referral-stats', userId],
        queryFn: async () => {
            const { resolveDataMode } = await import('../data-mode');
            const mode = resolveDataMode({ allowDemoFallback: true });
            if (mode === 'demo') return { count: 12, rewardsGranted: 3 };
            if (!supabase || !userId) throw new Error('Initialization error');
            const { count: total } = await supabase.from('referrals').select('*', { count: 'exact', head: true }).eq('referrer_id', userId);
            const { count: rewarded } = await supabase.from('referrals').select('*', { count: 'exact', head: true }).eq('referrer_id', userId).eq('reward_granted', true);
            return { count: total || 0, rewardsGranted: rewarded || 0 };
        },
        enabled: !!userId,
    });
}

export function useMyPoolsQuery(userId?: string) {
    return useQuery({
        queryKey: poolKeys.mine(userId || ''),
        queryFn: async () => {
            if (!supabase || !userId) throw new Error('Initialization error');
            const { data, error } = await supabase.from('pools').select('*, memberships(count)').eq('owner_id', userId).order('created_at', { ascending: false });
            if (error) throw error;
            return data as any[];
        },
        enabled: !!userId,
    });
}

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
            const { data, error } = await supabase.from('memberships').select('*, pool:pools(*, owner:profiles(*))').eq('user_id', userId).order('created_at', { ascending: false });
            if (error) throw error;
            return data as any[];
        },
        enabled: !!userId,
    });
}

export function useJoinRequestsQuery(userId?: string) {
    return useQuery({
        queryKey: ['join-requests', userId],
        queryFn: async () => {
            const { resolveDataMode } = await import('../data-mode');
            const mode = resolveDataMode({ allowDemoFallback: true });
            if (mode === 'demo') return [];
            if (!supabase || !userId) throw new Error('Initialization error');
            const { data: pools } = await supabase.from('pools').select('id').eq('owner_id', userId);
            if (!pools || pools.length === 0) return [];
            const poolIds = pools.map(p => p.id);
            const { data, error } = await supabase.from('join_requests').select('*, pool:pools(*), profiles(*)').in('pool_id', poolIds).order('created_at', { ascending: false });
            if (error) throw error;
            return data as any[];
        },
        enabled: !!userId,
    });
}

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
            const { data, error } = await supabase.from('ledger').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            return data as any[];
        }
    });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

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

export function useProcessRefundMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (ledgerId: string) => {
            const { processRefund } = await import('./mutations');
            const result = await processRefund(ledgerId);
            if (!result.success) throw new Error(result.error || 'Failed to process refund');
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ledger'] });
        },
    });
}

export function useRequestPayoutMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, amountCents, currency }: { userId: string, amountCents: number, currency: string }) => {
            const { requestPayout } = await import('./mutations');
            const result = await requestPayout(userId, amountCents, currency);
            if (!result.success) throw new Error(result.error || 'Failed to request payout');
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ledger'] });
        },
    });
}

export function useSimulateBillingMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (userId: string) => {
            const { simulateBillingCycle } = await import('./mutations');
            const result = await simulateBillingCycle(userId);
            if (!result.success) throw new Error(result.error || 'Failed to simulate billing');
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ledger'] });
        },
    });
}
/**
 * Analytics & Savings
 */
export function useUserSavingsQuery(userId?: string) {
  return useQuery({
    queryKey: ['user-savings', userId],
    enabled: !!userId,
    queryFn: async () => {
      // Get active memberships with pool and platform details
      const { data, error } = await supabase
        .from('memberships')
        .select(`
          price_per_slot,
          joined_at,
          pools (
            platform,
            plan_name,
            total_slots
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active');

      if (error) throw error;

      // Map platforms to get retail prices
      const platformsResponse = await supabase
        .from('platforms')
        .select('name, slug, retail_price_inr, retail_price_usd');
      
      const platformMap = Object.fromEntries(platformsResponse.data?.map(p => [p.slug, p]) || []);

      let totalMonthlyRetail = 0;
      let totalMonthlyPaid = 0;
      const details = data?.map(m => {
        const plat = platformMap[m.pools.platform];
        const retailUnits = plat?.retail_price_inr || plat?.retail_price_usd || 0;
        const retail = Math.round(retailUnits * 100); // Convert to cents
        const paid = m.price_per_slot || 0;
        
        totalMonthlyRetail += retail;
        totalMonthlyPaid += paid;

        return {
          platform: plat?.name || m.pools.platform,
          paid,
          retail,
          savings: retail - paid,
          savingsPct: retail > 0 ? ((retail - paid) / retail) * 100 : 0,
          joinedAt: m.joined_at
        };
      }) || [];

      return {
        monthlySavings: totalMonthlyRetail - totalMonthlyPaid,
        totalMonthlyRetail,
        totalMonthlyPaid,
        savingsPct: totalMonthlyRetail > 0 ? ((totalMonthlyRetail - totalMonthlyPaid) / totalMonthlyRetail) * 100 : 0,
        details
      };
    }
  });
}

export function useClaimRewardMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (userId: string) => {
            const { claimReferralReward } = await import('./mutations');
            const result = await claimReferralReward(userId);
            if (!result.success) throw new Error(result.error || 'Failed to claim reward');
            return result.data;
        },
        onSuccess: (_, userId) => {
            queryClient.invalidateQueries({ queryKey: ['profile', userId] });
            queryClient.invalidateQueries({ queryKey: ['referral-stats', userId] });
        },
    });
}

export function useApprovePayoutMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payoutId: string) => {
            const { approvePayout } = await import('./mutations');
            const result = await approvePayout(payoutId);
            if (!result.success) throw new Error(result.error || 'Failed to approve payout');
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'payouts'] });
        },
    });
}

export { useWatchedPlatforms } from './hooks';
/**
 * Credential Vault
 */
export function usePoolCredentialsQuery(poolId?: string) {
  return useQuery({
    queryKey: ['pool-credentials', poolId],
    enabled: !!poolId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('credentials')
        .select('encrypted_data, nonce')
        .eq('pool_id', poolId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });
}
/**
 * Session Scheduler
 */
export function usePoolSessionsQuery(poolId?: string) {
  return useQuery({
    queryKey: ['pool-sessions', poolId],
    enabled: !!poolId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pool_sessions')
        .select('*, user:profiles(username, display_name)')
        .eq('pool_id', poolId)
        .order('start_at', { ascending: true });
      
      if (error) throw error;
      return data as any as PoolSession[];
    }
  });
}

export function useBookSessionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (session: { pool_id: string, user_id: string, start_at: string, end_at: string }) => {
      const { data, error } = await supabase
        .from('pool_sessions')
        .insert(session)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pool-sessions', variables.pool_id] });
    }
  });
}
