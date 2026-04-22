import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase/client';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { PLATFORMS, getPlatform } from '../../lib/constants';
import { useAuth } from '../../lib/supabase/auth';
import { useAdminUsers, useAdminPools } from '../../lib/supabase/hooks';
import { 
    Shield, Zap, TrendingUp, Users as UsersIcon, RefreshCcw, Database, Lock, AlertTriangle, 
    UserMinus, UserCheck, Eye, Trash2, Search, Filter, Globe, DollarSign
} from 'lucide-react';
import { cn } from '../components/ui/utils';
import { 
    Card, 
    CardHeader, 
    CardTitle, 
    CardDescription, 
    CardContent 
} from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';

type AdminTab = 'metrics' | 'users' | 'pools' | 'sync';

export function AdminPage() {
    const { profile, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState<AdminTab>('metrics');
    const [searchQuery, setSearchQuery] = useState('');
    
    const { users, loading: usersLoading, refetch: refetchUsers } = useAdminUsers();
    const { pools, loading: poolsLoading, refetch: refetchPools } = useAdminPools();

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
                const [{ data: created }, { data: requests }, { data: market }] = await Promise.all([
                    db.from('analytics_events').select('id').eq('event_name', 'pool_created').gte('created_at', start),
                    db.from('analytics_events').select('id').eq('event_name', 'join_request_submitted').gte('created_at', start),
                    db.from('analytics_events').select('id').eq('event_name', 'market_intelligence_expanded').gte('created_at', start),
                ]);

                setStats({
                    poolsCreatedToday: created?.length ?? 0,
                    joinRequests: requests?.length ?? 0,
                    suggestionFollowedPct: (requests?.length ?? 0) === 0 ? 0 : Math.round(((market?.length ?? 0) / (requests?.length ?? 0)) * 100),
                    topPlatform: created && created.length > 0 ? 'Netflix' : 'None',
                });
            } catch (error) {
                console.warn('Admin stats fallback:', error);
            }
        };

        loadStats();
    }, [isAuthorized]);

    const handleBanUser = async (userId: string, isBanned: boolean) => {
        if (!supabase) return;
        try {
            const { error } = await supabase.from('profiles').update({ is_banned: !isBanned }).eq('id', userId);
            if (error) throw error;
            toast.success(`User ${isBanned ? 'unbanned' : 'banned'} successfully.`);
            refetchUsers();
        } catch (e: any) {
            toast.error(`Operation failed: ${e.message}`);
        }
    };

    const handleDeactivatePool = async (poolId: string) => {
        if (!supabase) return;
        try {
            const { error } = await supabase.from('pools').update({ status: 'closed' }).eq('id', poolId);
            if (error) throw error;
            toast.success('Pool deactivated.');
            refetchPools();
        } catch (e: any) {
            toast.error(`Operation failed: ${e.message}`);
        }
    };

    const filteredUsers = users.filter(u => 
        (u.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredPools = pools.filter(p => 
        (p.platform || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.plan_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                category: 'OTT'
            }, { onConflict: 'platform_id,plan_name,currency,country_code' });

            if (error) throw error;
            toast.success('Price override committed to Database');
            setEditPrices({ plan: '', price: '' });
        } catch (e: any) {
            toast.error('Commit Failure: Verification required');
        }
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden bg-grid-technical">
            {/* Background Atmosphere */}
            <div className="absolute top-0 right-0 p-80 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 p-60 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="px-8 py-12 max-w-7xl mx-auto space-y-10 relative z-10">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="size-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                                <Shield size={20} />
                            </div>
                            <h1 className="font-display font-black text-4xl tracking-tighter text-foreground leading-none">Command Center</h1>
                        </div>
                        <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-[0.4em]">Administrative Oversight & Data Matrix (v6.2)</p>
                    </div>
                </header>

                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-2 p-1.5 bg-card/40 backdrop-blur-xl border border-border/40 rounded-2xl w-fit">
                    {[
                        { id: 'metrics', label: 'Metrics', icon: TrendingUp },
                        { id: 'users', label: 'Users', icon: UsersIcon },
                        { id: 'pools', label: 'Pools', icon: Database },
                        { id: 'sync', label: 'Pricing Sync', icon: RefreshCcw }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as AdminTab)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2.5 rounded-xl font-mono text-[10px] uppercase tracking-widest transition-all",
                                activeTab === tab.id 
                                    ? "bg-primary text-primary-foreground shadow-glow-primary" 
                                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                            )}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="space-y-8">
                    <AnimatePresence mode="wait">
                        {activeTab === 'metrics' && (
                            <motion.div
                                key="metrics"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                            >
                                {[
                                    { label: 'Daily New Pools', value: stats.poolsCreatedToday, icon: Database, color: 'text-primary' },
                                    { label: 'Join Requests/24h', value: stats.joinRequests, icon: UsersIcon, color: 'text-blue-400' },
                                    { label: 'Intelligence Yield', value: `${stats.suggestionFollowedPct}%`, icon: Zap, color: 'text-amber-400' },
                                    { label: 'Top Platform', value: stats.topPlatform, icon: Globe, color: 'text-emerald-400' }
                                ].map((stat, i) => (
                                    <Card key={i} className="glass border-border/40 bg-surface-gradient p-8 space-y-4">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <stat.icon size={14} />
                                            <p className="font-mono text-[9px] uppercase tracking-widest">{stat.label}</p>
                                        </div>
                                        <p className={cn("font-display font-black text-4xl", stat.color)}>{stat.value}</p>
                                    </Card>
                                ))}
                                
                                <Card className="md:col-span-2 lg:col-span-4 glass border-border/40 bg-card/40 p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="space-y-1">
                                            <h3 className="font-display font-bold text-xl">Platform Throughput</h3>
                                            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Global Session Activity</p>
                                        </div>
                                        <Button variant="outline" className="rounded-xl h-10 border-border/40 text-[9px] font-mono tracking-widest">
                                            Export Audit Log
                                        </Button>
                                    </div>
                                    <div className="h-[200px] w-full flex items-end gap-2 px-2">
                                        {[40, 65, 45, 90, 75, 55, 80, 60, 45, 70, 85, 50].map((h, i) => (
                                            <div key={i} className="flex-1 bg-primary/20 rounded-t-lg relative group cursor-pointer hover:bg-primary/40 transition-all" style={{ height: `${h}%` }}>
                                                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {activeTab === 'users' && (
                            <motion.div
                                key="users"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center gap-4 max-w-md">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
                                        <Input 
                                            placeholder="Search users by name or uplink..." 
                                            className="h-12 pl-10 rounded-2xl bg-card/40 border-border/40 font-mono text-xs"
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <Button variant="outline" className="h-12 rounded-2xl border-border/40 px-4">
                                        <Filter size={18} />
                                    </Button>
                                </div>

                                <Card className="glass border-border/40 bg-card/40 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-white/5 border-b border-border/40">
                                                <tr>
                                                    <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">User</th>
                                                    <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Plan</th>
                                                    <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Refs</th>
                                                    <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Status</th>
                                                    <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/20">
                                                {filteredUsers.map((user) => (
                                                    <tr key={user.id} className="group hover:bg-white/5 transition-all">
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="size-9 border border-border/40">
                                                                    <AvatarFallback className="bg-secondary/80 text-[10px] font-black">{user.username?.[0]?.toUpperCase()}</AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <p className="font-display font-bold text-sm">{user.display_name || user.username}</p>
                                                                    <p className="font-mono text-[10px] text-muted-foreground lowercase opacity-60">{user.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <span className={cn(
                                                                "px-2 py-0.5 rounded-full border text-[9px] font-bold tracking-widest uppercase",
                                                                user.plan === 'pro' ? "text-primary border-primary/40 bg-primary/10" : "text-muted-foreground border-border bg-muted/20"
                                                            )}>
                                                                {user.plan}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-5 font-mono text-sm">{user.referrals?.[0]?.count ?? 0}</td>
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-2">
                                                                <div className={cn("size-2 rounded-full", user.is_banned ? "bg-destructive" : "bg-emerald-500")} />
                                                                <span className="font-mono text-[10px] uppercase tracking-widest">{user.is_banned ? 'Banned' : 'Active'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5 text-right">
                                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Button variant="ghost" size="icon" className="size-8 rounded-lg hover:bg-primary/20 text-primary">
                                                                    <Eye size={14} />
                                                                </Button>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    className={cn("size-8 rounded-lg", user.is_banned ? "hover:bg-emerald-500/20 text-emerald-500" : "hover:bg-destructive/20 text-destructive")}
                                                                    onClick={() => handleBanUser(user.id, user.is_banned)}
                                                                >
                                                                    {user.is_banned ? <UserCheck size={14} /> : <UserMinus size={14} />}
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {activeTab === 'pools' && (
                            <motion.div
                                key="pools"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center gap-4 max-w-md">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
                                        <Input 
                                            placeholder="Search pools by platform or plan..." 
                                            className="h-12 pl-10 rounded-2xl bg-card/40 border-border/40 font-mono text-xs"
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <Card className="glass border-border/40 bg-card/40 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-white/5 border-b border-border/40">
                                                <tr>
                                                    <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Platform / Plan</th>
                                                    <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Host</th>
                                                    <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Slots</th>
                                                    <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Price</th>
                                                    <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/20">
                                                {filteredPools.map((pool) => {
                                                    const platform = getPlatform(pool.platform);
                                                    return (
                                                        <tr key={pool.id} className="group hover:bg-white/5 transition-all">
                                                            <td className="px-6 py-5">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-xl">{platform?.icon || '📦'}</span>
                                                                    <div>
                                                                        <p className="font-display font-bold text-sm">{platform?.name || pool.platform}</p>
                                                                        <p className="font-mono text-[10px] text-muted-foreground uppercase opacity-60">{pool.plan_name}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-5">
                                                                <p className="text-xs font-mono">{pool.owner?.username || 'Unknown'}</p>
                                                            </td>
                                                            <td className="px-6 py-5">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="h-1 w-12 bg-white/10 rounded-full overflow-hidden">
                                                                        <div className="h-full bg-primary" style={{ width: `${(pool.filled_slots / pool.total_slots) * 100}%` }} />
                                                                    </div>
                                                                    <span className="font-mono text-[10px]">{pool.filled_slots}/{pool.total_slots}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-5 font-mono text-sm">${(pool.price_per_slot / 100).toFixed(2)}</td>
                                                            <td className="px-6 py-5 text-right">
                                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    {pool.status !== 'closed' && (
                                                                        <Button 
                                                                            variant="ghost" 
                                                                            size="icon" 
                                                                            className="size-8 rounded-lg hover:bg-destructive/20 text-destructive"
                                                                            onClick={() => handleDeactivatePool(pool.id)}
                                                                        >
                                                                            <Trash2 size={14} />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {activeTab === 'sync' && (
                            <motion.div
                                key="sync"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                            >
                                <Card className="lg:col-span-2 glass border-border/40 bg-card/40 rounded-[32px] overflow-hidden">
                                    <CardHeader className="p-8 border-b border-border/40 flex flex-row justify-between items-center bg-white/5 space-y-0">
                                        <div>
                                            <CardTitle className="font-display font-bold text-xl tracking-tight">Platform Synchronisation</CardTitle>
                                            <CardDescription className="font-mono text-[9px] text-muted-foreground uppercase mt-1">Direct Uplink to Edge Analytics</CardDescription>
                                        </div>
                                        <Button 
                                            size="sm" 
                                            className="rounded-xl h-10 font-mono text-[9px] uppercase tracking-widest"
                                            onClick={() => refreshPricing('all_ott')}
                                            disabled={syncing !== null}
                                        >
                                            {syncing === 'all_ott' ? 'Synchronising...' : 'Global Sync'}
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="p-0">
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
                                    </CardContent>
                                </Card>

                                <div className="space-y-8">
                                    <Card className="glass border-border/40 bg-card/40 rounded-[32px] overflow-hidden">
                                        <CardHeader className="p-8 border-b border-border/40 flex flex-row items-center gap-3 space-y-0">
                                            <Database size={18} className="text-primary" />
                                            <CardTitle className="font-display font-bold text-xl tracking-tight">Price Override</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-8 space-y-6">
                                            <div className="space-y-2">
                                                <label className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground ml-1">Platform Selection</label>
                                                <select
                                                    className="flex h-12 w-full rounded-2xl border border-border/60 bg-background/50 px-4 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary/40 appearance-none text-foreground"
                                                    value={selectedPlatform}
                                                    onChange={(e) => setSelectedPlatform(e.target.value)}
                                                >
                                                    <option value="" disabled>Select Target Node...</option>
                                                    {PLATFORMS.map(p => <option key={p.id} value={p.id} className="bg-card">{p.name}</option>)}
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
                                        </CardContent>
                                    </Card>

                                    <div className="p-6 rounded-3xl border border-destructive/20 bg-destructive/5 flex items-start gap-4">
                                        <AlertTriangle size={20} className="text-destructive shrink-0 mt-1" />
                                        <p className="font-mono text-[10px] text-destructive/80 uppercase leading-relaxed tracking-wider">
                                            CAUTION: Data overrides bypass standard retail verification. High impact on market metrics engine.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
