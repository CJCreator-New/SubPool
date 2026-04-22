// ─── Subscription Details Page ─────────────────────────────────────────────────
// Real-time subscription management dashboard showing all user subscriptions
// with renewal alerts, usage metrics, category filters, and payment history.

import { useState, useMemo } from 'react';
import { useSubscriptionDetails } from '../../lib/supabase/useSubscriptionDetails';
import { useAuth } from '../../lib/supabase/auth';
import { SubscriptionCard } from '../components/subscription-card';
import { RenewalAlert } from '../components/renewal-alert';
import { UsageMetrics } from '../components/usage-metrics';
import { EmptyState } from '../components/empty-state';
import { PageLoadSkeleton } from '../components/skeletons';
import { Badge } from '../components/ui/badge';
import { cn } from '../components/ui/utils';
import type { PoolCategory } from '../../lib/types';
import { getUserFacingError } from '../../lib/error-feedback';

// Category filter types aligned with updated roadmap categories
type FilterCategory = 'all' | 'OTT' | 'AI_IDE' | 'ai';

const CATEGORY_MAP: Record<string, FilterCategory> = {
    'OTT': 'OTT',
    'TEAM_SAAS': 'AI_IDE',
    'AI_IDE': 'AI_IDE',
    'entertainment': 'OTT',
    'work': 'AI_IDE',
    'productivity': 'AI_IDE',
    'ai': 'ai',
};

const CATEGORIES: { id: FilterCategory; label: string; icon: string }[] = [
    { id: 'all', label: 'All', icon: '📊' },
    { id: 'OTT', label: 'OTT / Media', icon: '🎬' },
    { id: 'AI_IDE', label: 'AI & Dev Tools', icon: '💼' },
    { id: 'ai', label: 'AI Tools', icon: '🤖' },
];

export function SubscriptionDetails() {
    const { user } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');

    const {
        subscriptions,
        loading,
        error,
        activeCount,
        monthlySpend,
        totalSaved,
        nextRenewalDate,
        alerts,
    } = useSubscriptionDetails({
        userId: user?.id,
        allowDemoFallback: true,
    });

    // Filter by category
    const filteredSubscriptions = useMemo(() => {
        if (selectedCategory === 'all') return subscriptions;
        return subscriptions.filter((sub) => {
            const cat = CATEGORY_MAP[sub.membership.pool.category as string] ?? 'OTT';
            return cat === selectedCategory;
        });
    }, [subscriptions, selectedCategory]);

    // Category counts for badges
    const categoryCounts = useMemo(() => {
        const counts: Record<FilterCategory, number> = { all: subscriptions.length, OTT: 0, AI_IDE: 0, ai: 0 };
        subscriptions.forEach((sub) => {
            const cat = CATEGORY_MAP[sub.membership.pool.category as string] ?? 'OTT';
            counts[cat] = (counts[cat] || 0) + 1;
        });
        return counts;
    }, [subscriptions]);

    const subscriptionErrorMessage = error
        ? getUserFacingError(error, 'load subscription details').message
        : null;

    if (loading) return <PageLoadSkeleton />;

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            {/* ── Page Header ───────────────────────────────────────────────── */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight text-foreground">
                            My Subscriptions
                        </h1>
                        {activeCount > 0 && (
                            <Badge className="bg-primary/10 text-primary border border-primary/20 font-mono text-[10px] font-bold px-2.5 py-1 hover:bg-primary/10">
                                {activeCount} active
                            </Badge>
                        )}
                    </div>
                    <p className="font-mono text-sm text-muted-foreground">
                        Track your pool subscriptions, billing cycles, and savings.
                    </p>
                </div>

                {/* Live indicator */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/30 border border-border">
                    <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-mono text-[10px] text-muted-foreground tracking-wide">
                        LIVE SYNC
                    </span>
                </div>
            </header>

            {/* ── Renewal Alerts ────────────────────────────────────────────── */}
            <RenewalAlert alerts={alerts} />

            {/* ── Usage Metrics ─────────────────────────────────────────────── */}
            <UsageMetrics
                activeCount={activeCount}
                monthlySpend={monthlySpend}
                totalSaved={totalSaved}
                nextRenewalDate={nextRenewalDate}
            />

            {/* ── Category Filter ───────────────────────────────────────────── */}
            <div className="flex items-center gap-2 flex-wrap">
                {CATEGORIES.map((cat) => {
                    const isActive = cat.id === selectedCategory;
                    const count = categoryCounts[cat.id] || 0;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={cn(
                                'inline-flex items-center gap-2 px-4 py-2 rounded-full font-display text-sm font-semibold transition-all duration-150 cursor-pointer border',
                                isActive
                                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                    : 'bg-transparent text-muted-foreground border-border hover:text-foreground hover:border-primary/30',
                            )}
                        >
                            <span>{cat.icon}</span>
                            {cat.label}
                            {count > 0 && (
                                <span className={cn(
                                    'font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full',
                                    isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-secondary text-muted-foreground',
                                )}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ── Error State ───────────────────────────────────────────────── */}
            {subscriptionErrorMessage && (
                <div className="px-4 py-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
                    <p className="font-mono text-xs text-amber-500">{subscriptionErrorMessage}</p>
                </div>
            )}

            {/* ── Subscription Cards Grid ───────────────────────────────────── */}
            {filteredSubscriptions.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {filteredSubscriptions.map((sub) => (
                        <SubscriptionCard
                            key={sub.membership.id}
                            subscription={sub}
                        />
                    ))}
                </div>
            ) : subscriptions.length > 0 ? (
                // Category has no matches
                <EmptyState
                    icon="🔍"
                    title="No subscriptions in this category"
                    description="Try selecting a different category filter to see your subscriptions."
                />
            ) : (
                // No subscriptions at all
                <EmptyState
                    icon="📦"
                    title="No subscriptions yet"
                    description="Join a pool from the Browse page to start tracking your subscriptions here."
                />
            )}

            {/* ── Footer ────────────────────────────────────────────────────── */}
            {filteredSubscriptions.length > 0 && (
                <div className="pt-4 border-t border-border text-center">
                    <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                        {filteredSubscriptions.length} subscription{filteredSubscriptions.length !== 1 ? 's' : ''} shown · Data syncs automatically
                    </p>
                </div>
            )}
        </div>
    );
}
