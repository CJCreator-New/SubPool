import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { EmptyState } from '../components/empty-state';
import { useLedger } from '../../lib/supabase/hooks';
import { formatPrice } from '../../lib/constants';

export function PayoutDashboard() {
  const { data: ledgerEntries } = useLedger();

  // Compute actual earnings from ledger (entries where user is pool owner = payout type)
  const totalEarned = ledgerEntries
    .filter(e => e.type === 'payout' && e.status === 'paid')
    .reduce((sum, e) => sum + e.amount_cents, 0);

  const pendingPayouts = ledgerEntries
    .filter(e => e.type === 'payout' && e.status === 'owed')
    .reduce((sum, e) => sum + e.amount_cents, 0);

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl mb-1">💵 Payouts</h1>
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
          Pool owner earnings & withdrawals
        </p>
      </div>

      {/* Earnings summary from real data */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Total Earned</p>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold text-primary">
              {totalEarned > 0 ? formatPrice(totalEarned) : '—'}
            </p>
            <p className="font-mono text-[10px] text-muted-foreground mt-1">from pool memberships</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Pending</p>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold text-amber-500">
              {pendingPayouts > 0 ? formatPrice(pendingPayouts) : '—'}
            </p>
            <p className="font-mono text-[10px] text-muted-foreground mt-1">awaiting settlement</p>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon Banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <span className="text-3xl" role="img" aria-label="icon">🏗️</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-display font-bold text-lg">Withdrawal Coming Soon</h3>
                <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider border-primary/30 text-primary px-2 py-0.5">
                  In Development
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Direct bank withdrawals and automated payouts are currently being developed.
                In the meantime, you can track your earnings through the Ledger and settle payments
                with pool members directly.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  <span className="font-mono text-[10px] text-muted-foreground">Earnings tracking</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  <span className="font-mono text-[10px] text-muted-foreground">Manual settlement</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  <span className="font-mono text-[10px] text-muted-foreground">Bank withdrawals</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  <span className="font-mono text-[10px] text-muted-foreground">Auto payouts</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent payout-type ledger entries */}
      {ledgerEntries.filter(e => e.type === 'payout').length > 0 ? (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-display text-lg">Earning History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ledgerEntries
                .filter(e => e.type === 'payout')
                .slice(0, 10)
                .map(entry => (
                  <div key={entry.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{entry.platform_emoji}</span>
                      <div>
                        <p className="font-display text-sm font-semibold">{entry.pool_name}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">from {entry.counterparty_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-bold text-primary">{formatPrice(entry.amount_cents)}</p>
                      <Badge variant="outline" className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border ${entry.status === 'paid' ? 'border-emerald-500/20 text-emerald-500' : 'border-amber-500/20 text-amber-500'
                        }`}>
                        {entry.status}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon="💵"
          title="No earnings yet"
          description="Start hosting pools to earn payouts from members. Your earning history will appear here."
        />
      )}
    </div>
  );
}
