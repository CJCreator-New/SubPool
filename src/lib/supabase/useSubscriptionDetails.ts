// â”€â”€â”€ useSubscriptionDetails â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Real-time subscription details hook.
// Aggregates memberships + ledger + platform_pricing into enriched
// SubscriptionDetail objects with renewal tracking, payment history,
// and savings metrics.  Supabase realtime channels auto-refresh data.

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { SubscriptionDetail, PaymentRecord, RenewalStatus, Membership } from '../types';
import { supabase, isSupabaseConnected } from './client';
import { resolveDataMode, getHybridModeError } from '../data-mode';
import { getPlatform } from '../constants';
import { PLATFORM_PRICING_SEED } from '../pricing-seed';
import { MOCK_SUBSCRIPTION_DETAILS } from '../mock-data';

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface UseSubscriptionDetailsOptions {
    userId?: string;
    allowDemoFallback?: boolean;
}

interface UseSubscriptionDetailsResult {
    subscriptions: SubscriptionDetail[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
    // Computed aggregates
    activeCount: number;
    monthlySpend: number;          // in cents
    totalSaved: number;            // in cents
    nextRenewalDate: string | null;
    alerts: SubscriptionDetail[];  // subs needing attention
}

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function computeRenewalStatus(membership: Membership): { status: RenewalStatus; daysUntil: number | null } {
    if (membership.status === 'cancelled') return { status: 'cancelled', daysUntil: null };

    if (!membership.next_billing_at) {
        return membership.status === 'pending'
            ? { status: 'active', daysUntil: null }
            : { status: 'active', daysUntil: null };
    }

    const now = new Date();
    const renewal = new Date(membership.next_billing_at);
    const diffMs = renewal.getTime() - now.getTime();
    const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (daysUntil < 0) return { status: 'overdue', daysUntil };
    if (daysUntil <= 3) return { status: 'expiring', daysUntil };
    if (daysUntil <= 7) return { status: 'renewing_soon', daysUntil };
    return { status: 'active', daysUntil };
}

function findPlatformPricing(platformId: string, planName: string) {
    const match = PLATFORM_PRICING_SEED.find(
        (p) => p.platform_id === platformId && p.plan_name.toLowerCase() === planName.toLowerCase()
    );
    return match ? { official_price: match.official_price, currency: match.currency } : null;
}

function buildPaymentHistory(ledgerRows: Array<Record<string, unknown>>, poolId: string): PaymentRecord[] {
    return ledgerRows
        .filter((row) => (row as { pool_id?: string }).pool_id === poolId || row.membership_id)
        .map((row) => ({
            id: String(row.id ?? ''),
            amount_cents: Number(row.amount_cents ?? row.amount ?? 0),
            status: (String(row.status ?? 'owed')) as PaymentRecord['status'],
            due_at: String(row.due_at ?? row.due_date ?? ''),
            settled_at: row.settled_at ? String(row.settled_at) : row.paid_at ? String(row.paid_at) : null,
        }))
        .sort((a, b) => new Date(b.due_at).getTime() - new Date(a.due_at).getTime())
        .slice(0, 6);
}

function enrichMembership(
    membership: Membership,
    ledgerRows: Array<Record<string, unknown>> = [],
): SubscriptionDetail {
    const pool = membership.pool;
    const platformInfo = getPlatform(pool.platform);
    const pricing = findPlatformPricing(pool.platform, pool.plan_name);
    const { status: renewalStatus, daysUntil } = computeRenewalStatus(membership);

    const payments = buildPaymentHistory(ledgerRows, pool.id);
    const paidPayments = payments.filter((p) => p.status === 'paid');
    const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount_cents, 0);

    let savingsVsRetail = 0;
    if (pricing && pricing.official_price > 0) {
        const slotPriceDollars = membership.price_per_slot / 100;
        savingsVsRetail = Math.round(((pricing.official_price - slotPriceDollars) / pricing.official_price) * 100);
        if (savingsVsRetail < 0) savingsVsRetail = 0;
    }

    const lastPaid = paidPayments[0];

    return {
        membership,
        platform: platformInfo
            ? { id: platformInfo.id, name: platformInfo.name, icon: platformInfo.icon, color: platformInfo.color, bg: platformInfo.bg }
            : { id: pool.platform, name: pool.platform, icon: 'ðŸ“¦', color: '#888', bg: '#1A1A1A' },
        planPricing: pricing,
        renewalStatus,
        daysUntilRenewal: daysUntil,
        billingCycle: 'monthly',
        totalPaid,
        savingsVsRetail,
        paymentHistory: payments,
        lastPaymentAt: lastPaid?.settled_at ?? null,
        memberSince: membership.joined_at,
    };
}

