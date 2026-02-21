// ─── Pool Detail Modal ─────────────────────────────────────────────────────────
// Built on top of shadcn Dialog + SubPool components.

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { cn } from './ui/utils';
import { SlotBar, StatusPill, PlatformIcon } from './subpool-components';
import { getPlatform, formatPrice, calcSavings } from '../../lib/constants';
import type { Pool } from '../../lib/types';
import { Insight } from './demo-mode';

// ─── Retail price lookup (approximate, used for savings callout) ──────────────

const RETAIL_PRICES: Record<string, number> = {
    netflix: 1599,
    spotify: 1099,
    youtube: 1399,
    disneyplus: 1399,
    hulu: 1799,
    appletv: 999,
    notion: 1000,
    figma: 1500,
    slack: 875,
    github: 400,
    adobe: 5999,
    linear: 1000,
    chatgpt: 2000,
    claude: 2000,
    cursor: 2000,
    midjourney: 1000,
    perplexity: 2000,
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface PoolDetailModalProps {
    pool: Pool | null;
    open: boolean;
    onClose: () => void;
    onRequestJoin?: (pool: Pool) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PoolDetailModal({
    pool,
    open,
    onClose,
    onRequestJoin,
}: PoolDetailModalProps) {
    const [requestState, setRequestState] = useState<'idle' | 'loading' | 'success'>('idle');

    // Reset state when pool changes
    useEffect(() => {
        setRequestState('idle');
    }, [pool?.id]);

    if (!pool) return null;

    const platform = getPlatform(pool.platform_id);
    const slotsRemaining = pool.slots_total - pool.slots_filled;
    const retailCents = RETAIL_PRICES[pool.platform_id] ?? pool.price_per_slot * 2;
    const savingsPct = calcSavings(retailCents, pool.price_per_slot);
    const savingsAmount = ((retailCents - pool.price_per_slot) / 100).toFixed(2);

    const handleJoin = async () => {
        if (requestState !== 'idle' || !onRequestJoin) return;
        setRequestState('loading');
        try {
            await onRequestJoin(pool);
            setRequestState('success');
        } catch {
            setRequestState('idle');
        }
    };

    // Detail rows
    const details: { key: string; value: string }[] = [
        { key: 'Price', value: `${formatPrice(pool.price_per_slot)}/mo per slot` },
        { key: 'Slots', value: `${pool.slots_filled}/${pool.slots_total} filled` },
        { key: 'Billing', value: 'Monthly via SubPool escrow' },
        { key: 'Category', value: pool.category.charAt(0).toUpperCase() + pool.category.slice(1) },
        { key: 'Rating', value: `${pool.owner.rating.toFixed(1)} ★ (${pool.owner.review_count} reviews)` },
    ];

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent
                className={cn(
                    'bg-card border-border sm:max-w-[500px] max-w-full sm:rounded-xl rounded-none p-8',
                    'sm:top-[50%] top-auto bottom-0 sm:bottom-auto sm:translate-y-[-50%] translate-y-0',
                    'max-h-[90vh] overflow-y-auto',
                    'shadow-[0_0_0_1px_rgba(200,241,53,0.1),0_48px_120px_rgba(0,0,0,0.8)]',
                )}
            >
                {/* Accessible title (visually part of header below) */}
                <DialogTitle className="sr-only">
                    {platform?.name ?? pool.platform_id} Pool Details
                </DialogTitle>

                {/* ─── Platform Header ──────────────────────────────────────── */}
                <div className="flex items-center gap-4 mb-6">
                    <PlatformIcon platformId={pool.platform_id} size="lg" />
                    <div className="min-w-0">
                        <p className="font-display font-bold text-xl text-foreground truncate">
                            {platform?.name ?? pool.platform_id}
                        </p>
                        <p className="font-mono text-[12px] text-muted-foreground truncate">
                            {pool.plan_name}
                        </p>
                        <div className="mt-1.5">
                            <StatusPill status={pool.status} />
                        </div>
                    </div>
                </div>

                {/* ─── Slot Bar ─────────────────────────────────────────────── */}
                <div className="mb-5">
                    <SlotBar filled={pool.slots_filled} total={pool.slots_total} size="md" />
                    {slotsRemaining <= 1 && slotsRemaining > 0 && (
                        <p className="text-[11px] font-mono mt-1" style={{ color: '#F5A623' }}>
                            🔥 Only {slotsRemaining} slot remaining — act fast!
                        </p>
                    )}
                    {slotsRemaining > 1 && (
                        <p className="text-[11px] font-mono text-muted-foreground mt-1">
                            {slotsRemaining} slots available
                        </p>
                    )}
                </div>

                {/* ─── Detail Rows ──────────────────────────────────────────── */}
                <div className="mb-5">
                    {details.map((row, i) => (
                        <div
                            key={row.key}
                            className={cn(
                                'flex items-center justify-between py-3',
                                i < details.length - 1 && 'border-b border-border',
                            )}
                        >
                            <span className="font-mono text-[12px] text-muted-foreground">
                                {row.key}
                            </span>
                            <span className="font-display font-semibold text-[13px] text-foreground relative">
                                {row.value}
                                {row.key === 'Rating' && (
                                    <Insight id="pool-rating" activeStep={4} className="top-0 left-full ml-4 -translate-y-1/2" />
                                )}
                            </span>
                        </div>
                    ))}
                </div>

                {/* ─── Savings Callout ──────────────────────────────────────── */}
                {savingsPct > 0 && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3.5 mb-6">
                        <p className="text-primary font-bold text-[13px] font-display">
                            💰 You save ${savingsAmount}/mo vs solo plan
                        </p>
                        <p className="font-mono text-[11px] text-muted-foreground mt-0.5">
                            That's {savingsPct}% less than the ${(retailCents / 100).toFixed(2)}/mo retail price
                        </p>
                    </div>
                )}

                {/* ─── CTA Row ──────────────────────────────────────────────── */}
                <div className="flex gap-3">
                    {pool.status === 'open' && slotsRemaining > 0 ? (
                        <Button
                            className="flex-1 h-12 font-display font-bold text-[14px]"
                            onClick={handleJoin}
                            disabled={requestState !== 'idle'}
                        >
                            {requestState === 'idle' && `Request to Join — ${formatPrice(pool.price_per_slot)}/mo`}
                            {requestState === 'loading' && (
                                <span className="flex items-center gap-2">
                                    <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                    Requesting…
                                </span>
                            )}
                            {requestState === 'success' && '✓ Request Sent'}
                        </Button>
                    ) : (
                        <Button className="flex-1 h-12 font-display font-bold text-[14px]" disabled>
                            {pool.status === 'full' ? 'Pool is Full' : 'Pool Closed'}
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        className="h-12 px-5 font-display text-[13px]"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
