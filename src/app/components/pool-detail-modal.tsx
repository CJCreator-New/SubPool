// ─── Pool Detail Modal ─────────────────────────────────────────────────────────
// Built on top of shadcn Dialog + SubPool components.

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
import { OwnerTrustRibbon } from './trust-score';
import { supabase } from '../../lib/supabase/client';
import { useAuth } from '../../lib/supabase/auth';
import { Badge } from './ui/badge';
import { Shield, Share2, Info, TrendingDown, Users, DollarSign } from 'lucide-react';

interface PoolDetailModalProps {
    pool: Pool | null;
    open: boolean;
    onClose: () => void;
    onRequestJoin?: (pool: Pool) => void;
}

export function PoolDetailModal({
    pool,
    open,
    onClose,
    onRequestJoin,
}: PoolDetailModalProps) {
    const { isDemo } = useDemo();
    const { user } = useAuth();
    const [requestState, setRequestState] = useState<'idle' | 'loading' | 'success'>('idle');
    const modalRef = React.useRef<HTMLDivElement>(null);
    const { currency, formatPrice } = useCurrency();

    useEffect(() => {
        if (open) setRequestState('idle');
    }, [open, pool?.id]);

    const mockViews = useMemo(() => {
        if (!pool) return 0;
        let hash = 0;
        for (let i = 0; i < pool.id.length; i++) hash += pool.id.charCodeAt(i);
        return (hash % 8) + 2;
    }, [pool?.id]);

    const platform = pool ? getPlatform(pool.platform) : null;
    const analysis = pool ? analyzePricing({
        platformId: pool.platform,
        planName: pool.plan_name,
        userSlotPrice: pool.price_per_slot / 100,
        totalSlots: pool.total_slots,
        currency: currency,
        countryCode: 'GLOBAL'
    }) : null;

    const sharingNote = pool ? getPlatformSharingNote(pool.platform, pool.plan_name) : null;

    const magneticJoinBtn = useMagneticButton(0.3, isDemo);

    const handleJoin = async () => {
        if (requestState !== 'idle' || !onRequestJoin || !pool) return;
        setRequestState('loading');
        try {
            await onRequestJoin(pool);
            track('join_request_submitted', { poolId: pool.id, savingsPct: analysis?.savingsPct });
            setRequestState('success');
            celebrate('light', isDemo);
        } catch {
            setRequestState('idle');
            toast.error('Failed to submit join request');
        }
    };

    const handleCopyPoolLink = async () => {
        try {
            await navigator.clipboard.writeText(`${window.location.origin}/pool/${pool?.id}`);
            toast.success('System: Link copied to clipboard');
            if (pool) track('pool_link_copied', { poolId: pool.id });
        } catch {
            toast.error('Copy relay failed. Attempt manual copy.');
        }
    };

    if (!pool || !analysis || !sharingNote) return null;

    const slotsRemaining = pool.total_slots - pool.filled_slots;

    const containerVariants = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent
                ref={modalRef}
                className={cn(
                    'bg-card/90 backdrop-blur-3xl border-border/40 modal-glass shadow-2xl',
                    'sm:max-w-[540px] max-w-full sm:rounded-3xl rounded-none p-0 overflow-hidden',
                    'sm:top-[50%] top-auto bottom-0 sm:translate-y-[-50%] translate-y-0 duration-500',
                    'max-h-[92vh] flex flex-col'
                )}
            >
                <DialogTitle className="sr-only">{platform?.name} Pool Options</DialogTitle>

                {/* Hero Header */}
                <div className="relative p-8 pb-6 bg-gradient-to-br from-primary/10 via-transparent to-transparent">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                        <Shield size={160} />
                    </div>
                    
                    <div className="flex items-start justify-between relative z-10">
                        <div className="flex items-center gap-5">
                            <motion.div 
                                initial={{ scale: 0.8, rotate: -10 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="shadow-2xl rounded-3xl overflow-hidden"
                            >
                                <PlatformIcon platformId={pool.platform} size="lg" />
                            </motion.div>
                            <div className="space-y-1">
                                <h2 className="font-display font-black text-2xl tracking-tight leading-none text-foreground">
                                    {platform?.name ?? pool.platform}
                                </h2>
                                <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                                    {pool.plan_name} Node
                                </p>
                            </div>
                        </div>
                        <StatusPill status={pool.status} />
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-8"
                    >
                        <SlotBar filled={pool.filled_slots} total={pool.total_slots} size="md" />
                        <div className="mt-2 flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                            <span>{pool.filled_slots} Active Members</span>
                            <span className={cn(slotsRemaining <= 1 ? "text-amber-400 font-bold animate-pulse" : "")}>
                                {slotsRemaining === 0 ? "Node Saturated" : `${slotsRemaining} Capacity Remaining`}
                            </span>
                        </div>
                    </motion.div>
                </div>

                <div className="px-8 pb-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="space-y-8"
                    >
                        {/* Analytics Panel */}
                        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                            <div className="glass bg-background/40 border-border/50 rounded-2xl p-5 group transition-colors hover:border-primary/30">
                                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-4">Slot Overhead</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="font-display font-black text-3xl text-foreground group-hover:text-primary transition-colors">{formatPrice(pool.price_per_slot / 100)}</span>
                                    <span className="text-[10px] font-mono text-muted-foreground">/mo</span>
                                </div>
                                <div className="mt-4">
                                    <Badge variant="outline" className="text-[9px] font-mono uppercase border-primary/20 bg-primary/5 text-primary">
                                        {analysis.label} Efficient
                                    </Badge>
                                </div>
                            </div>
                            <div className="glass bg-background/40 border-border/50 rounded-2xl p-5 group transition-colors hover:border-emerald-500/30">
                                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-4">Savings Yield</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="font-display font-black text-3xl text-emerald-400">-{analysis.savingsPct.toFixed(0)}%</span>
                                </div>
                                <div className="mt-4 flex items-center gap-1.5 font-mono text-[9px] text-muted-foreground uppercase">
                                    <TrendingDown size={10} className="text-emerald-400" />
                                    <span>vs Market Average</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Node Intelligence */}
                        <motion.div variants={itemVariants} className="space-y-4">
                             <div className="flex items-center gap-2 mb-1">
                                <Info size={14} className="text-primary" />
                                <h3 className="font-display font-black text-xs uppercase tracking-widest text-muted-foreground">Node Intelligence</h3>
                             </div>
                             <div className="bg-secondary/40 border border-border/40 rounded-2xl p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
                                    <Users size={80} />
                                </div>
                                <div className="space-y-4 relative z-10">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-muted-foreground font-medium">Standard Solo Cost</span>
                                        <span className="font-mono text-muted-foreground line-through opacity-50">{formatPrice(analysis.officialSoloPrice)}/mo</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-bold">
                                        <span className="text-foreground">SubPool Optimized</span>
                                        <span className="font-mono text-primary">{formatPrice(pool.price_per_slot / 100)}/mo</span>
                                    </div>
                                    <div className="h-px bg-border/40 w-full" />
                                    <p className="text-[11px] leading-relaxed text-muted-foreground font-medium">
                                        {pool.category === 'entertainment' ? `Official family sharing architecture. You split the ${formatPrice(analysis.officialSoloPrice * 4)} total bill across the node cluster.` :
                                            pool.category === 'ai' ? 'Multi-tenant seat delegation. You receive individual credentials managed via our host arbitration layer.' :
                                                'B2B Team seat allocation. Cost-optimized scaling for creative and technical workflows.'}
                                    </p>
                                </div>
                             </div>
                        </motion.div>

                        {/* Host Audit */}
                        <motion.div variants={itemVariants} className="space-y-4">
                             <div className="flex items-center gap-2 mb-1">
                                <Shield size={14} className="text-emerald-400" />
                                <h3 className="font-display font-black text-xs uppercase tracking-widest text-muted-foreground">Security Audit</h3>
                             </div>
                             <div className="bg-background/20 border border-border/40 rounded-2xl p-6 flex items-center justify-between group hover:bg-background/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <OwnerTrustRibbon
                                        rating={pool.owner?.rating ?? 0}
                                        totalHosted={pool.owner?.total_hosted ?? 0}
                                        plan={pool.owner?.plan}
                                    />
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-foreground">Host Verified</p>
                                        <p className="font-mono text-[9px] text-muted-foreground uppercase">Response Relay: &lt;2hrs</p>
                                    </div>
                                </div>
                                <Insight id="pool-rating" activeStep={4} />
                             </div>
                        </motion.div>
                    </motion.div>

                    {/* CTAs */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="pt-4 space-y-4"
                    >
                        <div className="flex gap-4">
                            {pool.status === 'open' && slotsRemaining > 0 ? (
                                <div ref={magneticJoinBtn.ref} style={magneticJoinBtn.style} className="flex-1 flex">
                                    <Button
                                        className="flex-1 h-16 font-display font-black text-base uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/10 relative overflow-hidden group"
                                        onClick={handleJoin}
                                        disabled={requestState !== 'idle'}
                                    >
                                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                                        <span className="relative z-10 flex items-center justify-center gap-3">
                                            {requestState === 'idle' && (
                                                <>
                                                    <DollarSign size={18} />
                                                    Initialize Request
                                                </>
                                            )}
                                            {requestState === 'loading' && <span className="animate-pulse">Syncing...</span>}
                                            {requestState === 'success' && '✓ Request Transmitted'}
                                        </span>
                                    </Button>
                                </div>
                            ) : (
                                <Button 
                                    className="flex-1 h-16 font-display font-black text-base uppercase tracking-widest rounded-2xl"
                                    variant="secondary"
                                    disabled
                                >
                                    {pool.status === 'full' ? 'Cluster Saturated' : 'Node Terminated'}
                                </Button>
                            )}

                            <Button
                                variant="outline"
                                className="h-16 px-6 rounded-2xl border-border/60 hover:bg-white/5 transition-colors group"
                                onClick={handleCopyPoolLink}
                                aria-label="Share pool"
                            >
                                <Share2 className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </Button>
                        </div>

                        <div className="flex items-center justify-center gap-8 py-2 opacity-50 font-mono text-[9px] uppercase tracking-[0.2em]">
                             <div className="flex items-center gap-2">
                                <div className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span>{mockViews} active viewers</span>
                             </div>
                             <span>Secure Escrow Active</span>
                        </div>
                    </motion.div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
