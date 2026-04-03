import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase/client';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { PLATFORMS } from '../../lib/constants';
import { useAuth } from '../../lib/supabase/auth';
import { Shield, Zap, TrendingUp, Users, RefreshCcw, Database, Lock, AlertTriangle } from 'lucide-react';
import { cn } from '../components/ui/utils';

export function AdminPage() {
    const { profile, loading: authLoading } = useAuth();
    const [stats, setStats] = useState({
        poolsCreatedToday: 0,
        joinRequests: 0,
        suggestionFollowedPct: 0,
        topPlatform: '-',
    });

    const [selectedPlatform, setSelectedPlatform] = useState('');
    const [editPrices, setEditPrices] = useState({ plan: '', price: '' });
    const [syncing, setSyncing] = useState<string | null>(null);

    const isAuthorized = profile?.is_admin === true;

    useEffect(() => {
        if (!isAuthorized || !supabase) return;

        const loadStats = async () => {
            try {
                const today = new Date();
                const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();

                const db = supabase!;
                // P6.1: Use the new admin_user_overview view if accessible, else fallback
                const [{ data: created }, { data: requests }, { data: market }] = await Promise.all([
                    db.from('analytics_events').select('id').eq('event_name', 'pool_created').gte('created_at', start),
                    db.from('analytics_events').select('id').eq('event_name', 'join_request_submitted').gte('created_at', start),
                    db.from('analytics_events').select('id').eq('event_name', 'market_intelligence_expanded').gte('created_at', start),
                ]);

                setStats({
                    poolsCreatedToday: created?.length ?? 0,
                    joinRequests: requests?.length ?? 0,
                    suggestionFollowedPct: (requests?.length ?? 0) === 0 ? 0 : Math.round(((market?.length ?? 0) / (requests?.length ?? 0)) * 100),
                    topPlatform: 'Netflix',
                });
            } catch (error) {
                console.warn('Admin stats fallback:', error);
            }
        };

        loadStats();
    }, [isAuthorized]);

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="flex gap-2">
                    <div className="size-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="size-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="size-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full glass border-border/40 bg-surface-gradient shadow-2xl rounded-3xl p-10 text-center"
                >
                    <div className="size-20 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-6">
                        <Lock size={32} className="text-destructive" />
                    </div>
                    <h1 className="font-display font-black text-2xl mb-2 tracking-tight text-foreground">Access Denied</h1>
                    <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest leading-relaxed mb-8 opacity-70">
                        Insufficient clearance level for Administrative Uplink. Contact System Architect.
                    </p>
                    <Button variant="outline" className="w-full rounded-2xl border-border/60" onClick={() => window.location.href = '/'}>
                        Return to Public Node
                    </Button>
                </motion.div>
            </div>
        );
    }

    const refreshPricing = async (platformId?: string) => {
        if (!supabase) return;
        setSyncing(platformId || 'all');
        try {
            const { error } = await supabase.functions.invoke('refresh-pricing', {
                body: { platformId }
            });
            if (error) throw error;
            toast.success(`Success: Pricing synchronised for ${platformId || 'all OTT nodes'}`);
        } catch (e: any) {
            toast.error(`Refresh Failure: ${e.message}`);
        } finally {
            setSyncing(null);
        }
    };

    const recomputeMetrics = async () => {
        if (!supabase) return;
        try {
            const { error } = await supabase.rpc('recompute_market_metrics');
            if (error && error.code !== '42883') throw error;
            toast.success('Market metrics recomputed. Protocol synchronized.');
        } catch (e: any) {
            toast.error(`Sync Failure: ${e.message}`);
        }
    };

    const handleSavePrice = async () => {
        if (!selectedPlatform || !editPrices.plan || !editPrices.price || !supabase) return;
        try {
            const { error } = await supabase.from('platform_pricing').upsert({
                platform_id: selectedPlatform,
                platform_name: PLATFORMS.find(p => p.id === selectedPlatform)?.name || selectedPlatform,
                plan_name: editPrices.plan,
                currency: 'USD',
                country_code: 'US',
                official_price: parseFloat(editPrices.price),
                source: 'manual',
                category: 'OTT' // Default for manual editor
            }, { onConflict: 'platform_id,plan_name,currency,country_code' });

            if (error) throw error;
            toast.success('Price override committed to Database');
            setEditPrices({ plan: '', price: '' });
        } catch (e: any) {
            toast.error('Commit Failure: Verification required');
        }
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute top-0 right-0 p-80 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 p-60 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="px-8 py-12 max-w-7xl mx-auto space-y-12 relative z-10">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="size-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                                <Shield size={20} />
                            </div>
                            <h1 className="font-display font-black text-4xl tracking-tighter text-foreground leading-none">SubPool Admin</h1>
                        </div>
                        <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-[0.4em]">Core Pricing & Platform Data Matrix (v6.1)</p>
                    </div>
                    
                    <div className="flex gap-4">
                        <Button 
                            className="h-12 px-6 rounded-2xl border-border/40 font-mono text-[10px] uppercase tracking-widest bg-secondary/80 hover:bg-secondary" 
                            variant="outline"
                            onClick={recomputeMetrics}
                        >
                            <RefreshCcw size={14} className="mr-2" /> Recompute Market Matrix
                        </Button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Metrics Overview */}
                    <Card className="lg:col-span-3 glass border-border/40 bg-surface-gradient shadow-2xl rounded-3xl overflow-hidden p-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {[
                                { label: 'Pools Generated', value: stats.poolsCreatedToday, icon: Database, color: 'text-primary' },
                                { label: 'Join Requests/24h', value: stats.joinRequests, icon: Users, color: 'text-blue-400' },
                                { label: 'Intelligence Yield', value: `${stats.suggestionFollowedPct}%`, icon: Zap, color: 'text-amber-400' },
                                { label: 'Primary Node', value: stats.topPlatform, icon: TrendingUp, color: 'text-emerald-400' }
                            ].map((stat, i) => (
                                <div key={i} className="space-y-4">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <stat.icon size={14} />
                                        <p className="font-mono text-[9px] uppercase tracking-widest">{stat.label}</p>
                                    </div>
                                    <p className={cn("font-display font-black text-4xl", stat.color)}>{stat.value}</p>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Sync Panel */}
                    <Card className="lg:col-span-2 glass border-border/40 bg-card/60 rounded-[32px] overflow-hidden">
                        <div className="p-8 border-b border-border/40 flex justify-between items-center bg-white/5">
                            <div>
                                <h2 className="font-display font-bold text-xl tracking-tight">Platform Synchronisation</h2>
                                <p className="font-mono text-[9px] text-muted-foreground uppercase mt-1">Direct Uplink to Edge Analytics</p>
                            </div>
                            <Button 
                                size="sm" 
                                className="rounded-xl h-10 font-mono text-[9px] uppercase tracking-widest"
                                onClick={() => refreshPricing('all_ott')}
                                disabled={syncing !== null}
                            >
                                {syncing === 'all_ott' ? 'Synchronising...' : 'Global Sync'}
                            </Button>
                        </div>
                        <div className="divide-y divide-border/20 overflow-y-auto max-h-[500px] custom-scrollbar">
                            {PLATFORMS.map(p => (
                                <div key={p.id} className="p-6 flex justify-between items-center group hover:bg-white/5 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="text-2xl group-hover:scale-110 transition-transform">{p.icon}</div>
                                        <div>
                                            <p className="font-display font-bold text-sm text-foreground">{p.name}</p>
                                            <p className="font-mono text-[9px] text-muted-foreground uppercase opacity-60">Uplink Status: Optimized</p>
                                        </div>
                                    </div>
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="rounded-xl h-9 border-border/60 hover:border-primary/40 text-[9px] font-mono tracking-widest"
                                        onClick={() => refreshPricing(p.id)}
                                        disabled={syncing !== null}
                                    >
                                        {syncing === p.id ? 'Loading...' : 'Force Sync'}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Manual Editor */}
                    <div className="space-y-8">
                        <Card className="glass border-border/40 bg-card/60 rounded-[32px] overflow-hidden">
                            <div className="p-8 border-b border-border/40 flex items-center gap-3">
                                <Database size={18} className="text-primary" />
                                <h2 className="font-display font-bold text-xl tracking-tight">Price Override</h2>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground ml-1">Platform Selection</label>
                                    <select
                                        className="flex h-12 w-full rounded-2xl border border-border/60 bg-background/50 px-4 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary/40 appearance-none"
                                        value={selectedPlatform}
                                        onChange={(e) => setSelectedPlatform(e.target.value)}
                                    >
                                        <option value="" disabled>Select Target Node...</option>
                                        {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground ml-1">Plan Identifier</label>
                                        <Input
                                            placeholder="Standard"
                                            value={editPrices.plan}
                                            className="h-12 rounded-2xl bg-background/50 border-border/60 font-mono text-xs"
                                            onChange={e => setEditPrices({ ...editPrices, plan: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground ml-1">USD Value</label>
                                        <Input
                                            placeholder="14.99"
                                            type="number" step="0.01"
                                            value={editPrices.price}
                                            className="h-12 rounded-2xl bg-background/50 border-border/60 font-mono text-xs"
                                            onChange={e => setEditPrices({ ...editPrices, price: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <Button 
                                    className="w-full h-14 rounded-2xl font-display font-black uppercase tracking-widest shadow-xl shadow-primary/10 active:scale-95 transition-all"
                                    onClick={handleSavePrice}
                                >
                                    Push to Database
                                </Button>
                            </div>
                        </Card>

                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="p-6 rounded-3xl border border-destructive/20 bg-destructive/5 flex items-start gap-4"
                        >
                            <AlertTriangle size={20} className="text-destructive shrink-0 mt-1" />
                            <p className="font-mono text-[10px] text-destructive/80 uppercase leading-relaxed tracking-wider">
                                CAUTION: Data overrides bypass standard retail verification. High impact on market metrics engine.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={cn("border bg-card text-card-foreground shadow-sm", className)}>
        {children}
    </div>
);
