import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowUpRight, Banknote, Clock3, WalletCards } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { EmptyState } from '../components/empty-state';
import { useLedger } from '../../lib/supabase/hooks';
import { formatPrice } from '../../lib/constants';

function monthLabel(dateValue: string | null) {
  if (!dateValue) return 'Unknown';
  return new Date(dateValue).toLocaleDateString(undefined, { month: 'short' });
}

export function PayoutDashboard() {
  const { data: ledgerEntries } = useLedger();

  const payoutEntries = useMemo(
    () => ledgerEntries.filter((entry) => entry.type === 'payout'),
    [ledgerEntries],
  );

  const totalEarned = payoutEntries
    .filter((entry) => entry.status === 'paid')
    .reduce((sum, entry) => sum + entry.amount_cents, 0);

  const pendingPayouts = payoutEntries
    .filter((entry) => entry.status === 'owed' || entry.status === 'pending')
    .reduce((sum, entry) => sum + entry.amount_cents, 0);

  const paidCount = payoutEntries.filter((entry) => entry.status === 'paid').length;
  const avgPayout = paidCount > 0 ? Math.round(totalEarned / paidCount) : 0;

  const monthlySeries = useMemo(() => {
    const totals = new Map<string, number>();
    payoutEntries.forEach((entry) => {
      const label = monthLabel(entry.settled_at ?? entry.due_at);
      totals.set(label, (totals.get(label) ?? 0) + entry.amount_cents);
    });

    return Array.from(totals.entries()).map(([month, amount]) => ({
      month,
      amount,
      formatted: formatPrice(amount),
    }));
  }, [payoutEntries]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 py-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Host Earnings</p>
          <h1 className="mt-2 font-display text-3xl font-black tracking-tight">Payout Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Track realized earnings, pending member payouts, and the momentum of your hosted pools in one place.
          </p>
        </div>
        <Badge variant="outline" className="w-fit border-primary/20 bg-primary/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
          Host View
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card">
          <CardContent className="flex items-start justify-between p-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Total Earned</p>
              <p className="mt-2 font-display text-3xl font-black text-primary">
                {totalEarned > 0 ? formatPrice(totalEarned) : '—'}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">Completed payouts across hosted pools</p>
            </div>
            <div className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
              <WalletCards className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="flex items-start justify-between p-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Pending Settlement</p>
              <p className="mt-2 font-display text-3xl font-black text-amber-400">
                {pendingPayouts > 0 ? formatPrice(pendingPayouts) : '—'}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">Awaiting member payment verification</p>
            </div>
            <div className="grid size-11 place-items-center rounded-2xl bg-amber-500/10 text-amber-400">
              <Clock3 className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="flex items-start justify-between p-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Average Payout</p>
              <p className="mt-2 font-display text-3xl font-black text-foreground">
                {avgPayout > 0 ? formatPrice(avgPayout) : '—'}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">Typical payout size from successful collections</p>
            </div>
            <div className="grid size-11 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-400">
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
                    }}
                    formatter={(value: number) => formatPrice(value)}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#C8F135" strokeWidth={2.5} fill="url(#earningsFill)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                icon="💸"
                title="No payout history yet"
                description="Host a pool and collect your first successful payment to unlock the earnings graph."
              />
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg">Host Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Payout Entries</p>
              <p className="mt-2 font-display text-2xl font-bold">{payoutEntries.length}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Successful Collections</p>
              <p className="mt-2 font-display text-2xl font-bold">{paidCount}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Collections Rate</p>
              <p className="mt-2 font-display text-2xl font-bold">
                {payoutEntries.length > 0 ? `${Math.round((paidCount / payoutEntries.length) * 100)}%` : '—'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {payoutEntries.length > 0 ? (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-display text-lg">Recent Ledger Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {payoutEntries.slice(0, 10).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between border-b border-border/50 py-3 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-secondary/40 text-lg">
                    {entry.platform_emoji || '💼'}
                  </div>
                  <div>
                    <p className="font-display text-sm font-semibold">{entry.pool_name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">from {entry.counterparty_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-bold text-foreground">{formatPrice(entry.amount_cents)}</p>
                  <Badge
                    variant="outline"
                    className={
                      entry.status === 'paid'
                        ? 'border-emerald-500/20 text-emerald-400'
                        : 'border-amber-500/20 text-amber-400'
                    }
                  >
                    <Banknote className="mr-1 size-3" />
                    {entry.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon="💵"
          title="No earnings yet"
          description="Start hosting pools to build payout history. Once members begin paying, this dashboard will populate automatically."
        />
      )}
    </div>
  );
}
