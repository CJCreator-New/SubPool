// ─── UsageMetrics ─────────────────────────────────────────────────────────────
// Overview stats row for the subscriptions page.

import { StatCard } from './subpool-components';
import { formatDate } from '../../lib/constants';

interface UsageMetricsProps {
    activeCount: number;
    monthlySpend: number;   // cents
    totalSaved: number;     // cents
    nextRenewalDate: string | null;
    className?: string;
}

export function UsageMetrics({
    activeCount,
    monthlySpend,
    totalSaved,
    nextRenewalDate,
    className = '',
}: UsageMetricsProps) {
    return (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
            <StatCard
                label="ACTIVE SUBSCRIPTIONS"
                value={activeCount}
                sub={`${activeCount} pool${activeCount !== 1 ? 's' : ''} joined`}
                accentTop
            />
            <StatCard
                label="MONTHLY SPEND"
                value={`$${(monthlySpend / 100).toFixed(2)}`}
                sub="across all pools"
            />
            <StatCard
                label="TOTAL SAVED"
                value={`$${(totalSaved / 100).toFixed(0)}`}
                sub="vs. retail pricing"
                subVariant="success"
            />
            <StatCard
                label="NEXT RENEWAL"
                value={nextRenewalDate ? formatDate(nextRenewalDate) : '—'}
                sub={nextRenewalDate ? 'upcoming payment' : 'no upcoming'}
            />
        </div>
    );
}
