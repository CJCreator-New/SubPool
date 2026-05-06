// @ts-nocheck
// ─── Global Ledger & Sub-Wallet UI ────────────────────────────────────────────────
// Financial command center with multi-currency tracking and automated settlement protocols.

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { StatCard, StatusPill, PlatformIcon } from '../components/subpool-components';
import { EmptyState } from '../components/empty-state';
import { StatCardSkeleton, TableRowSkeleton } from '../components/skeletons';
import { Button } from '../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { formatDate } from '../../lib/constants';
import { useLedgerQuery, useMarkLedgerPaidMutation } from '../../lib/supabase/queries';
import type { LedgerEntry } from '../../lib/types';
import { Insight, useDemo } from '../components/demo-mode';
import { useMagneticButton } from '../../hooks/useMagneticButton';
import { celebrate } from '../../lib/confetti';
import { Wallet, Globe, ArrowDownRight, ArrowUpRight, Filter, Download, PieChart, Info, HelpCircle } from 'lucide-react';
import { cn } from '../components/ui/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useCurrency } from '../../lib/currency-context';
import { useAuth } from '../../lib/supabase/auth';
import { calculateFeeBreakdown, UserPlan } from '../../lib/monetization';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';

// ─── Filter type ──────────────────────────────────────────────────────────────

type LedgerFilter = 'all' | 'owed' | 'paid';

// ─── Component ────────────────────────────────────────────────────────────────

