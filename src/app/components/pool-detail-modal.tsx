// ─── Pool Detail Modal ─────────────────────────────────────────────────────────
// Built on top of shadcn Dialog + SubPool components.

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { cn } from './ui/utils';
import { SlotBar, StatusPill, PlatformIcon } from './subpool-components';
import { getPlatform } from '../../lib/constants';
import { analyzePricing, getPlatformSharingNote } from '../../lib/pricing-service';
import { useCurrency } from '../../lib/currency-context';
import type { Pool } from '../../lib/types';
import { Insight, useDemo } from './demo-mode';
import { track } from '../../lib/analytics';
import { toast } from 'sonner';
import { useMagneticButton } from '../../hooks/useMagneticButton';
import { celebrate } from '../../lib/confetti';

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
    const { isDemo } = useDemo();
    const [requestState, setRequestState] = useState<'idle' | 'loading' | 'success'>('idle');
    const modalRef = React.useRef<HTMLDivElement>(null);
    const { currency, formatPrice } = useCurrency();

    // Focus trapping and GPU accel
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        if (open) {
            timeoutId = setTimeout(() => {
                if (modalRef.current) {
                    const firstFocusable = modalRef.current.querySelector<HTMLElement>(
                        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                    );
                    firstFocusable?.focus();

                    // Remove will-change after intro animation completes
                    modalRef.current.style.willChange = 'auto';
                }
            }, 300); // Wait for modal enter animation
        }
        return () => clearTimeout(timeoutId);
    }, [open]);

    // Reset state when pool changes
    useEffect(() => {
        setRequestState('idle');
    }, [pool?.id]);

    // Seeded random for views based on pool id
    const mockViews = React.useMemo(() => {
        if (!pool) return 0;
        let hash = 0;
        for (let i = 0; i < pool.id.length; i++) hash += pool.id.charCodeAt(i);
        return (hash % 8) + 2;
    }, [pool?.id]);

    if (!pool) return null;

    const platform = getPlatform(pool.platform_id);
    const slotsRemaining = pool.slots_total - pool.slots_filled;
    const analysis = analyzePricing({
        platformId: pool.platform_id,
        planName: pool.plan_name,
        userSlotPrice: pool.price_per_slot / 100,
        totalSlots: pool.slots_total,
        currency: currency,
        countryCode: 'GLOBAL'
    });

    const sharingNote = getPlatformSharingNote(pool.platform_id, pool.plan_name);

    // Tracking pool_detail_viewed
    const openTimeRef = React.useRef<number>(0);
    useEffect(() => {
        if (open && pool) {
            openTimeRef.current = Date.now();
        } else if (!open && openTimeRef.current > 0 && pool) {
            const timeOnModal = Math.round((Date.now() - openTimeRef.current) / 1000);
            track('pool_detail_viewed', { poolId: pool.id, platformId: pool.platform_id, band: analysis.band, timeOnModal });
            openTimeRef.current = 0;
        }
    }, [open, pool?.id, analysis?.band]);

    const handleJoin = async () => {
        if (requestState !== 'idle' || !onRequestJoin) return;
        setRequestState('loading');
        try {
            await onRequestJoin(pool);
            track('join_request_submitted', { poolId: pool.id, band: analysis.band, savingsPct: analysis.savingsPct });
            setRequestState('success');
            celebrate('light', isDemo);
        } catch {
            setRequestState('idle');
        }
    };

    const magneticJoinBtn = useMagneticButton(0.3, isDemo);

    // Detail rows
    const details: { key: string; value: React.ReactNode }[] = [
        { key: 'Price', value: `${formatPrice(pool.price_per_slot / 100)}/mo per slot` },
        { key: 'Slots', value: `${pool.slots_filled}/${pool.slots_total} filled` },
        { key: 'Billing', value: 'Monthly via SubPool escrow' },
        { key: 'Category', value: pool.category.charAt(0).toUpperCase() + pool.category.slice(1) },
        {
            key: 'Sharing policy', value: (
                <span style={{ color: sharingNote.color }}>
                    {sharingNote.policy === 'allowed' ? '✅ Officially supported' :
                        sharingNote.policy === 'grey_area' ? '⚠️ Team cost-split' :
                            'ℹ️ Individual seats recommended'}
                </span>
            )
        },
    ];

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent
                ref={modalRef}
                aria-modal="true"
                aria-labelledby="pool-modal-title"
                style={{ willChange: open ? 'transform' : 'auto' }}
                className={cn(
                    'bg-card/80 backdrop-blur-xl border border-primary/15 modal-glass shadow-[0_0_0_1px_rgba(200,241,53,0.1),0_48px_120px_rgba(0,0,0,0.8)]',
                    'sm:max-w-[500px] max-w-full sm:rounded-xl rounded-none p-8',
                    'sm:top-[50%] top-auto bottom-0 sm:bottom-auto sm:translate-y-[-50%] translate-y-0',
                    'max-h-[90vh] overflow-y-auto',
                )}
            >
                {/* Accessible title (visually part of header below) */}
                <DialogTitle className="sr-only" id="pool-modal-title">
                    {platform?.name} Pool Options
                </DialogTitle>

                {/* ─── Platform Header ──────────────────────────────────────── */}
                <div className="flex items-center gap-4 mb-6">
                    <PlatformIcon platformId={pool.platform_id} size="lg" glowColor={platform?.bg} />
                    <div className="min-w-0">
                        <p className="font-display font-bold text-xl text-foreground truncate">
                            {platform?.name ?? pool.platform_id}
                        </p>
                        <p className="font-mono text-[12px] text-muted-foreground truncate">
                            {pool.plan_name}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2">
                            <StatusPill status={pool.status} />
                            <span
                                className="font-mono text-[10px] rounded-full border px-2 py-0.5 inline-flex"
                                style={{ borderColor: sharingNote.color, color: sharingNote.color }}
                            >
                                {sharingNote.policy === 'allowed' ? '✅ Official family plan' :
                                    sharingNote.policy === 'grey_area' ? '⚠️ Team use only' :
                                        'ℹ️ Per-seat plan'}
                            </span>
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

                {/* ─── Price Analysis Panel (Two Column) ─────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {/* LEFT Column */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <span className="font-display font-medium text-[42px] tracking-tight text-foreground leading-none">{formatPrice(pool.price_per_slot / 100)}</span>
                            <span className="font-mono text-xs text-muted-foreground uppercase">per month</span>
                            <div className="ml-auto mt-2">
                                <span
                                    className="border rounded-full px-2 py-0.5 font-mono text-[10px] uppercase"
                                    style={{ color: analysis.color, borderColor: analysis.color }}
                                >
                                    {analysis.label}
                                </span>
                            </div>
                        </div>

                        {analysis.savingsPct > 0 && (
                            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3.5 mt-auto">
                                <p className="text-primary font-bold text-[13px] font-display">
                                    💰 You save {analysis.savingsPct.toFixed(0)}% vs solo
                                </p>
                                <p className="font-mono text-[11px] text-muted-foreground mt-1">
                                    That's {formatPrice(analysis.officialSoloPrice - pool.price_per_slot / 100)}/mo or {formatPrice((analysis.officialSoloPrice - pool.price_per_slot / 100) * 12)}/year
                                </p>
                            </div>
                        )}
                    </div>

                    {/* RIGHT Column */}
                    <div className="bg-secondary/30 border border-border rounded-lg p-3.5 flex flex-col justify-center">
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="font-mono text-[11px] text-muted-foreground">Solo plan:</span>
                            <span className="font-mono text-[11px] text-muted-foreground line-through">
                                {formatPrice(analysis.officialSoloPrice)}/mo
                            </span>
                        </div>
                        <div className="flex justify-between items-center mb-2.5">
                            <span className="font-mono text-[11px] font-semibold">Your cost:</span>
                            <span className="font-mono text-[12px] font-bold text-primary">
                                {formatPrice(pool.price_per_slot / 100)}/mo
                            </span>
                        </div>

                        <div className="h-px w-full bg-border mb-2.5" />

                        <div className="flex justify-between items-center mb-1">
                            <span className="font-mono text-[11px] text-muted-foreground">Market range:</span>
                            <span className="font-mono text-[11px] text-muted-foreground">
                                {formatPrice(analysis.fairRangeMin)}–{formatPrice(analysis.fairRangeMax)}
                            </span>
                        </div>

                        {/* Position bar */}
                        <div className="relative h-1.5 w-full bg-muted rounded-full mt-1.5">
                            <div
                                className="absolute top-1/2 -translate-y-1/2 size-2.5 rounded-full border border-black shadow"
                                style={{
                                    backgroundColor: analysis.color,
                                    left: `${Math.min(Math.max(0, ((pool.price_per_slot - analysis.fairRangeMin) / Math.max(1, analysis.fairRangeMax - analysis.fairRangeMin)) * 100), 100)}%`
                                }}
                            />
                        </div>
                    </div>
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
                            </span>
                        </div>
                    ))}
                </div>

                {/* ─── Social Proof ───────────────────────────────────────────── */}
                <div className="mb-5">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                        About this pool
                    </p>
                    <div className="bg-card border border-border rounded-lg p-3" style={{ animation: 'calloutReveal 300ms 200ms ease-out both' }}>
                        <div className="flex items-center gap-2 relative">
                            <span className="font-mono text-[11px] text-muted-foreground">
                                ⭐ {pool.owner.rating.toFixed(1)} owner · {pool.owner.review_count} pools hosted · Usually responds in &lt;2h
                            </span>
                            <Insight id="pool-rating" activeStep={4} className="top-1/2 -right-4 ml-4 -translate-y-1/2" />
                        </div>
                        <div className="mt-1.5 pt-1.5 border-t border-border">
                            <span className="font-mono text-[11px] text-muted-foreground">
                                Similar pools: {formatPrice(analysis.fairRangeMin)}–{formatPrice(analysis.fairRangeMax)}/slot avg
                            </span>
                        </div>
                    </div>
                </div>

                {/* ─── Education Blurb ──────────────────────────────────────── */}
                <details className="mb-6 group">
                    <summary className="font-mono text-[11px] text-muted-foreground cursor-pointer list-none flex justify-between items-center bg-secondary rounded-[6px] px-3 py-2">
                        <span>ℹ️ About sharing this type</span>
                        <span className="group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <div className="bg-secondary/50 rounded-b-[6px] px-3 pb-3 -mt-1 pt-2 font-mono text-[11px] text-muted-foreground text-left">
                        {pool.category === 'OTT' ? `Netflix 4K supports up to 4 screens per plan. With 3 members sharing, each slot costs ${formatPrice(pool.price_per_slot / 100)} instead of ${formatPrice(analysis.officialSoloPrice)}.` :
                            pool.category === 'AI_IDE' ? 'ChatGPT Plus is a per-user license. This pool is for developers splitting team costs — each member uses their own account credentials.' :
                                'Figma Professional requires individual seats. SubPool helps teams coordinate who pays for which seat.'}
                    </div>
                </details>

                {/* ─── CTA Row ──────────────────────────────────────────────── */}
                <div className="flex gap-3">
                    {pool.status === 'open' && slotsRemaining > 0 ? (
                        <div ref={magneticJoinBtn.ref} style={magneticJoinBtn.style} className="flex flex-1">
                            <Button
                                className="w-full h-12 font-display font-bold text-[14px]"
                                onClick={handleJoin}
                                disabled={requestState !== 'idle'}
                            >
                                {requestState === 'idle' && `Request to Join — ${formatPrice(pool.price_per_slot / 100)}/mo`}
                                {requestState === 'loading' && (
                                    <span className="flex items-center gap-2">
                                        <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                        Requesting…
                                    </span>
                                )}
                                {requestState === 'success' && '✓ Request Sent'}
                            </Button>
                        </div>
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

                <div className="mt-5 flex flex-col items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="font-mono text-[11px] text-muted-foreground hover:text-foreground"
                        onClick={async () => {
                            await navigator.clipboard.writeText(`${window.location.origin}/pool/${pool.id}`);
                            toast.success("Pool link copied! 🔗");
                            track('pool_link_copied', { poolId: pool.id });
                        }}
                    >
                        🔗 Share this pool
                    </Button>
                    <span className="font-mono text-[10px] text-muted-foreground">
                        👁 {mockViews} people viewed this pool today
                    </span>
                </div>
            </DialogContent>
        </Dialog>
    );
}
