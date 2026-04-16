import React from 'react';
import { useNavigate } from 'react-router';
import { getBillingService } from '../../lib/billing/service';
import { BillingCapabilitiesResponse, InvoiceSummary } from '../../lib/billing/types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { getUserFacingError } from '../../lib/error-feedback';

export function Billing() {
  const navigate = useNavigate();
  const [summary, setSummary] = React.useState<InvoiceSummary | null>(null);
  const [capabilities, setCapabilities] = React.useState<BillingCapabilitiesResponse | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    const service = getBillingService();
    Promise.all([service.getInvoiceSummary(), service.getCapabilities()])
      .then(([nextSummary, nextCapabilities]) => {
        if (!mounted) return;
        setSummary(nextSummary);
        setCapabilities(nextCapabilities);
        setErrorMessage(null);
      })
      .catch((error) => {
        if (!mounted) return;
        const friendly = getUserFacingError(error, 'load billing details');
        setErrorMessage(friendly.message);
        setSummary({
          cycleRangeLabel: '—',
          daysElapsed: 0,
          totalDays: 30,
          cycles: [],
          upcoming: [],
        });
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (!summary) {
    return (
      <div role="status" aria-live="polite" className="max-w-5xl mx-auto py-12 text-center text-muted-foreground font-mono text-sm animate-pulse">
        Loading billing summary...
      </div>
    );
  }

  const progressPercent = (summary.daysElapsed / summary.totalDays) * 100;
  const renewalTimeline = [...summary.upcoming].slice(0, 3);
  const modeLabel = capabilities?.capability === 'enabled' ? 'Live Mode' : 'Manual/Test Mode';
  const modeClassName = capabilities?.capability === 'enabled'
    ? 'border-success/30 bg-success/10 text-success'
    : 'border-warning/30 bg-warning/10 text-warning';
  const paymentMethodLabel = capabilities?.paymentStatus === 'not_configured'
    ? 'Not configured'
    : 'Visa •••• 4242';

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-3xl mb-2">Billing & Invoices</h1>
        <p className="text-muted-foreground">Manage your subscription pool payments and upcoming charges.</p>
      </div>

      {errorMessage && (
        <div className="px-4 py-3 rounded-lg border border-warning/30 bg-warning/10 text-warning font-mono text-xs">
          {errorMessage}
        </div>
      )}

      {/* Subscription Details Link */}
      <Card
        className="cursor-pointer border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
        onClick={() => navigate('/subscriptions')}
        onKeyDown={(e) => e.key === 'Enter' && navigate('/subscriptions')}
        tabIndex={0}
      >
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-2xl" role="img" aria-label="Chart">📊</span>
            <div>
              <h3 className="font-display font-bold text-foreground">View Subscription Details</h3>
              <p className="font-mono text-xs text-muted-foreground mt-1">
                Track all your subscriptions, renewal dates, savings & payment history
              </p>
            </div>
          </div>
          <span className="font-mono text-xl text-primary" role="img" aria-label="icon">→</span>
        </CardContent>
      </Card>

      {/* Capabilities Warning */}
      {capabilities?.capability === 'placeholder' && (
        <div className="px-4 py-3 rounded-lg border border-warning/30 bg-warning/10 text-warning font-mono text-xs flex items-start gap-2">
          <span role="img" aria-label="Warning">⚠</span>
          <span>{capabilities.message}</span>
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display font-bold text-2xl text-foreground">Renewal Timeline</h2>
          <span className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider ${modeClassName}`}>
            {modeLabel}
          </span>
        </div>

        <Card className="border-border">
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-md border border-border/70 bg-secondary/20 px-3 py-2">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Next Renewal</p>
                <p className="font-display text-base font-bold mt-1 text-foreground">
                  {renewalTimeline[0]?.date ?? 'No upcoming renewals'}
                </p>
              </div>
              <div className="rounded-md border border-border/70 bg-secondary/20 px-3 py-2">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Expected Amount</p>
                <p className="font-display text-base font-bold mt-1 text-primary">
                  {renewalTimeline[0] ? `$${renewalTimeline[0].amount.toFixed(2)}` : '$0.00'}
                </p>
              </div>
              <div className="rounded-md border border-border/70 bg-secondary/20 px-3 py-2">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Payment Method</p>
                <p className="font-mono text-sm mt-1 text-foreground">{paymentMethodLabel}</p>
              </div>
            </div>

            {renewalTimeline.length > 0 ? (
              <div className="rounded-md border border-border divide-y divide-border">
                {renewalTimeline.map((item, idx) => (
                  <div key={`${item.pool}-${idx}`} className="px-3 py-2 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display text-sm font-semibold truncate">{item.pool}</p>
                      <p className="font-mono text-[11px] text-muted-foreground mt-1">{item.date}</p>
                    </div>
                    <p className="font-mono text-sm font-semibold text-foreground">${item.amount.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-mono text-xs text-muted-foreground">No upcoming renewal events in your timeline.</p>
            )}

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => navigate('/payment/method')}>
                Update Payment Method
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* This Cycle */}
      <section className="space-y-4">
        <h2 className="font-display font-bold text-2xl text-foreground">This Cycle</h2>

        <Card className="border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                {summary.cycleRangeLabel}
              </span>
              <span className="font-mono text-xs text-foreground font-medium">
                {summary.daysElapsed} of {summary.totalDays} days
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </CardContent>
        </Card>

        {summary.cycles.length > 0 ? (
          <div className="grid gap-4">
            {summary.cycles.map((cycle, idx) => (
              <Card key={idx} className="border-border">
                <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
                  {/* Icon & Name */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="size-12 rounded-lg bg-secondary flex items-center justify-center text-2xl shrink-0">
                      {cycle.poolIcon}
                    </div>
                    <div>
                      <h4 className="font-display font-semibold text-foreground">{cycle.poolName}</h4>
                      <p className="font-mono text-xs text-muted-foreground mt-1">{cycle.members} members</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 w-full md:w-auto md:justify-end">
                    <div className="flex flex-col text-left md:text-right gap-1 flex-1 md:flex-none">
                      <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Billing Date</span>
                      <span className="font-mono font-medium text-sm">{cycle.billingDate}</span>
                    </div>
                    <div className="flex flex-col text-left md:text-right gap-1 flex-1 md:flex-none">
                      <span className="font-mono text-[10px] text-success uppercase tracking-wider">Collected</span>
                      <span className="font-mono font-bold text-sm text-foreground">${cycle.collected.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col text-left md:text-right gap-1 flex-1 md:flex-none">
                      <span className="font-mono text-[10px] text-warning uppercase tracking-wider">Outstanding</span>
                      <span className="font-mono font-bold text-sm text-warning">${cycle.outstanding.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-muted/50 bg-transparent">
            <CardContent className="p-8 text-center">
              <p className="font-mono text-xs text-muted-foreground">No active billing cycles found for this month.</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Upcoming */}
      <section className="space-y-4 pt-4">
        <h2 className="font-display font-bold text-2xl text-foreground">Upcoming Charges</h2>
        <Card className="border-border">
          {summary.upcoming.length > 0 ? (
            <div className="divide-y divide-border">
              {summary.upcoming.map((item, idx) => (
                <div key={idx} className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <Badge variant="secondary" className="font-mono w-[100px] justify-center bg-secondary font-medium shrink-0">
                    {item.date}
                  </Badge>
                  <div className="flex-1">
                    <span className="font-display font-semibold text-foreground">{item.pool}</span>
                  </div>
                  <div className="font-mono font-bold text-sm text-primary">
                    ${item.amount.toFixed(2)} expected
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <CardContent className="p-8 text-center text-muted-foreground font-mono text-xs">
              No upcoming charges.
            </CardContent>
          )}
        </Card>
      </section>
    </div>
  );
}
