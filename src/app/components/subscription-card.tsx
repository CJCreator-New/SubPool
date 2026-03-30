// ─── SubscriptionCard ─────────────────────────────────────────────────────────
// Rich subscription card displaying platform, plan, billing info, renewal
// countdown, savings badge, and expandable payment history.

import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { PlatformIcon, SlotBar, StatusPill } from './subpool-components';
import { BillingTimeline } from './billing-timeline';
import { cn } from './ui/utils';
import type { SubscriptionDetail, RenewalStatus } from '../../lib/types';

interface SubscriptionCardProps {
    subscription: SubscriptionDetail;
    className?: string;
}

const RENEWAL_CONFIG: Record<RenewalStatus, { label: string; className: string }> = {
    active: { label: 'Active', className: 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5' },
    renewing_soon: { label: 'Renewing Soon', className: 'border-amber-500/20 text-amber-500 bg-amber-500/5' },
    overdue: { label: 'Overdue', className: 'border-red-500/20 text-red-500 bg-red-500/5' },
    expiring: { label: 'Expiring', className: 'border-red-500/20 text-red-500 bg-red-500/5' },
    cancelled: { label: 'Cancelled', className: 'border-slate-500/20 text-slate-400 bg-slate-500/5' },
};

function getRenewalLabel(sub: SubscriptionDetail): string {
    if (sub.renewalStatus === 'overdue' && sub.daysUntilRenewal !== null) {
        return `${Math.abs(sub.daysUntilRenewal)}d overdue`;
    }
    if (sub.daysUntilRenewal !== null && sub.daysUntilRenewal >= 0) {
        if (sub.daysUntilRenewal === 0) return 'Renews today';
        if (sub.daysUntilRenewal === 1) return 'Renews tomorrow';
        return `Renews in ${sub.daysUntilRenewal}d`;
    }
    if (sub.membership.status === 'pending') return 'Pending activation';
    return 'Active';
}

export function SubscriptionCard({ subscription: sub, className }: SubscriptionCardProps) {
    const [expanded, setExpanded] = useState(false);
    const pool = sub.membership.pool;
    const config = RENEWAL_CONFIG[sub.renewalStatus];

    const isUrgent = sub.renewalStatus === 'overdue' || sub.renewalStatus === 'expiring';
    const slotPriceDollars = (sub.membership.price_per_slot / 100).toFixed(2);

    return (
        <Card className={cn(
            'group border-[1.5px] transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 overflow-hidden',
            isUrgent ? 'border-red-500/30 hover:border-red-500/50' :
                sub.renewalStatus === 'renewing_soon' ? 'border-amber-500/20 hover:border-amber-500/40' :
                    'border-border hover:border-primary/20',
            className,
        )}>
            {/* Accent top bar */}
            <div
                className="h-[3px] w-full transition-opacity duration-300"
                style={{ backgroundColor: sub.platform.color, opacity: isUrgent ? 1 : 0.4 }}
            />

            <CardContent className="p-5 space-y-4">
                {/* ── Row 1: Platform + Status ──────────────────────────────────── */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <PlatformIcon platformId={sub.platform.id} size="md" glowColor={sub.platform.color} />
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-display font-bold text-base text-foreground">
                                    {sub.platform.name}
                                </h3>
                                <span className="font-mono text-[10px] text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">
                                    {pool.plan_name}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-mono text-[10px] text-muted-foreground">
                                    Hosted by {pool.owner?.display_name ?? pool.owner?.username ?? 'Unknown'}
                                </span>
                                <span className="text-border" role="img" aria-label="icon">·</span>
                                <span className="font-mono text-[10px] text-muted-foreground capitalize">
                                    {sub.billingCycle}
                                </span>
                            </div>
                        </div>
                    </div>

                    <Badge
                        variant="outline"
                        className={cn('font-mono text-[9px] uppercase tracking-wider px-2.5 py-1 border shrink-0', config.className)}
                    >
                        {config.label}
                    </Badge>
                </div>

                {/* ── Row 2: Pricing + Savings + Slot Bar ──────────────────────── */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-baseline gap-2">
                        <span className="font-display font-black text-2xl text-foreground tracking-tight">
                            ${slotPriceDollars}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">/mo</span>
                        {sub.planPricing && (
                            <span className="font-mono text-[10px] text-muted-foreground line-through ml-1">
                                ${sub.planPricing.official_price.toFixed(2)}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {sub.savingsVsRetail > 0 && (
                            <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-mono text-[10px] font-bold px-2.5 py-1 hover:bg-emerald-500/10">
                                ↓ {sub.savingsVsRetail}% saved
                            </Badge>
                        )}
                        <div className="w-20">
                            <SlotBar filled={pool.filled_slots} total={pool.total_slots} size="sm" />
                        </div>
                    </div>
                </div>

                {/* ── Row 3: Renewal countdown ─────────────────────────────────── */}
                <div className={cn(
                    'flex items-center justify-between px-4 py-3 rounded-lg border transition-colors',
                    isUrgent ? 'border-red-500/20 bg-red-500/5' :
                        sub.renewalStatus === 'renewing_soon' ? 'border-amber-500/20 bg-amber-500/5' :
                            'border-border bg-secondary/20',
                )}>
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            'size-2 rounded-full',
                            isUrgent ? 'bg-red-500 animate-pulse' :
                                sub.renewalStatus === 'renewing_soon' ? 'bg-amber-500 animate-pulse' :
                                    'bg-emerald-500',
                        )} />
                        <span className={cn(
                            'font-mono text-xs font-medium',
                            isUrgent ? 'text-red-400' :
                                sub.renewalStatus === 'renewing_soon' ? 'text-amber-400' :
                                    'text-foreground',
                        )}>
                            {getRenewalLabel(sub)}
                        </span>
                    </div>

                    {sub.totalPaid > 0 && (
                        <span className="font-mono text-[10px] text-muted-foreground">
                            ${(sub.totalPaid / 100).toFixed(2)} total paid
                        </span>
                    )}
                </div>

                {/* ── Row 4: Payment History Toggle ─────────────────────────────── */}
                {sub.paymentHistory.length > 0 && (
                    <>
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="w-full flex items-center justify-between py-2 px-1 group/toggle hover:opacity-80 transition-opacity cursor-pointer"
                        >
                            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                                Payment History ({sub.paymentHistory.length})
                            </span>
                            {expanded
                                ? <span className="text-muted-foreground text-sm" role="img" aria-label="icon">▲</span>
                                : <span className="text-muted-foreground text-sm" role="img" aria-label="icon">▼</span>
                            }
                        </button>

                        {expanded && (
                            <div className="animate-in slide-in-from-top-2 duration-200 border-t border-border pt-3">
                                <BillingTimeline payments={sub.paymentHistory} />
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