// â”€â”€â”€ Main Hook â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function useSubscriptionDetails(
    options?: UseSubscriptionDetailsOptions,
): UseSubscriptionDetailsResult {
    const [subscriptions, setSubscriptions] = useState<SubscriptionDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const channelRef = useRef<ReturnType<NonNullable<typeof supabase>['channel']> | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        const mode = resolveDataMode({ allowDemoFallback: options?.allowDemoFallback ?? true });

        // â”€â”€ Demo mode â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        if (mode === 'demo') {
            setSubscriptions(MOCK_SUBSCRIPTION_DETAILS);
            setLoading(false);
            return;
        }

        // â”€â”€ No Supabase â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        if (!isSupabaseConnected || !supabase) {
            setError(getHybridModeError('subscriptions'));
            setSubscriptions([]);
            setLoading(false);
            return;
        }

        // â”€â”€ Live data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        try {
            const userId = options?.userId;

            // Fetch memberships with embedded pool + owner
            let membershipsQuery = supabase
                .from('memberships')
                .select('*, pool:pools(*, owner:profiles(*))')
                .in('status', ['active', 'pending']);

            if (userId) {
                membershipsQuery = membershipsQuery.eq('user_id', userId);
            }

            const { data: memberships, error: membErr } = await membershipsQuery;
            if (membErr) throw membErr;

            // Fetch ledger entries for all these memberships
            const membershipIds = (memberships ?? []).map((m: Record<string, unknown>) => String(m.id));

            let ledgerRows: Array<Record<string, unknown>> = [];
            if (membershipIds.length > 0) {
                const { data: ledger, error: ledErr } = await supabase
                    .from('ledger')
                    .select('*')
                    .in('membership_id', membershipIds)
                    .order('due_date', { ascending: false })
                    .limit(50);

                if (!ledErr && ledger) {
                    ledgerRows = ledger as Array<Record<string, unknown>>;
                }
            }

            // Enrich each membership
            const enriched = (memberships ?? []).map((m: unknown) =>
                enrichMembership(m as Membership, ledgerRows)
            );

            setSubscriptions(enriched);
        } catch (e) {
            setError((e as Error).message);
            // Fallback to mock in case of error
            setSubscriptions(MOCK_SUBSCRIPTION_DETAILS);
        } finally {
            setLoading(false);
        }
    }, [options?.userId, options?.allowDemoFallback]);

    // â”€â”€ Initial fetch â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // â”€â”€ Realtime subscription â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    useEffect(() => {
        if (!isSupabaseConnected || !supabase) return;

        const channel = supabase
            .channel('subscription-details-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'memberships' }, () => {
                fetchData();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'ledger' }, () => {
                fetchData();
            })
            .subscribe();

        channelRef.current = channel;

        return () => {
            channel.unsubscribe();
        };
    }, [fetchData]);

    // â”€â”€ Computed aggregates â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const activeCount = useMemo(
        () => subscriptions.filter((s) => s.membership.status === 'active').length,
        [subscriptions]
    );

    const monthlySpend = useMemo(
        () => subscriptions
            .filter((s) => s.membership.status === 'active')
            .reduce((sum, s) => sum + s.membership.price_per_slot, 0),
        [subscriptions]
    );

    const totalSaved = useMemo(() => {
        return subscriptions.reduce((sum, s) => {
            if (!s.planPricing || s.planPricing.official_price <= 0) return sum;
            const retailCents = s.planPricing.official_price * 100;
            const savedPerMonth = retailCents - s.membership.price_per_slot;
            if (savedPerMonth <= 0) return sum;

            // Calculate months since joined
            const monthsActive = Math.max(1, Math.floor(
                (Date.now() - new Date(s.memberSince).getTime()) / (1000 * 60 * 60 * 24 * 30)
            ));
            return sum + (savedPerMonth * monthsActive);
        }, 0);
    }, [subscriptions]);

    const nextRenewalDate = useMemo(() => {
        const upcoming = subscriptions
            .filter((s) => s.membership.next_billing_at && s.daysUntilRenewal !== null && s.daysUntilRenewal >= 0)
            .sort((a, b) => (a.daysUntilRenewal ?? Infinity) - (b.daysUntilRenewal ?? Infinity));
        return upcoming[0]?.membership.next_billing_at ?? null;
    }, [subscriptions]);

    const alerts = useMemo(
        () => subscriptions.filter(
            (s) => s.renewalStatus === 'renewing_soon' || s.renewalStatus === 'overdue' || s.renewalStatus === 'expiring'
        ),
        [subscriptions]
    );

    return {
        subscriptions,
        loading,
        error,
        refetch: fetchData,
        activeCount,
        monthlySpend,
        totalSaved,
        nextRenewalDate,
        alerts,
    };
}
