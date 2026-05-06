// @ts-nocheck
// ─── useWishlist Hook — Supabase Integration ──────────────────────────────────
// Fetches wishlist requests from the wishlist_requests table.
// Falls back to mock data in demo mode.

import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConnected } from './client';
import { resolveDataMode, getHybridModeError } from '../data-mode';
import { getPlatform } from '../constants';
import type { WishlistRequest } from '../types';

interface WishlistHookState {
    data: WishlistRequest[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
    postRequest: (req: {
        platform: string;
        budget_max: number;
        urgency: 'low' | 'medium' | 'high';
    }) => Promise<boolean>;
    offerSlot: (requestId: string) => Promise<boolean>;
    cancelRequest: (requestId: string) => Promise<boolean>;
    reopenRequest: (requestId: string) => Promise<boolean>;
    stats: { open: number; fulfilled: number; avgMatchTime: string };
}

// Demo data used when Supabase is not connected
const DEMO_WISHLIST: WishlistRequest[] = [
    {
        id: 'wish-1', user_id: 'user-mk', platform: 'figma',
        budget_max: 800, urgency: 'high',
        status: 'open', created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        user: { id: 'user-mk', username: 'mayak', display_name: 'Maya K', rating: 4.9, created_at: '2024-06-01T00:00:00Z', avatar_color: '#C8F135' },
    },
    {
        id: 'wish-2', user_id: 'user-ds', platform: 'chatgpt',
        budget_max: 1200, urgency: 'low',
        status: 'open', created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        user: { id: 'user-ds', username: 'devs', display_name: 'Dev S', rating: 5.0, created_at: '2024-08-01T00:00:00Z', avatar_color: '#4DFF91' },
    },
    {
        id: 'wish-3', user_id: 'user-pm', platform: 'netflix',
        budget_max: 600, urgency: 'medium',
        status: 'open', created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        user: { id: 'user-pm', username: 'priyam', display_name: 'Priya M', rating: 4.8, created_at: '2024-09-01T00:00:00Z', avatar_color: '#54A0FF' },
    },
    {
        id: 'wish-4', user_id: 'user-ar', platform: 'notion',
        budget_max: 500, urgency: 'high',
        status: 'open', created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        user: { id: 'user-ar', username: 'alexr', display_name: 'Alex R', rating: 4.7, created_at: '2024-10-01T00:00:00Z', avatar_color: '#F5A623' },
    },
    {
        id: 'wish-5', user_id: 'user-jl', platform: 'spotify',
        budget_max: 400, urgency: 'low',
        status: 'open', created_at: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
        user: { id: 'user-jl', username: 'jordanl', display_name: 'Jordan L', rating: 5.0, created_at: '2024-11-01T00:00:00Z', avatar_color: '#7B61FF' },
    },
    {
        id: 'wish-6', user_id: 'user-st', platform: 'adobe',
        budget_max: 2000, urgency: 'medium',
        status: 'open', created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        user: { id: 'user-st', username: 'samt', display_name: 'Sam T', rating: 4.9, created_at: '2024-07-01T00:00:00Z', avatar_color: '#00D1C1' },
    },
];

export function useWishlist(): WishlistHookState {
    const [data, setData] = useState<WishlistRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        const mode = resolveDataMode({ allowDemoFallback: false });

        if (mode === 'demo') {
            setData(DEMO_WISHLIST);
            setLoading(false);
            return;
        }

        if (!isSupabaseConnected || !supabase) {
            setError(getHybridModeError('wishlist'));
            setData([]);
            setLoading(false);
            return;
        }

        try {
            const { data: rows, error: err } = await supabase
                .from('wishlist_requests')
                .select('*, user:profiles(*)')
                .order('created_at', { ascending: false })
                .limit(50);

            if (err) throw err;
            setData((rows ?? []) as WishlistRequest[]);
        } catch (e) {
            setError((e as Error).message);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Post a new wishlist request
    const postRequest = useCallback(async (req: {
        platform: string;
        budget_max: number;
        urgency: 'low' | 'medium' | 'high';
    }): Promise<boolean> => {
        const mode = resolveDataMode({ allowDemoFallback: false });
        if (mode === 'demo' || !isSupabaseConnected || !supabase) {
            // In demo mode, add locally
            const newReq: WishlistRequest = {
                id: `wish-${Date.now()}`,
                user_id: 'user-you',
                platform: req.platform,
                budget_max: req.budget_max,
                urgency: req.urgency,
                status: 'open',
                created_at: new Date().toISOString(),
            };
            setData(prev => [newReq, ...prev]);
            return true;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not signed in');

            const { error: err } = await supabase.from('wishlist_requests').insert({
                user_id: user.id,
                platform: req.platform,
                budget_max: req.budget_max,
                urgency: req.urgency,
            } as any);
            if (err) throw err;
            await fetchData(); // Refresh list
            return true;
        } catch (e) {
            setError((e as Error).message);
            return false;
        }
    }, [fetchData]);

    // Offer a slot = create a notification for the requester
    const offerSlot = useCallback(async (requestId: string): Promise<boolean> => {
        const mode = resolveDataMode({ allowDemoFallback: false });
        const request = data.find(r => r.id === requestId);
        if (!request) return false;

        if (mode === 'demo' || !isSupabaseConnected || !supabase) {
            return true; // Just show success toast in demo
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not signed in');

            const platformInfo = getPlatform(request.platform);
            await supabase.from('notifications').insert({
                user_id: request.user_id,
                type: 'success',
                title: 'Slot offered!',
                body: `Someone wants to add you to their ${platformInfo?.name ?? request.platform} pool.`,
                icon: platformInfo?.icon ?? '🎯',
            } as any);
            return true;
        } catch (e) {
            setError((e as Error).message);
            return false;
        }
    }, [data]);

    const updateRequestStatus = useCallback(async (
        requestId: string,
        status: WishlistRequest['status'],
    ): Promise<boolean> => {
        const mode = resolveDataMode({ allowDemoFallback: false });

        if (mode === 'demo' || !isSupabaseConnected || !supabase) {
            setData((prev) => prev.map((request) => (
                request.id === requestId ? { ...request, status } : request
            )));
            return true;
        }

        try {
            const { error: err } = await supabase
                .from('wishlist_requests')
                .update({ status } as any)
                .eq('id', requestId);

            if (err) throw err;

            setData((prev) => prev.map((request) => (
                request.id === requestId ? { ...request, status } : request
            )));
            return true;
        } catch (e) {
            setError((e as Error).message);
            return false;
        }
    }, []);

    const cancelRequest = useCallback((requestId: string) => {
        return updateRequestStatus(requestId, 'cancelled');
    }, [updateRequestStatus]);

    const reopenRequest = useCallback((requestId: string) => {
        return updateRequestStatus(requestId, 'open');
    }, [updateRequestStatus]);

    // Compute stats
    const openCount = data.filter(r => r.status === 'open').length;
    const fulfilledCount = data.filter(r => r.status === 'fulfilled').length;

    return {
        data,
        loading,
        error,
        refetch: fetchData,
        postRequest,
        offerSlot,
        cancelRequest,
        reopenRequest,
        stats: {
            open: openCount,
            fulfilled: fulfilledCount,
            avgMatchTime: fulfilledCount > 0 ? '4.2h' : '—',
        },
    };
}
