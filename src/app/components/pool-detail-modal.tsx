// ─── Pool Detail Modal ─────────────────────────────────────────────────────────
// Built on top of shadcn Dialog + SubPool components.

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from './ui/dialog';
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
    const [waitlistState, setWaitlistState] = useState<'idle' | 'loading' | 'success'>('idle');

    const platform = getPlatform(pool?.platform ?? '');
    const { formatPrice, currency } = useCurrency();
    const slotsRemainingCount = (pool?.total_slots ?? 0) - (pool?.filled_slots ?? 0);

    const analysis = useMemo(() => {
        if (!pool) return null;
        return analyzePricing({
            platformId: pool.platform,
            planName: pool.plan_name,
            userSlotPrice: pool.price_per_slot / 100,
            totalSlots: pool.total_slots,
            currency: currency,
            countryCode: currency === 'INR' ? 'IN' : 'US',
        });
    }, [pool, currency]);

    const sharingNote = useMemo(() => {
        if (!pool) return null;
        return getPlatformSharingNote(pool.platform, pool.plan_name);
    }, [pool]);

    const magneticJoinBtn = useMagneticButton(0.15, pool?.status === 'open' && slotsRemainingCount > 0);

    const mockViews = useMemo(() => Math.floor(Math.random() * 8) + 2, [pool?.id]);

    const handleJoin = async () => {
        if (!user) {
            toast.error('Identity required for node access');
            return;
        }
        if (!pool) return;
        setRequestState('loading');
        try {
            if (onRequestJoin) {
                await onRequestJoin(pool);
                setRequestState('success');
                celebrate();
            }
        } catch (err) {
            setRequestState('idle');
        }
    };

    const handleJoinWaitlist = async () => {
        if (!user) {
            toast.error('Sign in to join the waitlist');
            return;
        }
        if (!pool) return;
        setWaitlistState('loading');
        try {
            const { data, error } = (await supabase?.rpc('join_waitlist', { p_pool_id: pool.id }) || { data: null, error: new Error('System Offline') }) as any;
            if (error) throw error;
            
            if (data.ok === false) {
                toast.error(data.error);
                setWaitlistState('idle');
            } else {
                toast.success(`System: You are #${data.position} in the queue`);
                setWaitlistState('success');
                track('waitlist_joined', { poolId: pool.id, position: data.position });
            }
        } catch (err: any) {
            toast.error(err.message || 'Transmission failure');
            setWaitlistState('idle');
        }
    };

    const handleCopyPoolLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/pool/${pool?.id}`);
        toast.success('Frequency Link Encrypted & Copied');
    };

    if (!pool || !analysis || !sharingNote) return null;

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-xl p-0 overflow-hidden bg-[#0E0E0E] border-[#1A1A1A] rounded-[32px] gap-0">
                <div className="relative">
                    {/* Header: Visual Background */}
                    <div 
                        className="h-40 relative flex items-end px-8 pb-6 transition-colors duration-700"
                        style={{ backgroundColor: platform?.bg ? `${platform.bg}15` : '#1A1A1A' }}
                    >
                        <div className="absolute inset-0 bg-grid-technical opacity-20" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E0E] to-transparent" />
                        
                        <div className="relative flex items-center gap-5">
                            <PlatformIcon platformId={pool.platform} size="lg" className="shadow-2xl" />
                            <div>
                                <DialogTitle className="font-display font-black text-3xl tracking-tighter uppercase italic leading-none">
                                    {platform?.name}
                                </DialogTitle>
                                <div className="flex items-center gap-2 mt-2">
                                    <StatusPill status={pool.status} />
                                    <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{pool.plan_name}</span>
                                    <span className="mx-1 opacity-20">•</span>
                                    <a 
                                        href={`/pool/${pool.id}`} 
                                        onClick={(e) => { e.preventDefault(); window.location.href = `/pool/${pool.id}`; }}
                                        className="font-mono text-[10px] text-primary hover:underline uppercase tracking-widest"
                                    >
                                        Full Spec ↗
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="px-8 py-8 space-y-8"
                    >
                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                                <p className="font-mono text-[9px] text-muted-foreground uppercase mb-1 flex items-center gap-1.5">
                                    <Users size={10} /> Nodes
                                </p>
                                <SlotBar filled={pool.filled_slots} total={pool.total_slots} size="sm" animate />
                            </div>
                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                                <p className="font-mono text-[9px] text-muted-foreground uppercase mb-1 flex items-center gap-1.5">
                                    <TrendingDown size={10} className="text-[#4DFF91]" /> Savings
                                </p>
                                <p className="font-display font-black text-lg text-[#4DFF91]">{analysis.savingsPct.toFixed(0)}%</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                                <p className="font-mono text-[9px] text-muted-foreground uppercase mb-1 flex items-center gap-1.5">
                                    <Shield size={10} className="text-primary" /> Cost
                                </p>
                                <p className="font-display font-black text-lg text-primary">{formatPrice(pool.price_per_slot / 100)}</p>
                            </div>
                        </div>

                        {/* Description & Sharing Notes */}
                        <div className="space-y-4">
                            <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 border-b border-white/5 pb-2">Deployment Protocol</h3>
                            <div className="space-y-4">
                                <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                                    {pool.description || `Shared ${platform?.name} access protocol. Verified node with 24/7 uptime monitoring.`}
                                </p>
                                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex gap-4">
                                    <Info className="size-5 text-primary shrink-0" />
                                    <p className="text-xs text-primary/80 leading-relaxed font-mono italic">
                                        {sharingNote.note}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                             <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 border-b border-white/5 pb-2 mb-4">Node Authority</h3>
                             <OwnerTrustRibbon 
                                rating={pool.owner?.rating || 0} 
                                totalHosted={pool.owner?.total_hosted || 0}
                                plan={pool.owner?.plan}
                                verified={pool.owner?.is_verified}
                             />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-4">
                            {pool.status === 'open' && slotsRemainingCount > 0 ? (
                                <div ref={magneticJoinBtn.ref} style={magneticJoinBtn.style} className="flex-1 flex">
                                    <Button
                                        className="flex-1 h-16 font-display font-black text-base uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/10 relative overflow-hidden group border-none"
                                        onClick={handleJoin}
                                        disabled={requestState !== 'idle'}
                                    >
                                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                            ) : pool.status === 'full' ? (
                                <Button 
                                    className="flex-1 h-16 font-display font-black text-base uppercase tracking-widest rounded-2xl relative overflow-hidden group border-none"
                                    variant="secondary"
                                    onClick={handleJoinWaitlist}
                                    disabled={waitlistState !== 'idle'}
                                >
                                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="relative z-10 flex items-center justify-center gap-3">
                                        {waitlistState === 'idle' && (
                                            <>
                                                <Info size={18} />
                                                Join Waitlist
                                            </>
                                        )}
                                        {waitlistState === 'loading' && <span className="animate-pulse">Queuing...</span>}
                                        {waitlistState === 'success' && '✓ In Queue'}
                                    </span>
                                </Button>
                            ) : (
                                <Button 
                                    className="flex-1 h-16 font-display font-black text-base uppercase tracking-widest rounded-2xl"
                                    variant="secondary"
                                    disabled
                                >
                                    Node Terminated
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

                        <div className="flex items-center justify-center gap-8 py-2 opacity-30 font-mono text-[9px] uppercase tracking-[0.2em]">
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
