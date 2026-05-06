import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { cn } from '../components/ui/utils';
import { SlotBar, StatusPill, PlatformIcon } from '../components/subpool-components';
import { getPlatform } from '../../lib/constants';
import { analyzePricing, getPlatformSharingNote } from '../../lib/pricing-service';
import { useCurrency } from '../../lib/currency-context';
import type { Pool } from '../../lib/types';
import { useDemo } from '../components/demo-mode';
import { track } from '../../lib/analytics';
import { toast } from 'sonner';
import { celebrate } from '../../lib/confetti';
import { OwnerTrustRibbon } from '../components/trust-score';
import { supabase } from '../../lib/supabase/client';
import { useAuth } from '../../lib/supabase/auth';
import { Shield, Share2, Info, TrendingDown, Users, DollarSign, ArrowLeft, Zap } from 'lucide-react';
import { PremiumCard } from '../components/premium-ui';
import { SEO } from '../components/seo';
import { PaywallModal } from '../components/paywall-modal';
import { useMembershipsQuery } from '../../lib/supabase/queries';
import { checkPlanAccess, getUpgradeMessage } from '../../lib/gating';

export function PoolDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { formatPrice, currency } = useCurrency();
    
    const [pool, setPool] = useState<Pool | null>(null);
    const [loading, setLoading] = useState(true);
    const [requestState, setRequestState] = useState<'idle' | 'loading' | 'success'>('idle');
    const [waitlistState, setWaitlistState] = useState<'idle' | 'loading' | 'success'>('idle');
    const [showPaywall, setShowPaywall] = useState(false);

    const { data: memberships } = useMembershipsQuery(user?.id);
    const activeMembershipsCount = memberships?.length || 0;
    const { profile } = useAuth();

    useEffect(() => {
        if (!id) return;
        
        async function loadPool() {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('pools_with_owners')
                    .select('*')
                    .eq('id', id)
                    .single();
                
                if (error) throw error;
                setPool(data as Pool);
            } catch (err) {
                console.error('Failed to load pool:', err);
                toast.error('Failed to establish uplink with pool node.');
            } finally {
                setLoading(false);
            }
        }
        
        loadPool();
    }, [id]);

    const platform = useMemo(() => getPlatform(pool?.platform ?? ''), [pool]);
    
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

    const slotsRemainingCount = (pool?.total_slots ?? 0) - (pool?.filled_slots ?? 0);

    const handleJoin = async () => {
        if (!user) {
            toast.error('Identity required for node access');
            navigate(`/login?next=/pool/${id}`);
            return;
        }
        if (!pool) return;

        const access = checkPlanAccess(profile, 'MAX_JOINED_POOLS', activeMembershipsCount);
        if (!access.allowed) {
            setShowPaywall(true);
            return;
        }

        setRequestState('loading');
        try {
            // Simplified join logic for now
            const { error } = await supabase
                .from('pool_requests')
                .insert({
                    pool_id: pool.id,
                    user_id: user.id,
                    status: 'pending'
                });
            
            if (error) throw error;
            
            setRequestState('success');
            celebrate();
            toast.success('Uplink request transmitted to host.');
            track('pool_join_requested', { poolId: pool.id });
        } catch (err: any) {
            toast.error(err.message || 'Join request failed');
            setRequestState('idle');
        }
    };

    const handleCopyPoolLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Frequency Link Encrypted & Copied');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#090909]">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary animate-pulse">Syncing Network Node...</p>
                </div>
            </div>
        );
    }

    if (!pool || !analysis || !sharingNote) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#090909]">
                <div className="text-center space-y-6">
                    <h1 className="font-display font-black text-4xl uppercase italic text-destructive">Node Not Found</h1>
                    <Button variant="ghost" onClick={() => navigate('/browse')}>Return to Market Hub</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#090909] text-foreground">
            <SEO 
                title={`${platform?.name} ${pool.plan_name} Node`} 
                description={`Join this ${platform?.name} pool for only ${formatPrice(pool.price_per_slot / 100)}. Save ${analysis.savingsPct.toFixed(0)}% on your subscription. Secure slot sharing with verified members.`}
            />
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div 
                    className="absolute top-0 inset-x-0 h-[500px] opacity-20 blur-[120px]" 
                    style={{ backgroundColor: platform?.bg || '#1A1A1A' }}
                />
                <div className="absolute inset-0 bg-grid-technical opacity-10" />
            </div>

            <div className="container max-w-6xl mx-auto px-4 py-8 relative z-10">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-12 group"
                >
                    <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" /> Back to Market Hub
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: Details */}
                    <div className="lg:col-span-8 space-y-12">
                        <header className="flex flex-col md:flex-row items-start md:items-center gap-8">
                            <PlatformIcon platformId={pool.platform} size="lg" className="shadow-glow-primary scale-125 md:scale-150" />
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h1 className="font-display font-black text-6xl tracking-tighter uppercase italic leading-none">
                                        {platform?.name}
                                    </h1>
                                    <StatusPill status={pool.status} />
                                </div>
                                <div className="flex items-center gap-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                                    <span className="flex items-center gap-2"><Zap size={14} className="text-primary" /> {pool.plan_name}</span>
                                    <span>•</span>
                                    <span>Deployment ID: {pool.id.slice(0, 8)}</span>
                                </div>
                            </div>
                        </header>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <PremiumCard className="p-8 space-y-4 border-white/5">
                                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Users size={14} /> Capacity
                                </p>
                                <div className="space-y-3">
                                    <div className="text-3xl font-display font-black">{pool.filled_slots}/{pool.total_slots}</div>
                                    <SlotBar filled={pool.filled_slots} total={pool.total_slots} size="md" animate />
                                </div>
                            </PremiumCard>
                            
                            <PremiumCard className="p-8 space-y-4 border-white/5">
                                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                    <TrendingDown size={14} className="text-success" /> Efficiency
                                </p>
                                <div className="text-3xl font-display font-black text-success">-{analysis.savingsPct.toFixed(0)}%</div>
                                <p className="font-mono text-[9px] uppercase tracking-tighter text-muted-foreground">Compared to solo subscription</p>
                            </PremiumCard>

                            <PremiumCard className="p-8 space-y-4 border-white/5">
                                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Shield size={14} className="text-primary" /> Settlement
                                </p>
                                <div className="text-3xl font-display font-black text-primary">{formatPrice(pool.price_per_slot / 100)}</div>
                                <p className="font-mono text-[9px] uppercase tracking-tighter text-muted-foreground">Per operational cycle</p>
                            </PremiumCard>
                        </div>

                        {/* Protocol Specs */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                <h3 className="font-display font-black text-2xl uppercase italic tracking-tight">Protocol Specification</h3>
                                <div className="flex gap-2">
                                    <Share2 
                                        size={18} 
                                        className="text-muted-foreground hover:text-primary cursor-pointer transition-colors" 
                                        onClick={handleCopyPoolLink}
                                    />
                                </div>
                            </div>
                            
                            <div className="grid gap-8">
                                <div className="space-y-4">
                                    <p className="text-lg text-foreground/90 leading-relaxed font-medium">
                                        {pool.description || `Shared ${platform?.name} access protocol. Verified node with 24/7 uptime monitoring and automated settlement. This deployment operates under high-clarity rules to ensure continuous service.`}
                                    </p>
                                    
                                    <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 flex gap-6 items-start">
                                        <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                                            <Info size={20} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-display font-black text-xs uppercase tracking-widest text-primary">Host Transparency Note</p>
                                            <p className="text-sm text-primary/80 leading-relaxed font-mono italic">
                                                {sharingNote.note}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                                        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Settlement Logic</p>
                                        <p className="font-display font-bold text-sm">Automated Escrow via Stripe/Razorpay</p>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                                        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Uptime Guarantee</p>
                                        <p className="font-display font-bold text-sm">99.9% Operational Continuity</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Actions & Trust */}
                    <div className="lg:col-span-4 space-y-8">
                        <PremiumCard className="p-8 space-y-8 sticky top-8">
                            <div className="space-y-2">
                                <h3 className="font-display font-black text-2xl uppercase italic">Initialize Uplink</h3>
                                <p className="font-mono text-[10px] text-muted-foreground uppercase leading-relaxed tracking-wider">
                                    Secure your node in the {platform?.name} cluster.
                                </p>
                            </div>

                            <div className="space-y-6">
                                {pool.status === 'open' && slotsRemainingCount > 0 ? (
                                    <Button
                                        className="w-full h-20 font-display font-black text-lg uppercase tracking-[0.2em] shadow-glow-primary rounded-2xl group relative overflow-hidden"
                                        onClick={handleJoin}
                                        disabled={requestState !== 'idle'}
                                    >
                                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <span className="relative z-10 flex items-center justify-center gap-3">
                                            {requestState === 'idle' && (
                                                <>
                                                    <DollarSign size={20} />
                                                    Join Node
                                                </>
                                            )}
                                            {requestState === 'loading' && <span className="animate-pulse">Authorizing...</span>}
                                            {requestState === 'success' && '✓ Transmission Sent'}
                                        </span>
                                    </Button>
                                ) : (
                                    <Button 
                                        className="w-full h-20 font-display font-black text-lg uppercase tracking-[0.2em] rounded-2xl opacity-50 cursor-not-allowed"
                                        variant="secondary"
                                        disabled
                                    >
                                        Node Full
                                    </Button>
                                )}

                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <h4 className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground text-center">Node Authority</h4>
                                    <OwnerTrustRibbon 
                                        rating={pool.owner?.rating || 0} 
                                        totalHosted={pool.owner?.total_hosted || 0}
                                        plan={pool.owner?.plan}
                                        verified={pool.owner?.is_verified}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Shield size={14} className="text-success" />
                                    <span className="font-mono text-[9px] uppercase tracking-widest">Encrypted Data Stream</span>
                                </div>
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Users size={14} className="text-primary" />
                                    <span className="font-mono text-[9px] uppercase tracking-widest">Verified Participants</span>
                                </div>
                            </div>
                        </PremiumCard>

                        <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 text-center space-y-4">
                            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">Market Intelligence</p>
                            <p className="text-xs text-foreground/60 leading-relaxed italic">
                                "This node is priced {analysis.savingsPct.toFixed(0)}% lower than official retail. High demand predicted for this sector."
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <PaywallModal 
                isOpen={showPaywall} 
                onClose={() => setShowPaywall(false)}
                feature="MAX_JOINED_POOLS"
                title="Membership Limit Reached"
                description={getUpgradeMessage('MAX_JOINED_POOLS')}
            />
        </div>
    );
}
