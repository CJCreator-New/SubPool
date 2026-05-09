import React, { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button } from '../components/ui/button';
import { ArrowUpRight, Banknote, Clock3, WalletCards, TrendingUp, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Variants } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { EmptyState } from '../components/empty-state';
import { useHostEarnings } from '../../lib/supabase/hooks';
import { useAuth } from '../../lib/supabase/auth';
import { useRequestPayoutMutation } from '../../lib/supabase/queries';
import { formatPrice, getPlatform } from '../../lib/constants';
import { cn } from '../components/ui/utils';
import { Input } from '../components/ui/input';
import { PlatformIcon } from '../components/subpool-components';
import { toast } from 'sonner';

export function PayoutDashboard() {
  const { user } = useAuth();
  const { summary, monthly, loading, refetch } = useHostEarnings();
  const requestPayout = useRequestPayoutMutation();

  const [isWithdrawOpen, setIsWithdrawOpen] = React.useState(false);
  const [withdrawAmount, setWithdrawAmount] = React.useState('');

  const totalEarned = summary.reduce((sum, pool) => sum + pool.total_earned, 0) * 100;
  const pendingPayouts = summary.reduce((sum, pool) => sum + pool.total_pending, 0) * 100;
  const paidCount = summary.reduce((sum, pool) => sum + pool.paid_count, 0);
  
  const avgPayout = paidCount > 0 ? Math.round(totalEarned / paidCount) : 0;

  const monthlySeries = useMemo(() => {
    return monthly.map((m) => {
      const [year, monthNum] = m.month ? m.month.split('-') : ['1970', '01'];
      return {
        month: new Date(Number(year), Number(monthNum) - 1).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }),
        amount: m.earned * 100, 
        formatted: formatPrice(m.earned * 100),
        rawDollars: m.earned,
      };
    });
  }, [monthly]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 py-8 px-4 animate-in fade-in duration-700">
        <div className="space-y-2">
            <div className="h-4 bg-muted/60 rounded w-24 animate-pulse" />
            <div className="h-10 bg-muted/60 rounded w-64 animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-card rounded-xl border border-border/40 animate-pulse" />)}
        </div>
        <div className="h-80 bg-card rounded-xl border border-border/40 animate-pulse" />
      </div>
    );
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } }
  }

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="mx-auto max-w-6xl space-y-8 py-8 px-4"
    >
      <motion.div variants={itemVariants} className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between group">
        <div>
          <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.4em] text-primary/80 font-bold">
            <span className="mr-2 opacity-50">/</span> Host Ecosystem
          </p>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl font-black tracking-tight text-foreground drop-shadow-sm">Earnings Dashboard</h1>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed">
            Realized profits, active subscriber pipelines, and multi-tenant performance analytics at a glance.
          </p>
        </div>
        <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-primary/20 bg-primary/5 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-primary backdrop-blur-sm">
              Live Feed
            </Badge>
            <div className="size-2 rounded-full bg-primary animate-pulse shadow-[0_0_12px_rgba(200,241,53,0.5)]" />
        </div>
        <Button 
            onClick={() => setIsWithdrawOpen(true)}
            disabled={totalEarned <= 0}
            className="h-14 px-8 rounded-2xl font-display font-black uppercase tracking-widest bg-primary text-primary-foreground shadow-glow-primary hover:scale-[1.02] active:scale-95 transition-all"
        >
            <Banknote className="mr-3 size-5" /> Withdraw Earnings
        </Button>
      </motion.div>

      <motion.div variants={containerVariants} className="grid gap-4 md:grid-cols-3">
        {/* Total Earned Card */}
        <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden border-border bg-surface-gradient group hover:border-primary/30 transition-all duration-500 shadow-lg">
                <div className="absolute top-0 right-0 p-4 opacity-5 translate-x-4 -translate-y-4 transition-transform duration-700 group-hover:translate-x-0 group-hover:translate-y-0">
                    <TrendingUp size={120} />
                </div>
                <CardContent className="relative p-6">
                    <div className="flex items-center justify-between mb-4">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Yield To Date</p>
                        <div className="size-9 grid place-items-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-inner group-hover:scale-110 transition-transform">
                            <WalletCards size={18} />
                        </div>
                    </div>
                    <p className="font-display text-4xl font-black text-foreground group-hover:text-primary transition-colors duration-500">
                        {totalEarned > 0 ? formatPrice(totalEarned) : '$0.00'}
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                         <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-tighter shadow-sm border border-emerald-500/20">Realized</span>
                         <span className="text-[10px] font-mono text-muted-foreground">via Connected Account</span>
                    </div>
                </CardContent>
            </Card>
        </motion.div>

        {/* Pending Card */}
        <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden border-border bg-surface-gradient group hover:border-amber-500/30 transition-all duration-500 shadow-lg">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground group-hover:text-amber-400 transition-colors">Pending Settl.</p>
                        <div className="size-9 grid place-items-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-inner group-hover:scale-110 transition-transform">
                            <Clock3 size={18} />
                        </div>
                    </div>
                    <p className="font-display text-4xl font-black text-foreground group-hover:text-amber-400 transition-colors duration-500">
                        {pendingPayouts > 0 ? formatPrice(pendingPayouts) : '$0.00'}
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                         <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-[10px] font-mono text-amber-400 font-bold uppercase tracking-tighter shadow-sm border border-amber-500/20">In Flight</span>
                         <span className="text-[10px] font-mono text-muted-foreground">Cycle: 14 Days</span>
                    </div>
                </CardContent>
            </Card>
        </motion.div>

        {/* Avg Payout Card */}
        <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden border-border bg-surface-gradient group hover:border-foreground/30 transition-all duration-500 shadow-lg">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">ARPU (Host)</p>
                        <div className="size-9 grid place-items-center rounded-xl bg-white/5 text-foreground border border-white/10 shadow-inner group-hover:scale-110 transition-transform">
                            <DollarSign size={18} />
                        </div>
                    </div>
                    <p className="font-display text-4xl font-black text-foreground">
                        {avgPayout > 0 ? formatPrice(avgPayout) : '$0.00'}
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                         <span className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] font-mono text-foreground/60 font-bold uppercase tracking-tighter shadow-sm border border-white/10">Avg./Pool</span>
                         <span className="text-[10px] font-mono text-muted-foreground">Efficiency Index</span>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <motion.div variants={itemVariants}>
          <Card className="glass border-border/50 bg-surface-gradient shadow-xl overflow-hidden group">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="font-display text-xl sm:text-2xl font-black">Velocity</CardTitle>
              <div className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest group-hover:text-primary transition-colors">Historical Delta</div>
            </CardHeader>
            <CardContent className="h-[320px] p-0 pt-4">
              {monthlySeries.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlySeries} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                    <defs>
                      <linearGradient id="earningsFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C8F135" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#C8F135" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} strokeDasharray="3 3" />
                    <XAxis 
                        dataKey="month" 
                        tickLine={false} 
                        axisLine={false} 
                        tick={{ fill: '#8F8F8F', fontSize: 10, fontFamily: 'IBM Plex Mono' }} 
                        dy={10}
                    />
                    <YAxis 
                        tickLine={false} 
                        axisLine={false} 
                        tick={{ fill: '#8F8F8F', fontSize: 10, fontFamily: 'IBM Plex Mono' }} 
                        tickFormatter={(value) => `$${Math.round(value / 100)}`} 
                    />
                    <Tooltip
                      cursor={{ stroke: 'rgba(200,241,53,0.5)', strokeWidth: 1 }}
                      contentStyle={{
                        backgroundColor: '#0E0E0E',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 16,
                        color: '#fff',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                        backdropFilter: 'blur(12px)'
                      }}
                      formatter={(value: number) => [formatPrice(value), 'Profit']}
                      labelClassName="font-display font-bold text-primary mb-1"
                    />
                    <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#C8F135" 
                        strokeWidth={3} 
                        fill="url(#earningsFill)" 
                        animationDuration={2000}
                        style={{ filter: 'drop-shadow(0 0 12px rgba(200,241,53,0.4))' }} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                    <EmptyState
                    icon="📊"
                    title="No growth data yet"
                    description="Aggregate earnings timeline will manifest here as member payouts settle into your vault."
                    />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-6">
          <Card className="border-border bg-surface-gradient shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg font-black uppercase tracking-tight">Active Pipelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="group relative rounded-2xl border border-border/70 bg-background/40 p-5 shadow-inner hover:border-primary/40 transition-colors overflow-hidden">
                <div className="absolute inset-0 bg-primary/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Managed Nodes</p>
                <div className="flex items-end justify-between">
                    <p className="font-display text-3xl font-black text-foreground group-hover:text-primary transition-colors">{summary.length}</p>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">+12% vs last mo</span>
                </div>
              </div>
              <div className="group relative rounded-2xl border border-border/70 bg-background/40 p-5 shadow-inner hover:border-primary/40 transition-colors overflow-hidden">
                <div className="absolute inset-0 bg-primary/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Total Member Count</p>
                <div className="flex items-end justify-between">
                    <p className="font-display text-3xl font-black text-foreground group-hover:text-primary transition-colors">{paidCount + summary.reduce((a,b)=>a+Number(b.pending_count),0)}</p>
                    <span className="text-[10px] font-mono text-muted-foreground font-medium">89.4% Fulfillment</span>
                </div>
              </div>
              <div className="group relative rounded-2xl border border-border/70 bg-background/40 p-5 shadow-inner hover:border-amber-500/40 transition-colors overflow-hidden">
                <div className="absolute inset-0 bg-amber-500/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Queue for Settlement</p>
                <div className="flex items-end justify-between">
                    <p className="font-display text-3xl font-black text-foreground group-hover:text-amber-500 transition-colors">{summary.reduce((a,b)=>a+Number(b.pending_count),0)}</p>
                    <span className="text-[10px] font-mono text-muted-foreground font-medium uppercase">Outstanding</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        {summary.length > 0 ? (
          <Card className="glass border-border/50 bg-surface-gradient shadow-2xl overflow-hidden">
            <CardHeader className="border-b border-border/30 bg-background/20 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <CardTitle className="font-display text-xl font-bold">Node Performance Audit</CardTitle>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Individual Yield Analysis</span>
              </div>
            </CardHeader>
            <CardContent className="divide-y divide-border/20 p-0">
              {summary.map((pool) => {
                const platform = getPlatform(pool.platform);
                return (
                  <div key={pool.pool_id} className="group relative flex items-center justify-between px-6 py-5 hover:bg-white/[0.02] transition-colors duration-300">
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="group-hover:rotate-12 transition-transform duration-500 grid size-12 place-items-center rounded-2xl bg-secondary/80 text-2xl border border-white/5 shadow-xl backdrop-blur-md">
                        <PlatformIcon platformId={pool.platform || ''} size="sm" />
                      </div>
                      <div>
                        <p className="font-display text-base font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{platform?.name || pool.platform}</p>
                        <p className="font-mono text-[11px] text-muted-foreground/80 mt-1 uppercase tracking-tighter">{pool.plan_name}</p>
                        <div className="mt-2 flex items-center gap-2">
                             <span className="text-[10px] font-mono text-primary font-bold">{pool.paid_count} settled</span>
                             <span className="size-1 rounded-full bg-border" />
                             <span className="text-[10px] font-mono text-muted-foreground">{pool.pending_count} pending</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right relative z-10">
                      <p className="font-mono text-lg font-black text-emerald-400 group-hover:scale-110 transition-transform">+{formatPrice(pool.total_earned * 100)}</p>
                      {pool.total_pending > 0 && (
                        <div className="mt-1 flex items-center justify-end">
                            <Badge variant="outline" className="border-amber-500/20 text-amber-400 text-[10px] font-mono whitespace-nowrap bg-amber-500/10 shadow-sm animate-pulse">
                            <Banknote className="mr-1.5 size-3" />
                            {formatPrice(pool.total_pending * 100)} Pending
                            </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ) : (
          <div className="pt-8">
            <EmptyState
                icon="📊"
                title="Ecosystem Vault Empty"
                description="Your node network is inactive. Host your first pool to begin generating settlement data and historical analytics."
            />
          </div>
        )}
      </motion.div>
      <motion.div variants={itemVariants}>
        {/* Existing Content */}
      </motion.div>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {isWithdrawOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    onClick={() => setIsWithdrawOpen(false)}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md" 
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md glass border-border/40 bg-surface-gradient shadow-3xl rounded-[32px] p-8 overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                <WalletCards size={24} />
                            </div>
                            <div>
                                <h3 className="font-display font-bold text-xl">Withdrawal Protocol</h3>
                                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Initialise Settlement Request</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-6 rounded-2xl bg-black/40 border border-border/40 shadow-inner">
                                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Available for Payout</p>
                                <p className="font-display text-3xl font-black text-foreground">{formatPrice(totalEarned)}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground ml-1">Transfer Amount (USD)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={withdrawAmount}
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                        className="h-14 pl-10 rounded-2xl bg-background/50 border-border/60 font-mono text-lg focus:ring-primary/40"
                                    />
                                </div>
                                <p className="font-mono text-[9px] text-muted-foreground px-1">Min: $10.00 · Processing Time: 3-5 Nodes</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={async () => {
                                    const amount = parseFloat(withdrawAmount);
                                    if (isNaN(amount) || amount < 10) {
                                        toast.error("Withdrawal under minimum threshold ($10)");
                                        return;
                                    }
                                    if (amount > totalEarned / 100) {
                                        toast.error("Insufficient liquidity in node wallet");
                                        return;
                                    }
                                    
                                    try {
                                        await requestPayout.mutateAsync({
                                            userId: user?.id || '',
                                            amountCents: amount * 100,
                                            currency: 'USD'
                                        });
                                        toast.success("Settlement Initialised: Payout in queue");
                                        setIsWithdrawOpen(false);
                                        setWithdrawAmount('');
                                        refetch();
                                    } catch (e: any) {
                                        toast.error(e.message);
                                    }
                                }}
                                disabled={requestPayout.isPending}
                                className="h-14 rounded-2xl font-display font-black uppercase tracking-widest shadow-xl shadow-primary/10"
                            >
                                {requestPayout.isPending ? "Syncing..." : "Confirm Withdrawal"}
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setIsWithdrawOpen(false)}
                                className="h-12 rounded-2xl font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                            >
                                Abort Mission
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
