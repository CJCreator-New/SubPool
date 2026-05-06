import React, { useMemo } from 'react';
import { useActionSummaryQuery } from '../../lib/supabase/queries';
import { useAuth } from '../../lib/supabase/auth';
import { NumberTicker } from '../components/subpool-components';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { formatDistanceToNow } from 'date-fns';
import { 
    Check, 
    X, 
    CreditCard, 
    Bell, 
    ArrowRight, 
    Sparkles, 
    Activity, 
    ShieldCheck, 
    Zap, 
    Wifi, 
    TrendingUp, 
    AlertTriangle,
    Target,
    BarChart3
} from 'lucide-react';
import { PremiumCard, MagneticButton } from '../components/premium-ui';
import { cn } from '../components/ui/utils';
import { useDemo } from '../components/demo-mode';
import { useCurrency } from '../../lib/currency-context';

export function ActionCenter() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { 
        data: summary,
        isLoading: loading 
    } = useActionSummaryQuery(user?.id);
    
    const { isDemo } = useDemo ? useDemo() : { isDemo: true };
    const { formatPrice } = useCurrency();

    const pendingRequests = useMemo(() => summary?.pendingRequests || [], [summary]);
    const duePayments = useMemo(() => summary?.duePayments || [], [summary]);
    const unreadNotifications = useMemo(() => summary?.unreadNotifications || [], [summary]);
    const monthlySavingsCents = summary?.monthlySavingsCents || 0;

    const [latency, setLatency] = React.useState(24);
    const [networkGrowth, setNetworkGrowth] = React.useState(12.4);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setLatency(Math.floor(Math.random() * 15) + 18);
            setNetworkGrowth(prev => prev + (Math.random() * 0.2 - 0.1));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const hasActions = pendingRequests.length > 0 || duePayments.length > 0;
    const nextPayment = duePayments[0];

    if (loading) {
        return (
            <div className="flex flex-col gap-6 p-8 animate-pulse">
                <div className="h-32 w-full bg-white/5 rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-64 bg-white/5 rounded-2xl" />
                    <div className="h-64 bg-white/5 rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="relative max-w-7xl mx-auto p-6 space-y-12 bg-grid-technical min-h-screen scan-line">
            
            {/* Background Ambient Glows */}
            <div className="absolute top-0 left-1/4 size-[600px] bg-primary/5 rounded-full blur-[160px] -z-10" />
            <div className="absolute bottom-1/4 right-1/4 size-[400px] bg-blue-500/5 rounded-full blur-[100px] -z-10" />

            {/* Header: Greeting & Savings */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-4 border-b border-white/5">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="font-display font-black text-5xl tracking-tighter text-foreground">Action Center</h1>
                    <div className="flex items-center gap-2 mt-3">
                        <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-[0.3em]">
                            {hasActions ? 'Active Mission Parameters' : 'All Systems Operational'}
                        </p>
                        <div className={cn("size-2 rounded-full", hasActions ? "bg-primary shadow-glow-primary animate-pulse" : "bg-white/20")} />
                    </div>
                </motion.div>
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-wrap gap-4"
                >
                    {/* HUD Module */}
                    <div className="flex gap-8 p-6 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-md relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 opacity-5">
                            <Activity size={80} />
                        </div>
                        <div className="space-y-4 relative z-10">
                            <div className="flex items-center gap-6">
                                <div>
                                    <p className="font-mono text-[8px] text-muted-foreground uppercase tracking-widest mb-1">Node Latency</p>
                                    <div className="text-xl font-display font-black text-primary flex items-baseline gap-1">
                                        <NumberTicker value={latency} />
                                        <span className="text-[10px] opacity-50">MS</span>
                                    </div>
                                </div>
                                <div className="h-8 w-px bg-white/10" />
                                <div>
                                    <p className="font-mono text-[8px] text-muted-foreground uppercase tracking-widest mb-1">Network Growth</p>
                                    <div className="text-xl font-display font-black text-emerald-400 flex items-baseline gap-1">
                                        +{networkGrowth.toFixed(1)}
                                        <span className="text-[10px] opacity-50">%</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 pt-1 border-t border-white/5">
                                <div className="flex items-center gap-1.5 font-mono text-[9px] text-primary uppercase tracking-tighter">
                                    <ShieldCheck size={10} />
                                    <span>Identity Verified</span>
                                </div>
                                <div className="flex items-center gap-1.5 font-mono text-[9px] text-muted-foreground uppercase tracking-tighter">
                                    <Wifi size={10} />
                                    <span>Global Edge Active</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-10 p-6 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
                        <div className="text-right">
                            <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Optimized Liquidity</p>
                            <div className="text-3xl font-display font-black text-primary flex items-baseline justify-end">
                                <span className="font-mono tracking-tighter">{formatPrice(monthlySavingsCents)}</span>
                                <span className="text-xs text-muted-foreground ml-2 font-mono">/MO</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* Primary Actions Column */}
                <div className="lg:col-span-8 space-y-12">
                    
                    {/* Predictive Analytics Section (Phase 4.2) */}
                    <motion.section 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                         <Card className="bg-card/40 border-border/50 border-technical p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Target size={48} className="text-primary" />
                            </div>
                            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Retention Intelligence</p>
                            <div className="flex items-end justify-between">
                                <div className="space-y-1">
                                    <p className="text-2xl font-display font-black text-success uppercase italic">Low Churn Risk</p>
                                    <p className="font-mono text-[10px] text-muted-foreground uppercase">94% Stability across nodes</p>
                                </div>
                                <div className="flex gap-1 items-end h-8">
                                    {[1,2,3,4,5,6].map(i => (
                                        <div key={i} className={cn("w-1 rounded-full bg-primary", i < 5 ? "h-6 shadow-glow-primary" : "h-2 bg-white/10")} />
                                    ))}
                                </div>
                            </div>
                         </Card>

                         <Card className="bg-card/40 border-border/50 border-technical p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <TrendingUp size={48} className="text-blue-500" />
                            </div>
                            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Arbitrage Opportunity</p>
                            <div className="space-y-1">
                                <p className="text-2xl font-display font-black text-blue-400 uppercase italic">High Yield Found</p>
                                <p className="font-mono text-[10px] text-muted-foreground uppercase">Target: Netflix (TR Protocol)</p>
                            </div>
                            <Button variant="link" className="mt-4 p-0 h-auto font-mono text-[9px] uppercase text-primary tracking-widest">
                                View Alpha Terminal <ArrowRight size={10} className="ml-1" />
                            </Button>
                         </Card>
                    </motion.section>
                    
                    {/* HOST: Pending Requests */}
                    <AnimatePresence mode="popLayout">
                        {pendingRequests.length > 0 && (
                            <motion.section
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-md">
                                        <Sparkles size={14} className="text-primary" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h2 className="font-display font-black text-xl tracking-tight uppercase italic">Inbound Protocols</h2>
                                        <p className="font-mono text-[8px] text-muted-foreground/50 uppercase tracking-[0.2em]">Priority: Security Clearance Required</p>
                                    </div>
                                    <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {pendingRequests.map((req) => (
                                        <PremiumCard key={req.id} flareColor="rgba(200, 241, 53, 0.12)" className="hover:border-primary/40">
                                            <div className="p-6 space-y-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="size-11 border border-primary/20 p-0.5">
                                                            <AvatarFallback className="bg-primary/5 text-primary font-black text-sm">
                                                                {req.requester?.username?.[0].toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-display font-black text-sm">{req.requester?.username}</p>
                                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                                <ShieldCheck size={8} className="text-primary" />
                                                                <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-tighter">Verified Node</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 group-hover:border-primary/20 transition-all">
                                                    <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-2">TARGET POOL</p>
                                                    <p className="text-sm font-display font-black italic">{req.pool?.plan_name}</p>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button variant="ghost" className="flex-1 h-11 rounded-xl font-mono text-[10px] uppercase tracking-widest hover:bg-destructive/10 hover:text-destructive">
                                                        Reject
                                                    </Button>
                                                    <Button className="flex-1 h-11 rounded-xl font-mono text-[10px] uppercase tracking-widest bg-primary text-primary-foreground shadow-glow-primary border-none">
                                                        Authorize
                                                    </Button>
                                                </div>
                                            </div>
                                        </PremiumCard>
                                    ))}
                                </div>
                            </motion.section>
                        )}
                    </AnimatePresence>

                    {/* MEMBER: Due Payments */}
                    <AnimatePresence mode="popLayout">
                        {duePayments.length > 0 && (
                            <motion.section
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-md">
                                        <CreditCard size={14} className="text-blue-500" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h2 className="font-display font-black text-xl tracking-tight uppercase italic">Ledger Settlements</h2>
                                        <p className="font-mono text-[8px] text-destructive/50 uppercase tracking-[0.2em]">Priority: Immediate Liquidity Action</p>
                                    </div>
                                    <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                                </div>

                                <div className="space-y-4">
                                    {duePayments.map((payment) => (
                                        <PremiumCard key={payment.id} flareColor="rgba(59, 130, 246, 0.12)" className="hover:border-blue-500/40">
                                            <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                                                <div className="flex items-center gap-6">
                                                    <div className="size-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 shadow-inner group-hover:bg-blue-500 group-hover:text-white transition-all">
                                                        <CreditCard size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="font-display font-black text-lg tracking-tight uppercase italic">{payment.pool_name}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                                                                Expires: {formatDistanceToNow(new Date(payment.due_at), { addSuffix: true })}
                                                            </p>
                                                            <span className="size-1 rounded-full bg-destructive animate-pulse" />
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-row items-center gap-8 w-full sm:w-auto">
                                                    <div className="text-center sm:text-right flex-1 sm:flex-none">
                                                        <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Maturity Val</p>
                                                        <p className="text-2xl font-display font-black text-foreground font-mono">
                                                            {formatPrice(payment.amount_cents)}
                                                        </p>
                                                    </div>
                                                    <MagneticButton onClick={() => {}} className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl px-8 h-12 font-display font-bold tracking-tight shadow-xl shadow-blue-600/20 group overflow-hidden border-none">
                                                        <span className="relative z-10 uppercase italic text-xs">Execute Settlement</span>
                                                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                                                    </MagneticButton>
                                                </div>
                                            </div>
                                        </PremiumCard>
                                    ))}
                                </div>
                            </motion.section>
                        )}
                    </AnimatePresence>

                    {/* Empty State */}
                    {!hasActions && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-20 border border-dashed border-white/5 rounded-[40px] bg-white/[0.01] space-y-6"
                        >
                            <div className="size-24 rounded-full bg-primary/5 flex items-center justify-center text-primary group transition-all duration-700 hover:bg-primary/10">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                >
                                    <Sparkles size={40} className="drop-shadow-glow" />
                                </motion.div>
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="font-display font-black text-3xl uppercase tracking-tighter italic">Optimization Complete</h3>
                                <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest max-w-xs mx-auto leading-loose opacity-60">
                                    Zero pending items detected. <br />Your portfolio is fully synchronized.
                                </p>
                            </div>
                            <Button 
                                variant="outline" 
                                size="lg" 
                                onClick={() => navigate('/browse')} 
                                className="rounded-full border-white/10 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all font-display font-bold uppercase text-[11px] tracking-widest h-12 px-8"
                            >
                                Explore Opportunities
                            </Button>
                        </motion.div>
                    )}
                </div>

                {/* Sidebar Column */}
                <div className="lg:col-span-4 space-y-10">
                    
                    {/* Active Sessions Intelligence (Phase 4.1) */}
                    <Card className="bg-card/40 border-border/50 border-technical p-6 space-y-4">
                         <div className="flex items-center justify-between">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Active Edge Sessions</p>
                            <div className="flex items-center gap-1.5">
                                <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                                <span className="font-mono text-[8px] text-primary uppercase font-bold tracking-widest">LIVE</span>
                            </div>
                         </div>
                         <div className="space-y-3">
                            {[
                                { node: 'AWS-VIRGINIA-01', load: 42 },
                                { node: 'GCP-MUMBAI-04', load: 88 },
                                { node: 'AZURE-LONDON-02', load: 15 }
                            ].map((node, i) => (
                                <div key={i} className="space-y-1.5">
                                    <div className="flex justify-between font-mono text-[9px] uppercase">
                                        <span className="text-muted-foreground">{node.node}</span>
                                        <span className={cn(node.load > 80 ? "text-rose-400" : "text-primary")}>{node.load}%</span>
                                    </div>
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className={cn("h-full transition-all duration-1000", node.load > 80 ? "bg-rose-400" : "bg-primary")} style={{ width: `${node.load}%` }} />
                                    </div>
                                </div>
                            ))}
                         </div>
                    </Card>
                    
                    {/* Priority Settlement Card */}
                    {nextPayment && (
                        <motion.section
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center gap-2">
                                <Zap size={14} className="text-amber-400" />
                                <h2 className="font-display font-black text-[10px] uppercase tracking-widest text-muted-foreground italic">Urgent Settlement</h2>
                            </div>
                            <div className="bg-gradient-to-br from-amber-400/20 to-transparent border border-amber-400/20 rounded-3xl p-6 relative overflow-hidden group shadow-glow-amber/5">
                                <div className="absolute -right-4 -top-4 size-32 bg-amber-400/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                                <div className="space-y-4 relative z-10">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-display font-black text-xl text-foreground mb-1 uppercase italic tracking-tight">{nextPayment.pool_name}</p>
                                            <p className="font-mono text-[10px] text-amber-400 uppercase font-bold tracking-[0.3em] animate-pulse">Action Required</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-mono text-[10px] text-muted-foreground uppercase mb-1 opacity-50">Due</p>
                                            <p className="font-display font-black text-lg text-foreground">
                                                {formatDistanceToNow(new Date(nextPayment.due_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                    <Button className="w-full bg-amber-400 hover:bg-amber-300 text-amber-950 font-black tracking-[0.2em] uppercase text-[10px] h-12 rounded-2xl shadow-xl shadow-amber-400/20 border-none">
                                        Settle { formatPrice(nextPayment.amount_cents) }
                                    </Button>
                                </div>
                            </div>
                        </motion.section>
                    )}
                    
                    {/* Activity Feed */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Bell size={18} className="text-muted-foreground" />
                                <h2 className="font-display font-black text-xl tracking-tight uppercase italic">Signal Feed</h2>
                            </div>
                            <span className="font-mono text-[9px] text-muted-foreground uppercase opacity-40 tracking-widest">Live Updates</span>
                        </div>
                        
                        <div className="space-y-2">
                            {unreadNotifications.length > 0 ? (
                                unreadNotifications.map((notif) => (
                                    <motion.div 
                                        key={notif.id}
                                        whileHover={{ x: 4 }}
                                        className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-[10px] font-mono text-primary uppercase tracking-widest font-black italic">{notif.type}</p>
                                            <p className="text-[9px] font-mono text-muted-foreground/50">{timeAgo(notif.created_at)}</p>
                                        </div>
                                        <p className="text-xs font-bold text-foreground leading-snug group-hover:text-primary transition-colors">{notif.title}</p>
                                        <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2 leading-relaxed opacity-60">{notif.body}</p>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="py-20 text-center rounded-2xl border border-dashed border-white/5">
                                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground opacity-30">Waiting for signals...</p>
                                </div>
                            )}
                        </div>
                        
                        <Button variant="ghost" className="w-full h-12 rounded-2xl font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-primary group border border-white/5 hover:border-primary/20">
                           Full Archive Access <ArrowRight size={14} className="ml-3 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </section>

                    {/* Pro Upgrade Card */}
                    <PremiumCard flareColor="rgba(255,255,255,0.05)" className="bg-primary shadow-glow-primary border-none overflow-hidden hover:scale-[1.02] transition-transform duration-500">
                        <div className="p-8 space-y-6 relative overflow-hidden">
                            <div className="relative z-10 space-y-2">
                                <h3 className="font-display font-black text-3xl text-primary-foreground tracking-tighter leading-none italic uppercase">
                                    Expand <br />Scale
                                </h3>
                                <p className="text-primary-foreground/70 font-mono text-[10px] uppercase tracking-widest leading-relaxed">
                                    Upgrade to <b>Enterprise</b> to manage 100+ nodes and unlock global edge analytics.
                                </p>
                            </div>
                            <Button className="w-full bg-primary-foreground text-primary font-black uppercase tracking-widest text-[11px] hover:bg-white rounded-2xl h-12 shadow-2xl relative z-10 border-none">
                                Upgrade Terminal
                            </Button>
                            
                            {/* Decorative background artifacts */}
                            <div className="absolute top-0 right-0 size-32 bg-white/10 rounded-full blur-3xl" />
                            <div className="absolute -bottom-8 -left-8 size-48 bg-white/5 rounded-full blur-[80px]" />
                        </div>
                    </PremiumCard>
                </div>

            </div>
        </div>
    );
}

import { Card } from '../components/ui/card';

// Helper (normally imported)
function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days = Math.floor(diff / 86_400_000);
    if (minutes < 1) return 'JUST NOW';
    if (minutes < 60) return `${minutes}M AGO`;
    if (hours < 24) return `${hours}H AGO`;
    if (days < 7) return `${days}D AGO`;
    return 'LATELY';
}
