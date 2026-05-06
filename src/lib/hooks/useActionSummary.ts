// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { useAuth } from '../supabase/auth';
import type { JoinRequest, LedgerEntry, Notification, Pool } from '../types';

export interface ActionSummary {
    pendingRequests: JoinRequest[];
    duePayments: LedgerEntry[];
    unreadNotifications: Notification[];
    activePools: Pool[];
    totalSavingsCents: number;
    monthlySavingsCents: number;
    loading: boolean;
}

export function useActionSummary() {
    const { user } = useAuth();
    const [summary, setSummary] = useState<ActionSummary>({
        pendingRequests: [],
        duePayments: [],
        unreadNotifications: [],
        activePools: [],
        totalSavingsCents: 0,
        monthlySavingsCents: 0,
        loading: true
    });

    useEffect(() => {
        if (!user?.id) return;

        async function fetchSummary() {
            if (!supabase) return;

            // 1. Fetch Incoming Join Requests (Host)
            const { data: hostPools } = await supabase
                .from('pools')
                .select('id')
                .eq('owner_id', user!.id);

            const poolIds = hostPools?.map(p => p.id) || [];
            
            let requests: JoinRequest[] = [];
            if (poolIds.length > 0) {
                const { data } = await supabase
                    .from('join_requests')
                    .select('*, requester:profiles(*), pool:pools(*)')
                    .in('pool_id', poolIds)
                    .eq('status', 'pending');
                requests = data || [];
            }

            // 2. Fetch Pending Payments (Member)
            // Note: We need to join with memberships to filter by user_id
            const { data: ledgerRows } = await supabase
                .from('ledger')
                .select('*, memberships!inner(*, pool:pools(*))')
                .eq('memberships.user_id', user!.id)
                .eq('status', 'owed');

            // Map to LedgerEntry (Simplified enrichment for common UI)
            const duePayments: LedgerEntry[] = (ledgerRows || []).map(row => ({
                id: row.id,
                membership_id: row.membership_id,
                pool_id: row.memberships.pool_id,
                pool_name: row.memberships.pool.plan_name,
                platform: row.memberships.pool.platform,
                platform_emoji: '📦', // Fallback or map from constants
                counterparty_id: row.memberships.pool.owner_id,
                counterparty_name: 'Pool Owner', 
                counterparty_initials: 'PO',
                counterparty_color: '#C8F135',
                type: 'payment',
                status: 'owed',
                amount_cents: Math.round(row.amount * 100),
                due_at: row.due_date,
                settled_at: row.paid_at,
                note: null
            }));

            // 3. Unread Notifications
            const { data: notifications } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user!.id)
                .eq('read', false)
                .order('created_at', { ascending: false });

            // 4. Savings Logic
            const { data: memberships } = await supabase
                .from('memberships')
                .select('*, pool:pools(*)')
                .eq('user_id', user!.id)
                .eq('status', 'active');

            let monthlySpend = 0;
            let monthlyRetail = 0;

            memberships?.forEach(m => {
                monthlySpend += (m.price_per_slot || 0);
                // Rough estimate based on pool data if available
                monthlyRetail += (m.pool?.total_cost || m.price_per_slot * (m.pool?.total_slots || 1));
            });

            setSummary({
                pendingRequests: requests,
                duePayments,
                unreadNotifications: notifications || [],
                activePools: memberships?.map(m => m.pool) || [],
                totalSavingsCents: 0, // Would need historical ledger for this
                monthlySavingsCents: Math.round((monthlyRetail - monthlySpend) * 100),
                loading: false
            });
        }

        fetchSummary();

        // Real-time subscription could be added here for even better workflow
    }, [user?.id]);

    return summary;
}
