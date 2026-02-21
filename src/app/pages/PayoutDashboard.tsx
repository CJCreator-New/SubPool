import { useState } from 'react';
import { Wallet, Download, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { StatCard } from '../components/subpool-components';
import { toast } from 'sonner';
import { cn } from '../components/ui/utils';

// ─── Local status pill ────────────────────────────────────────────────────────

function PayoutStatusBadge({ status }: { status: 'paid out' | 'pending' | 'processing' }) {
  const variants: Record<string, string> = {
    'paid out': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    'pending': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    'processing': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  };

  return (
    <Badge variant="outline" className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border ${variants[status]}`}>
      {status}
    </Badge>
  );
}

// ─── Withdraw Modal Component ─────────────────────────────────────────────────

function WithdrawModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<'confirm' | 'done'>('confirm');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <Card className="relative w-full max-w-[440px] border-border bg-card shadow-2xl">
        {step === 'confirm' ? (
          <>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4 mb-2">
                <div className="size-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Wallet size={20} />
                </div>
                <div>
                  <CardTitle className="text-xl font-display font-bold">Request Payout</CardTitle>
                  <CardDescription className="font-mono text-xs">
                    ACH Direct Deposit · Chase ••••6789
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border border-border bg-secondary/30 overflow-hidden">
                {[
                  { label: 'Available balance', value: '$18.43' },
                  { label: 'SubPool fee (5%)', value: '−$0.92' },
                  { label: 'You receive', value: '$17.51', highlight: true },
                ].map((row, idx) => (
                  <div key={idx} className={cn(
                    "flex justify-between items-center px-5 py-3.5",
                    idx < 2 && "border-b border-border"
                  )}>
                    <span className="font-mono text-xs text-muted-foreground">{row.label}</span>
                    <span className={cn(
                      "font-display font-bold",
                      row.highlight ? "text-lg text-primary" : "text-sm text-foreground"
                    )}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              <p className="font-mono text-[10px] text-muted-foreground leading-relaxed px-1">
                Funds arrive within 1–3 business days via ACH. Processing begins immediately.
              </p>

              <div className="flex gap-3 pt-2">
                <Button className="flex-1 font-bold" onClick={() => setStep('done')}>
                  Confirm Withdrawal
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="pt-10 pb-8 text-center space-y-4">
            <div className="size-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mx-auto text-primary">
              <CheckCircle2 size={32} />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-display font-black">Payout Requested!</CardTitle>
              <CardDescription className="font-mono text-sm max-w-[280px] mx-auto">
                $17.51 will arrive in your Chase account within 1–3 business days.
              </CardDescription>
            </div>
            <Button className="w-full mt-4" onClick={onClose}>
              Done
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// ─── Main Dashboard Component ───────────────────────────────────────────────

export function PayoutDashboard() {
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showChangePayout, setShowChangePayout] = useState(false);

  const historyData = [
    { month: 'FEB 2026', pools: 3, gross: '$29.97', fee: '$1.50', net: '$28.47', status: 'pending' as const },
    { month: 'JAN 2026', pools: 3, gross: '$29.97', fee: '$1.50', net: '$28.47', status: 'paid out' as const },
    { month: 'DEC 2025', pools: 2, gross: '$19.98', fee: '$1.00', net: '$18.98', status: 'paid out' as const },
    { month: 'NOV 2025', pools: 2, gross: '$19.98', fee: '$1.00', net: '$18.98', status: 'paid out' as const },
    { month: 'OCT 2025', pools: 1, gross: '$9.99', fee: '$0.50', net: '$9.49', status: 'paid out' as const },
    { month: 'SEP 2025', pools: 1, gross: '$9.99', fee: '$0.50', net: '$9.49', status: 'paid out' as const },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1.5">
          <h1 className="text-4xl font-display font-black tracking-tight text-foreground">
            Earnings
          </h1>
          <p className="font-mono text-sm text-muted-foreground">
            Track your pool income and payouts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="gap-2 font-semibold"
            onClick={() => toast.success('Earnings report exported as CSV ✓')}
          >
            <Download size={14} className="text-muted-foreground" />
            Export CSV
          </Button>
          <Button
            className="gap-2 font-bold shadow-lg shadow-primary/20"
            onClick={() => setShowWithdraw(true)}
          >
            <Wallet size={14} />
            Withdraw $18.43
          </Button>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          label="THIS MONTH"
          value="$28.47"
          sub="from 3 pools"
        />
        <StatCard
          label="TOTAL EARNED"
          value="$341.20"
          sub="since Jan 2025"
          subVariant="success"
        />
        <StatCard
          label="PENDING PAYOUT"
          value="$18.43"
          sub="processes Feb 28"
          subVariant="danger"
        />
      </div>

      {/* Insights Banner */}
      <Card className="border-primary/20 bg-primary/5 shadow-inner">
        <CardContent className="flex items-center gap-5 p-6">
          <div className="size-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <TrendingUp size={20} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-display font-bold text-base text-foreground">
              Earnings up 42% this quarter
            </h4>
            <p className="font-mono text-xs text-muted-foreground truncate">
              Adding 1 more pool member would boost monthly income by ~$10.
            </p>
          </div>
          {/* Tiny Sparkline */}
          <div className="hidden sm:flex items-end gap-1 px-4">
            {[30, 45, 38, 52, 48, 70].map((h, i) => (
              <div
                key={i}
                className={cn(
                  "w-1.5 rounded-t-full transition-all duration-500",
                  i === 5 ? "bg-primary" : "bg-primary/20"
                )}
                style={{ height: `${h * 0.6}px` }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payout Method Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-display font-bold px-1">Payout Method</h3>
        <Card className="border-border hover:bg-secondary/10 transition-colors">
          <CardContent className="flex items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full border border-border bg-background flex items-center justify-center shrink-0">
                <Wallet size={24} className="text-primary" />
              </div>
              <div className="space-y-1">
                <p className="font-display font-bold text-foreground">Chase Bank Checking</p>
                <p className="font-mono text-xs text-muted-foreground">••••6789 · ACH Direct Deposit</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-500 bg-emerald-500/5 gap-1.5 px-3 py-1">
                <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-[10px] tracking-wide">VERIFIED</span>
              </Badge>
              <Button variant="ghost" size="sm" className="text-primary font-bold hover:text-primary hover:bg-primary/10" onClick={() => setShowChangePayout(true)}>
                Change
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Transfer Alert */}
      <div className="flex items-center gap-3 px-5 py-4 border border-amber-500/20 bg-amber-500/5 rounded-lg">
        <Clock size={16} className="text-amber-500 shrink-0" />
        <p className="font-mono text-xs text-amber-500/90 leading-relaxed">
          Next scheduled payout: <span className="text-amber-500 font-bold underline underline-offset-4">Feb 28, 2026</span> — $18.43 will be transferred automatically.
        </p>
      </div>

      {/* History Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-display font-bold px-1">Payout History</h3>
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border">
                <TableHead className="font-mono text-[10px] tracking-widest uppercase py-4 pl-6">Month</TableHead>
                <TableHead className="font-mono text-[10px] tracking-widest uppercase">Pools</TableHead>
                <TableHead className="font-mono text-[10px] tracking-widest uppercase">Gross</TableHead>
                <TableHead className="font-mono text-[10px] tracking-widest uppercase">Fee</TableHead>
                <TableHead className="font-mono text-[10px] tracking-widest uppercase">Net</TableHead>
                <TableHead className="font-mono text-[10px] tracking-widest uppercase pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyData.map((row, i) => (
                <TableRow key={i} className={cn(
                  "border-border group transition-colors",
                  i === 0 ? "bg-amber-500/[0.03] hover:bg-amber-500/[0.05]" : "hover:bg-muted/50"
                )}>
                  <TableCell className={cn(
                    "font-mono text-sm py-5 pl-6",
                    i === 0 ? "text-amber-500 font-bold" : "text-foreground font-medium"
                  )}>
                    {row.month}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">{row.pools}</TableCell>
                  <TableCell className="font-mono text-sm font-medium">{row.gross}</TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">{row.fee}</TableCell>
                  <TableCell className={cn(
                    "font-mono text-sm font-bold",
                    i === 0 ? "text-amber-500" : "text-primary"
                  )}>
                    {row.net}
                  </TableCell>
                  <TableCell className="pr-6">
                    <PayoutStatusBadge status={row.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modals */}
      {showWithdraw && <WithdrawModal onClose={() => setShowWithdraw(false)} />}

      {showChangePayout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowChangePayout(false)} />
          <Card className="relative w-full max-w-[400px] border-border bg-card shadow-2xl overflow-hidden">
            <CardHeader className="pt-8 pb-4 px-8">
              <CardTitle className="text-xl font-display font-bold">Change Payout Method</CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-6">
              <p className="font-mono text-sm text-muted-foreground leading-relaxed">
                Security check: To change your bank account, please contact support or verify via your registered email.
              </p>
              <Button className="w-full font-bold" onClick={() => setShowChangePayout(false)}>
                Got it
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
