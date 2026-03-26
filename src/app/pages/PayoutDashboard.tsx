import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowUpRight, Banknote, Clock3, WalletCards } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { EmptyState } from '../components/empty-state';
import { useHostEarnings } from '../../lib/supabase/hooks';
import { formatPrice, getPlatform } from '../../lib/constants';

export function PayoutDashboard() {
  const { summary, monthly, loading } = useHostEarnings();

  const totalEarned = summary.reduce((sum, pool) => sum + pool.total_earned, 0) * 100;
  const pendingPayouts = summary.reduce((sum, pool) => sum + pool.total_pending, 0) * 100;
  const paidCount = summary.reduce((sum, pool) => sum + pool.paid_count, 0);
  
  const avgPayout = paidCount > 0 ? Math.round(totalEarned / paidCount) : 0;

  const monthlySeries = useMemo(() => {
    return monthly.map((m) => {
      // Safely check if m.month exists before splitting
      const [year, monthNum] = m.month ? m.month.split('-') : ['1970', '01'];
      return {
        month: new Date(Number(year), Number(monthNum) - 1).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }),
        amount: m.earned * 100, // Cents for formatPrice
        formatted: formatPrice(m.earned * 100),
        rawDollars: m.earned,
      };
    });
  }, [monthly]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 py-6 animate-pulse px-4">
        <div className="h-20 bg-card rounded-md w-1/3 border border-border"></div>
        <div className="h-32 bg-card rounded-md w-full border border-border"></div>
        <div className="h-64 bg-card rounded-md w-full border border-border mt-4"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 py-6 px-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors cursor-default">Host Analytics</p>
          <h1 className="mt-2 font-display text-3xl font-black tracking-tight">Earnings Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Track realized earnings, pending member payouts, and the performance of your hosted pools.
          </p>
        </div>
        <Badge variant="outline" className="w-fit border-primary/20 bg-primary/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
          Phase 6 Powered
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card hover:bg-card/80 transition-colors">
          <CardContent className="flex items-start justify-between p-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Total Earned</p>
              <p className="mt-2 font-display text-3xl font-black text-primary drop-shadow-sm">
                {totalEarned > 0 ? formatPrice(totalEarned) : '—'}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">Completed payouts</p>
            </div>
            <div className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/20">
              <WalletCards className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card hover:bg-card/80 transition-colors">
          <CardContent className="flex items-start justify-between p-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Pending Settlement</p>
              <p className="mt-2 font-display text-3xl font-black text-amber-400 drop-shadow-sm">
                {pendingPayouts > 0 ? formatPrice(pendingPayouts) : '—'}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">Awaiting members</p>
            </div>
            <div className="grid size-11 place-items-center rounded-2xl bg-amber-500/10 text-amber-400 shadow-sm border border-amber-500/20">
              <Clock3 className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card hover:bg-card/80 transition-colors">
          <CardContent className="flex items-start justify-between p-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Average Payout</p>
              <p className="mt-2 font-display text-3xl font-black text-foreground drop-shadow-sm">
                {avgPayout > 0 ? formatPrice(avgPayout) : '—'}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">Typical payout size</p>
            </div>
            <div className="grid size-11 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-400 shadow-sm border border-emerald-500/20">
              <ArrowUpRight className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg">Monthly Earnings Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            {monthlySeries.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlySeries} margin={{ top: 10, right: 10, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="earningsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C8F135" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#C8F135" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#8F8F8F', fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#8F8F8F', fontSize: 11 }} tickFormatter={(value) => `$${Math.round(value / 100)}`} />
                  <Tooltip
                    cursor={{ stroke: 'rgba(200,241,53,0.25)' }}
                    contentStyle={{
                      backgroundColor: '#151515',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 12,
                      color: '#fff',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
                    }}
                    formatter={(value: number) => formatPrice(value)}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#C8F135" strokeWidth={2.5} fill="url(#earningsFill)" style={{ filter: 'drop-shadow(0 0 6px rgba(200,241,53,0.3))' }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                icon="💸"
                title="No payout history yet"
                description="Host a pool and collect your first payment to unlock the earnings graph."
              />
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg">Host Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-background/80 to-background/30 p-4 shadow-sm">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Active Hosted Pools</p>
              <p className="mt-2 font-display text-2xl font-bold text-foreground">{summary.length}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-background/80 to-background/30 p-4 shadow-sm">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Successful Collections</p>
              <p className="mt-2 font-display text-2xl font-bold text-foreground">{paidCount}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-background/80 to-background/30 p-4 shadow-sm flex gap-4">
               <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Total Pending</p>
                  <p className="mt-2 font-display text-2xl font-bold text-foreground">{summary.reduce((a,b)=>a+Number(b.pending_count),0)} <span className="text-sm font-normal text-muted-foreground">payments</span></p>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {summary.length > 0 ? (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-display text-lg">Platform Earnings Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.map((pool) => {
              const platform = getPlatform(pool.platform);
              return (
                <div key={pool.pool_id} className="flex items-center justify-between border-b border-border/50 py-3 last:border-0 hover:bg-white/5 transition-colors duration-300 px-3 -mx-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-xl bg-secondary/40 text-lg border border-white/5 shadow-inner">
                      {platform?.icon || '📦'}
                    </div>
                    <div>
                      <p className="font-display text-sm font-semibold">{platform?.name || pool.platform} • {pool.plan_name}</p>
                      <p className="font-mono text-[10px] text-muted-foreground mt-0.5">{pool.paid_count} members paid · {pool.pending_count} pending</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-bold text-emerald-400">+{formatPrice(pool.total_earned * 100)}</p>
                    {pool.total_pending > 0 && (
                      <Badge variant="outline" className="mt-1 border-amber-500/20 text-amber-400 text-[10px] font-mono whitespace-nowrap bg-amber-500/5">
                        <Banknote className="mr-1 size-3" />
                        {formatPrice(pool.total_pending * 100)} Pend.
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon="📊"
          title="No Active Pools"
          description="Start hosting pools to build payout history. Once members begin paying, this dashboard will populate automatically."
        />
      )}
    </div>
  );
}