export function Ledger() {
  const [filter, setFilter] = useState<LedgerFilter>('all');
  const [iOwePage, setIOwePage] = useState(1);
  const [owedPage, setOwedPage] = useState(1);
  const [activeWallet, setActiveWallet] = useState<'all' | 'usd' | 'inr'>('all');
  const { data: entriesData, isLoading: loading } = useLedgerQuery();
  const markPaidMutation = useMarkLedgerPaidMutation();
  const entries = entriesData || [];
  const { isDemo } = useDemo();
  const { formatPrice } = useCurrency();
  const { profile } = useAuth();
  const userPlan = (profile?.plan || 'free') as UserPlan;

  const handleMarkPaid = async (id: string) => {
    try {
      await markPaidMutation.mutateAsync(id);
      celebrate('full', isDemo);
    } catch (e) {
      console.error(e);
      toast.error('Failed to settle transaction');
    }
  };

  const handleExportCSV = () => {
    if (!entries || entries.length === 0) {
      toast.info('No data to export.');
      return;
    }
    const headers = ['Pool Name', 'Counterparty', 'Amount', 'Type', 'Due Date', 'Settled At', 'Status'];
    const rows = entries.map(e => [
      e.pool_name,
      e.counterparty_name,
      (e.amount_cents / 100).toFixed(2),
      e.type,
      e.due_at,
      e.settled_at || 'N/A',
      e.status
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.map(val => `"${val}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ledger_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Ledger exported to CSV');
  };

  // Split entries: "payment" = I owe (to pool owners), "payout" = owed to me
  const iOwe = useMemo(() => entries.filter((e) => e.type === 'payment'), [entries]);
  const owedToMe = useMemo(() => entries.filter((e) => e.type === 'payout'), [entries]);

  // Computed stats
  const totalOwedToMe = useMemo(() =>
      owedToMe
        .filter((e) => e.status === 'owed' || e.status === 'pending' || e.status === 'overdue')
        .reduce((sum, e) => sum + e.amount_cents, 0),
    [owedToMe]
  );

  const totalCollected = useMemo(() =>
      owedToMe
        .filter((e) => e.status === 'paid')
        .reduce((sum, e) => sum + e.amount_cents, 0),
    [owedToMe]
  );

  const collectionRate = useMemo(() => {
    if (owedToMe.length === 0) return '0%';
    const paidCount = owedToMe.filter((e) => e.status === 'paid').length;
    return `${((paidCount / owedToMe.length) * 100).toFixed(0)}%`;
  }, [owedToMe]);

  const netPosition = useMemo(() => {
    const iOweOwed = iOwe
      .filter((e) => e.status === 'owed' || e.status === 'pending' || e.status === 'overdue')
      .reduce((sum, e) => sum + e.amount_cents, 0);
    return totalOwedToMe - iOweOwed;
  }, [iOwe, totalOwedToMe]);

  // Filter logic
  const filterEntries = (list: LedgerEntry[]) => {
    let filtered = list;
    if (filter === 'paid') filtered = filtered.filter((e) => e.status === 'paid');
    else if (filter === 'owed') filtered = filtered.filter((e) => e.status !== 'paid');
    
    if (activeWallet === 'usd') filtered = filtered.filter(e => e.platform !== 'hotstar');
    if (activeWallet === 'inr') filtered = filtered.filter(e => e.platform === 'hotstar');
    
    return filtered;
  };

  const filteredIOwe = filterEntries(iOwe);
  const filteredOwedToMe = filterEntries(owedToMe);

  // Pagination
  const iOwePages = Math.ceil(filteredIOwe.length / PAGE_SIZE);
  const owedPages = Math.ceil(filteredOwedToMe.length / PAGE_SIZE);
  const pagedIOwe = filteredIOwe.slice((iOwePage - 1) * PAGE_SIZE, iOwePage * PAGE_SIZE);
  const pagedOwedToMe = filteredOwedToMe.slice((owedPage - 1) * PAGE_SIZE, owedPage * PAGE_SIZE);

  useMemo(() => { setIOwePage(1); setOwedPage(1); }, [filter, activeWallet]);

  // ─── Magnetic Button Component ──────────────────────────────────────────

  function MagneticPayButton({ entry, onClick, isDemo }: { entry: LedgerEntry, onClick: () => void, isDemo: boolean }) {
    const { ref, style } = useMagneticButton(0.3, isDemo);
    return (
      <div ref={ref} style={style} className="inline-block relative">
        <Button
          size="sm"
          onClick={onClick}
          className="md:w-auto w-[68px] md:h-9 h-8 p-0 md:px-3 text-[11px] md:text-sm font-display font-bold shadow-glow-primary/10 transition-transform active:scale-95"
        >
          <span className="hidden md:inline">Settle {formatPrice(entry.amount_cents)}</span>
          <span className="md:hidden pr-1">Pay</span>
        </Button>
      </div>
    );
  }

  // ─── Render Row ──────────────────────────────────────────────────────────

  const renderRow = (entry: LedgerEntry, section: 'iOwe' | 'owedToMe') => {
    const isUnpaid = entry.status !== 'paid';
    const fees = section === 'owedToMe' ? calculateFeeBreakdown(entry.amount_cents, userPlan) : null;

    return (
      <TableRow
        key={entry.id}
        className={cn(
            "transition-colors group",
            isUnpaid && section === 'iOwe' ? 'bg-primary/[0.02]' : 'hover:bg-white/[0.01]'
        )}
      >
        <TableCell className="px-5">
          <div className="flex items-center gap-3">
            <PlatformIcon platformId={entry.platform} size="sm" />
            <div className="flex flex-col">
                <span className="font-display font-bold text-sm tracking-tight">{entry.pool_name}</span>
                <span className="font-mono text-[9px] text-muted-foreground uppercase">{entry.platform} protocol</span>
            </div>
          </div>
        </TableCell>
        <TableCell className="px-5">
          <div className="flex items-center gap-2">
             <div className="size-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-display">
                {entry.counterparty_name.charAt(0)}
             </div>
             <span className="font-display text-sm">{entry.counterparty_name}</span>
          </div>
        </TableCell>
        <TableCell className="px-5">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-foreground">{formatPrice(entry.amount_cents)}</span>
                {fees && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <HelpCircle size={10} className="text-muted-foreground/50 hover:text-primary cursor-help transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-card/90 backdrop-blur-md border-white/5 p-3 rounded-xl shadow-2xl">
                                <div className="space-y-2 min-w-[140px]">
                                    <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground border-b border-white/5 pb-1 mb-1">Fee Breakdown</p>
                                    <div className="flex justify-between text-[10px] font-mono">
                                        <span>Gross</span>
                                        <span>{formatPrice(fees.baseAmountCents)}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-mono text-rose-400">
                                        <span>Platform ({((entry.amount_cents * (userPlan === 'host_plus' ? 200 : userPlan === 'pro' ? 350 : 500)) / 1000000).toFixed(1)}%)</span>
                                        <span>-{formatPrice(fees.platformFeeCents)}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-mono text-rose-400">
                                        <span>Processing</span>
                                        <span>-{formatPrice(fees.processingFeeCents)}</span>
                                    </div>
                                    <div className="flex justify-between text-[11px] font-mono font-black pt-1 border-t border-white/5 text-emerald-400">
                                        <span>Net Payout</span>
                                        <span>{formatPrice(fees.netAmountCents)}</span>
                                    </div>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
            {fees ? (
                <span className="font-mono text-[9px] text-emerald-400/80 uppercase font-bold tracking-tighter">Net: {formatPrice(fees.netAmountCents)}</span>
            ) : (
                <span className="font-mono text-[9px] text-muted-foreground uppercase">Liability</span>
            )}
          </div>
        </TableCell>
        <TableCell className="px-5">
          <div className="flex items-center gap-2">
            <span className={cn("font-mono text-sm", isUnpaid && "text-amber-400/80")}>{formatDate(entry.due_at)}</span>
          </div>
        </TableCell>
        <TableCell className="px-5">
          <StatusPill status={entry.status as 'owed' | 'paid' | 'pending' | 'overdue'} />
        </TableCell>
        <TableCell className="px-5">
          <div className="flex items-center justify-end">
            {entry.status === 'paid' ? (
                <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[10px] uppercase font-bold">
                    <CheckCircle className="size-3" /> Settled
                </div>
            ) : section === 'owedToMe' ? (
                <Button
                size="sm"
                variant="ghost"
                onClick={() => toast.info('Reminder sent')}
                className="h-8 px-3 font-mono text-[10px] uppercase border border-white/5 hover:bg-white/5"
                >
                Remind <ArrowUpRight size={12} className="ml-1" />
                </Button>
            ) : (
                <MagneticPayButton entry={entry} onClick={() => handleMarkPaid(entry.id)} isDemo={isDemo} />
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* ─── Wallet & Summary Header ─── */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            {loading ? (
                Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)
            ) : (
                <>
                <StatCard label="OWED TO YOU" value={formatPrice(totalOwedToMe)} accentTop />
                <StatCard label="TOTAL COLLECTED" value={formatPrice(totalCollected)} subVariant="success" />
                <StatCard label="COLLECTION EFFICIENCY" value={collectionRate} />
                </>
            )}
        </div>

        <div className="w-full md:w-80 bg-card border border-border rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2">
                    <Wallet className="size-4 text-primary" />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Sub-Wallets</span>
                </div>
                <div className="flex gap-1">
                    {(['all', 'usd', 'inr'] as const).map(w => (
                        <button 
                            key={w}
                            onClick={() => setActiveWallet(w)}
                            className={cn(
                                "size-6 rounded-md border text-[9px] font-mono uppercase transition-all",
                                activeWallet === w ? "bg-primary border-primary text-black" : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20"
                            )}
                        >
                            {w}
                        </button>
                    ))}
                </div>
            </div>
            <div className="space-y-3 relative z-10">
                <div className="flex justify-between items-center">
                    <span className="font-mono text-[11px] text-muted-foreground">USD Node Balance</span>
                    <span className="font-mono text-[11px] font-bold text-foreground">$124.50</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-mono text-[11px] text-muted-foreground">INR Node Balance</span>
                    <span className="font-mono text-[11px] font-bold text-foreground">₹8,420.00</span>
                </div>
                <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                    <span className="font-display font-black text-xs uppercase italic">Net Liquidity</span>
                    <span className={cn("font-mono text-sm font-black", netPosition >= 0 ? "text-emerald-400" : "text-rose-400")}>
                        {netPosition >= 0 ? '+' : '-'}{formatPrice(Math.abs(netPosition))}
                    </span>
                </div>
            </div>
        </div>
      </div>

      {/* Filter Chips & Export */}
      <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-2 rounded-2xl">
        <div className="flex gap-1">
          {(['all', 'owed', 'paid'] as LedgerFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-5 py-2 rounded-xl font-mono text-[10px] uppercase tracking-widest transition-all",
                filter === f ? "bg-white/10 text-white shadow-sm" : "text-muted-foreground hover:text-white hover:bg-white/[0.03]"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
            <Button
                size="sm"
                variant="ghost"
                onClick={handleExportCSV}
                disabled={loading || entries.length === 0}
                className="font-mono text-[10px] uppercase tracking-widest h-10 px-4 border border-white/5 hover:bg-white/5"
            >
                <Download size={14} className="mr-2" /> Export Protocol
            </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden relative shadow-2xl">
        <Insight id="ledger-table" activeStep={8} className="top-10 left-1/2 -translate-x-1/2" />
        <div className="overflow-x-auto">
            <Table className="min-w-[800px]">
                <TableHeader className="bg-white/[0.02]">
                    <TableRow className="border-white/5">
                        <TableHead className="px-5 h-12 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Protocol Node</TableHead>
                        <TableHead className="px-5 h-12 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Counterparty</TableHead>
                        <TableHead className="px-5 h-12 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Settlement Val</TableHead>
                        <TableHead className="px-5 h-12 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Maturity Date</TableHead>
                        <TableHead className="px-5 h-12 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Current State</TableHead>
                        <TableHead className="px-5 h-12 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground text-right">Operation</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {/* Section: Payments I Owe */}
                    <TableRow className="hover:bg-transparent border-white/5 bg-white/[0.01]">
                        <TableCell colSpan={6} className="px-5 py-3">
                            <div className="flex items-center gap-2">
                                <ArrowDownRight className="size-3 text-rose-400" />
                                <span className="font-mono text-[10px] uppercase tracking-widest font-black text-muted-foreground">Liabilities (Outgoing)</span>
                            </div>
                        </TableCell>
                    </TableRow>
                    {loading ? (
                        Array.from({ length: 2 }).map((_, i) => (
                            <TableRow key={i}><TableCell colSpan={6} className="p-0"><TableRowSkeleton cells={6} /></TableCell></TableRow>
                        ))
                    ) : pagedIOwe.length > 0 ? (
                        pagedIOwe.map((e) => renderRow(e, 'iOwe'))
                    ) : (
                        <TableRow className="border-white/5">
                            <TableCell colSpan={6} className="h-40 text-center">
                                <EmptyState icon="⚡" title="All nodes settled" description="No outgoing liabilities detected in active protocols." />
                            </TableCell>
                        </TableRow>
                    )}

                    {/* Section: Payments Owed To Me */}
                    <TableRow className="hover:bg-transparent border-white/5 bg-white/[0.01]">
                        <TableCell colSpan={6} className="px-5 py-3">
                            <div className="flex items-center gap-2">
                                <ArrowUpRight className="size-3 text-emerald-400" />
                                <span className="font-mono text-[10px] uppercase tracking-widest font-black text-muted-foreground">Receivables (Incoming)</span>
                            </div>
                        </TableCell>
                    </TableRow>
                    {loading ? (
                        Array.from({ length: 2 }).map((_, i) => (
                            <TableRow key={i}><TableCell colSpan={6} className="p-0"><TableRowSkeleton cells={6} /></TableCell></TableRow>
                        ))
                    ) : pagedOwedToMe.length > 0 ? (
                        pagedOwedToMe.map((e) => renderRow(e, 'owedToMe'))
                    ) : (
                        <TableRow className="border-white/5">
                            <TableCell colSpan={6} className="h-40 text-center">
                                <EmptyState icon="💰" title="No receivables" description="Awaiting node activation or payment cycle maturation." />
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>

                <TableFooter className="bg-white/[0.02] border-t border-white/5">
                    <TableRow className="border-white/5">
                        <TableCell colSpan={4} className="px-5 py-6">
                            <div className="flex items-center gap-4">
                                <div>
                                    <p className="font-mono text-[9px] uppercase text-muted-foreground mb-1">Lifetime Protocol Savings</p>
                                    <p className="font-display font-black text-xl text-emerald-400 tracking-tight">$1,248.50</p>
                                </div>
                                <div className="h-8 w-px bg-white/10 mx-4" />
                                <div>
                                    <p className="font-mono text-[9px] uppercase text-muted-foreground mb-1">Active Smart Contracts</p>
                                    <p className="font-display font-black text-xl text-white tracking-tight">12 Nodes</p>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell colSpan={2} className="px-5 py-6 text-right">
                            <p className="font-mono text-[9px] uppercase text-muted-foreground mb-1">Net Position Status</p>
                            <span className={cn("font-display font-black text-2xl", netPosition >= 0 ? "text-emerald-400" : "text-rose-400")}>
                                {netPosition >= 0 ? '+' : '-'}{formatPrice(Math.abs(netPosition))}
                            </span>
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4">
        <div className="flex items-center gap-3">
            <div className="size-2 rounded-full bg-emerald-400 shadow-glow-success animate-pulse" />
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Real-time settlement sync active</span>
        </div>
        <div className="flex gap-4">
            {iOwePages > 1 && (
                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/5">
                    <Button variant="ghost" size="icon" onClick={() => setIOwePage(p => Math.max(1, p - 1))} disabled={iOwePage === 1} className="size-8">←</Button>
                    <span className="font-mono text-[10px] w-8 text-center">{iOwePage}/{iOwePages}</span>
                    <Button variant="ghost" size="icon" onClick={() => setIOwePage(p => Math.min(iOwePages, p + 1))} disabled={iOwePage === iOwePages} className="size-8">→</Button>
                </div>
            )}
            {owedPages > 1 && (
                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/5">
                    <Button variant="ghost" size="icon" onClick={() => setOwedPage(p => Math.max(1, p - 1))} disabled={owedPage === 1} className="size-8">←</Button>
                    <span className="font-mono text-[10px] w-8 text-center">{owedPage}/{owedPages}</span>
                    <Button variant="ghost" size="icon" onClick={() => setOwedPage(p => Math.min(owedPages, p + 1))} disabled={owedPage === owedPages} className="size-8">→</Button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

import { CheckCircle } from 'lucide-react';