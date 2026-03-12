// ─── LedgerPage ────────────────────────────────────────────────────────────────
// Financial ledger with dual-section table, stats row, filter chips,
// and optimistic mark-as-paid updates.

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
import { formatPrice, formatDate } from '../../lib/constants';
import { useLedger } from '../../lib/supabase/hooks';
import { markLedgerPaid } from '../../lib/supabase/mutations';
import type { LedgerEntry } from '../../lib/types';
import { Insight, useDemo } from '../components/demo-mode';
import { useMagneticButton } from '../../hooks/useMagneticButton';
import { celebrate } from '../../lib/confetti';

// ─── Filter type ──────────────────────────────────────────────────────────────

type LedgerFilter = 'all' | 'owed' | 'paid';

// ─── Component ────────────────────────────────────────────────────────────────

export function Ledger() {
  const [filter, setFilter] = useState<LedgerFilter>('all');
  const [iOwePage, setIOwePage] = useState(1);
  const [owedPage, setOwedPage] = useState(1);
  const PAGE_SIZE = 10;
  const { data: entries, loading, refetch } = useLedger();
  const { isDemo } = useDemo();

  const handleMarkPaid = async (id: string) => {
    try {
      await markLedgerPaid(id);
      refetch();
      celebrate('full', isDemo);
    } catch (e) {
      console.error(e);
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

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val}"`).join(','))
    ].join('\n');

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
  const iOwe = useMemo(
    () => entries.filter((e) => e.type === 'payment'),
    [entries],
  );
  const owedToMe = useMemo(
    () => entries.filter((e) => e.type === 'payout'),
    [entries],
  );

  // Computed stats
  const totalOwedToMe = useMemo(
    () =>
      owedToMe
        .filter((e) => e.status === 'owed' || e.status === 'pending' || e.status === 'overdue')
        .reduce((sum, e) => sum + e.amount_cents, 0),
    [owedToMe],
  );

  const totalCollected = useMemo(
    () =>
      owedToMe
        .filter((e) => e.status === 'paid')
        .reduce((sum, e) => sum + e.amount_cents, 0),
    [owedToMe],
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
    if (filter === 'all') return list;
    if (filter === 'paid') return list.filter((e) => e.status === 'paid');
    // 'owed' shows owed + pending + overdue
    return list.filter((e) => e.status !== 'paid');
  };

  const filteredIOwe = filterEntries(iOwe);
  const filteredOwedToMe = filterEntries(owedToMe);

  // Pagination
  const iOwePages = Math.ceil(filteredIOwe.length / PAGE_SIZE);
  const owedPages = Math.ceil(filteredOwedToMe.length / PAGE_SIZE);
  const pagedIOwe = filteredIOwe.slice((iOwePage - 1) * PAGE_SIZE, iOwePage * PAGE_SIZE);
  const pagedOwedToMe = filteredOwedToMe.slice((owedPage - 1) * PAGE_SIZE, owedPage * PAGE_SIZE);

  // Reset page when filter changes
  useMemo(() => { setIOwePage(1); setOwedPage(1); }, [filter]);

  // ─── Magnetic Button Component ──────────────────────────────────────────

  function MagneticPayButton({ entry, onClick, isDemo }: { entry: LedgerEntry, onClick: () => void, isDemo: boolean }) {
    const { ref, style } = useMagneticButton(0.3, isDemo);
    return (
      <div ref={ref} style={style} className="inline-block relative">
        <Button
          size="sm"
          onClick={onClick}
          className="md:w-auto w-[68px] md:h-9 h-8 p-0 md:px-3 text-[11px] md:text-sm font-display font-semibold transition-transform"
        >
          <span className="hidden md:inline">Pay {formatPrice(entry.amount_cents)}</span>
          <span className="md:hidden pr-1">Pay</span>
        </Button>
      </div>
    );
  }

  // ─── Render Row ──────────────────────────────────────────────────────────

  const renderRow = (entry: LedgerEntry, section: 'iOwe' | 'owedToMe') => {
    const isUnpaid = entry.status !== 'paid';
    return (
      <TableRow
        key={entry.id}
        className={isUnpaid && section === 'iOwe' ? 'bg-[rgba(255,77,77,0.03)]' : ''}
      >
        {/* Platform + Pool */}
        <TableCell className="px-5">
          <div className="flex items-center gap-2">
            <PlatformIcon platformId={entry.platform} size="sm" />
            <span className="text-sm">
              {entry.pool_name}
            </span>
          </div>
        </TableCell>

        {/* Member/Owner name */}
        <TableCell className="px-5">
          <span className="font-display text-sm">{entry.counterparty_name}</span>
        </TableCell>

        {/* Amount */}
        <TableCell className="px-5">
          <span className="font-mono font-medium">{formatPrice(entry.amount_cents)}</span>
        </TableCell>

        {/* Due date */}
        <TableCell className="px-5">
          <span className="font-mono text-sm">{formatDate(entry.due_at)}</span>
        </TableCell>

        {/* Status */}
        <TableCell className="px-5">
          <StatusPill status={entry.status as 'owed' | 'paid' | 'pending' | 'overdue'} />
        </TableCell>

        {/* Action */}
        <TableCell className="px-5">
          {entry.status === 'paid' ? (
            <span className="font-mono text-[11px] text-muted-foreground whitespace-nowrap">✓ settled</span>
          ) : section === 'owedToMe' ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.info('Reminder sent')}
              className="md:w-auto w-9 md:h-9 h-8 p-0 md:px-3"
            >
              <span className="hidden md:inline">Remind</span>
              <span className="md:hidden" role="img" aria-label="Notification">🔔</span>
            </Button>
          ) : (
            <MagneticPayButton entry={entry} onClick={() => handleMarkPaid(entry.id)} isDemo={isDemo} />
          )}
        </TableCell>
      </TableRow>
    );
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              label="OWED TO YOU"
              value={formatPrice(totalOwedToMe)}
              accentTop
            />
            <StatCard
              label="COLLECTED"
              value={formatPrice(totalCollected)}
              subVariant="success"
            />
            <StatCard
              label="COLLECTION RATE"
              value={collectionRate}
            />
          </>
        )}
      </div>

      {/* Filter Chips & Export */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['all', 'owed', 'paid'] as LedgerFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                px-3.5 py-1.5 rounded-full font-mono text-xs lowercase transition-all cursor-pointer
                ${filter === f
                  ? 'border border-primary bg-primary/10 text-primary'
                  : 'border border-border text-muted-foreground hover:border-muted-foreground'
                }
              `}
            >
              {f}
            </button>
          ))}
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handleExportCSV}
          disabled={loading || entries.length === 0}
          className="font-mono text-xs h-8"
        >
          ↓ Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card border rounded-[6px] overflow-x-auto relative">
        <Insight id="ledger-table" activeStep={8} className="top-10 left-1/2 -translate-x-1/2" />
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow>
              <TableHead className="px-5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Pool
              </TableHead>
              <TableHead className="px-5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Member
              </TableHead>
              <TableHead className="px-5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Amount
              </TableHead>
              <TableHead className="px-5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Due Date
              </TableHead>
              <TableHead className="px-5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="px-5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* Section: Payments I Owe */}
            <TableRow className="hover:bg-transparent border-0">
              <TableCell
                colSpan={6}
                className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground bg-background px-5 py-2"
              >
                Payments I Owe
              </TableCell>
            </TableRow>
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6} className="p-0">
                    <TableRowSkeleton cells={6} />
                  </TableCell>
                </TableRow>
              ))
            ) : pagedIOwe.length > 0 ? (
              pagedIOwe.map((e) => renderRow(e, 'iOwe'))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <EmptyState
                    icon="💸"
                    title="No payments pending"
                    description="You're all settled up! No payments currently owe to others."
                  />
                </TableCell>
              </TableRow>
            )}

            {/* Section: Payments Owed To Me */}
            <TableRow className="hover:bg-transparent border-0">
              <TableCell
                colSpan={6}
                className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground bg-background px-5 py-2"
              >
                Payments Owed To Me
              </TableCell>
            </TableRow>
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6} className="p-0">
                    <TableRowSkeleton cells={6} />
                  </TableCell>
                </TableRow>
              ))
            ) : pagedOwedToMe.length > 0 ? (
              pagedOwedToMe.map((e) => renderRow(e, 'owedToMe'))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <EmptyState
                    icon="💰"
                    title="No income yet"
                    description="When members pay for your pools, they'll show up here."
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>

          {/* Footer: Net Position */}
          <TableFooter className="border-t border-border">
            <TableRow className="border-b border-border">
              <TableCell colSpan={4} className="px-5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Lifetime Savings Created
              </TableCell>
              <TableCell colSpan={2} className="px-5 text-right font-display font-bold text-[15px] text-[#4DFF91]">
                + $341.00
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                colSpan={4}
                className="px-5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
              >
                Net Position This Cycle
              </TableCell>
              <TableCell colSpan={2} className="px-5 text-right">
                <span
                  className={`font-display font-bold text-base ${netPosition >= 0 ? 'text-[#4DFF91]' : 'text-[#FF4D4D]'
                    }`}
                >
                  {netPosition >= 0 ? '+' : '-'}
                  {formatPrice(Math.abs(netPosition))}
                </span>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      {/* Pagination Controls */}
      {(iOwePages > 1 || owedPages > 1) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          {iOwePages > 1 && (
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-muted-foreground uppercase">I Owe:</span>
              <Button variant="outline" size="sm" onClick={() => setIOwePage(p => Math.max(1, p - 1))} disabled={iOwePage === 1} className="h-7 text-xs px-2" aria-label="Previous page of payments I owe">←</Button>
              <span className="font-mono text-[11px] text-muted-foreground">{iOwePage}/{iOwePages}</span>
              <Button variant="outline" size="sm" onClick={() => setIOwePage(p => Math.min(iOwePages, p + 1))} disabled={iOwePage === iOwePages} className="h-7 text-xs px-2" aria-label="Next page of payments I owe">→</Button>
            </div>
          )}
          {owedPages > 1 && (
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-muted-foreground uppercase">Owed to me:</span>
              <Button variant="outline" size="sm" onClick={() => setOwedPage(p => Math.max(1, p - 1))} disabled={owedPage === 1} className="h-7 text-xs px-2" aria-label="Previous page of payments owed to me">←</Button>
              <span className="font-mono text-[11px] text-muted-foreground">{owedPage}/{owedPages}</span>
              <Button variant="outline" size="sm" onClick={() => setOwedPage(p => Math.min(owedPages, p + 1))} disabled={owedPage === owedPages} className="h-7 text-xs px-2" aria-label="Next page of payments owed to me">→</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}