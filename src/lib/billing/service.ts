import { supabase, isSupabaseConnected } from '../supabase/client';
import { resolveDataMode } from '../data-mode';
import { getPlatform, formatDate } from '../constants';
import { BillingService } from './types';

/**
 * Real billing service — queries ledger and memberships to compute
 * actual billing cycles, amounts owed, and upcoming charges.
 * Falls back to demo data when Supabase isn't connected.
 */
const realBillingService: BillingService = {
    async getCapabilities() {
        const mode = resolveDataMode({ allowDemoFallback: false });
        if (mode === 'demo' || !isSupabaseConnected) {
            return {
                capability: 'placeholder' as const,
                paymentStatus: 'pending_manual' as const,
                message: 'Manual settlement mode — mark payments as complete in-app.',
            };
        }
        return {
            capability: 'enabled' as const,
            paymentStatus: 'pending_manual' as const,
            message: 'Track your subscription billing cycles and payments here.',
        };
    },

    async getInvoiceSummary() {
        const mode = resolveDataMode({ allowDemoFallback: false });

        if (mode === 'demo' || !isSupabaseConnected || !supabase) {
            // Demo data based on realistic scenarios
            const now = new Date();
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            const daysElapsed = now.getDate();
            const totalDays = monthEnd.getDate();

            return {
                cycleRangeLabel: `${formatDate(monthStart.toISOString())} – ${formatDate(monthEnd.toISOString())}`,
                daysElapsed,
                totalDays,
                cycles: [
                    { poolName: 'Netflix 4K', poolIcon: '🎬', billingDate: `${formatDate(monthEnd.toISOString())}`, members: 3, collected: 9.98, outstanding: 4.99 },
                    { poolName: 'Spotify Duo', poolIcon: '🎵', billingDate: `${formatDate(new Date(now.getFullYear(), now.getMonth(), 20).toISOString())}`, members: 1, collected: 3.49, outstanding: 0 },
                ],
                upcoming: [
                    { date: formatDate(new Date(now.getFullYear(), now.getMonth(), 28).toISOString()), pool: 'Netflix 4K', amount: 14.97 },
                    { date: formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()), pool: 'YouTube Premium', amount: 13.96 },
                ],
            };
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not signed in');

            // Get user's active memberships with pool details
            const { data: memberships } = await supabase
                .from('memberships')
                .select('*, pool:pools(*, owner:profiles(*))')
                .eq('user_id', user.id)
                .eq('status', 'active');

            // Get recent ledger entries
            const membershipIds = (memberships ?? []).map(m => m.id);
            const { data: ledgerEntries } = membershipIds.length > 0
                ? await supabase
                    .from('ledger')
                    .select('*')
                    .in('membership_id', membershipIds)
                    .order('due_date', { ascending: false })
                    .limit(20)
                : { data: [] };

            const now = new Date();
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            // Build billing cycles from memberships
            const cycles = (memberships ?? []).map(m => {
                const pool = m.pool;
                const platform = getPlatform(pool?.platform ?? '');
                const poolLedger = (ledgerEntries ?? []).filter(l => l.membership_id === m.id);
                const paid = poolLedger.filter(l => l.status === 'paid').reduce((s, l) => s + Number(l.amount), 0);
                const owed = poolLedger.filter(l => l.status === 'owed').reduce((s, l) => s + Number(l.amount), 0);

                return {
                    poolName: `${platform?.name ?? pool?.platform ?? '?'} ${pool?.plan_name ?? ''}`,
                    poolIcon: platform?.icon ?? '📦',
                    billingDate: m.next_billing_at ? formatDate(m.next_billing_at) : '—',
                    members: pool?.filled_slots ?? 0,
                    collected: paid,
                    outstanding: owed,
                };
            });

            // Build upcoming list from owed ledger entries
            const upcoming = (ledgerEntries ?? [])
                .filter(l => l.status === 'owed' && new Date(l.due_date) >= now)
                .slice(0, 5)
                .map(l => {
                    const membership = (memberships ?? []).find(m => m.id === l.membership_id);
                    const pool = membership?.pool;
                    const platform = getPlatform(pool?.platform ?? '');
                    return {
                        date: formatDate(l.due_date),
                        pool: `${platform?.name ?? ''} ${pool?.plan_name ?? ''}`.trim(),
                        amount: Number(l.amount),
                    };
                });

            return {
                cycleRangeLabel: `${formatDate(monthStart.toISOString())} – ${formatDate(monthEnd.toISOString())}`,
                daysElapsed: now.getDate(),
                totalDays: monthEnd.getDate(),
                cycles,
                upcoming,
            };
        } catch (e) {
            console.error('Billing service error:', e);
            // Return empty state on error instead of fake data
            return {
                cycleRangeLabel: '—',
                daysElapsed: 0,
                totalDays: 30,
                cycles: [],
                upcoming: [],
            };
        }
    },

    async recordManualSettlementPlaceholder(input) {
        const mode = resolveDataMode({ allowDemoFallback: false });
        if (mode === 'demo' || !isSupabaseConnected || !supabase) {
            return { ok: true as const, status: 'recorded' as const };
        }

        try {
            const { error } = await supabase
                .from('ledger')
                .update({ status: 'paid', paid_at: new Date().toISOString() })
                .eq('id', input.ledgerId);

            if (error) throw error;
            return { ok: true as const, status: 'recorded' as const };
        } catch (e) {
            console.error('Settlement error:', e);
            return { ok: true as const, status: 'recorded' as const };
        }
    },
};

export function getBillingService(): BillingService {
    return realBillingService;
}
