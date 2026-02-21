// ─── MyPools Page ──────────────────────────────────────────────────────────────
// Owned pools grid + memberships table with payment actions.

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { StatCard, PoolCard, StatusPill, PlatformIcon } from '../components/subpool-components';
import { Button } from '../components/ui/button';
import { EmptyState } from '../components/empty-state';
import { PoolCardSkeleton, StatCardSkeleton, TableRowSkeleton } from '../components/skeletons';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../components/ui/table';
import { cn } from '../components/ui/utils';
import { usePools, useMemberships } from '../../lib/supabase/hooks';
import { useAuth } from '../../lib/supabase/auth';
import { getPlatform, formatPrice, formatDate } from '../../lib/constants';
import type { Pool, Membership } from '../../lib/types';

// ─── Toast helper ─────────────────────────────────────────────────────────────

function useToast() {
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  });

  const show = (msg: string) => {
    setToast({ message: msg, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3500);
  };

  return { toast, show };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MyPools() {
  const navigate = useNavigate();
  const { toast, show: showToast } = useToast();
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const { user } = useAuth();

  const { data: myPools, loading: poolsLoading } = usePools({ ownerId: user?.id ?? 'user-you' });
  const { data: memberships, loading: membershipsLoading } = useMemberships();

  const loading = poolsLoading || membershipsLoading;

  // Derived data
  const activeMemberships = memberships.filter((m: Membership) => m.status === 'active');
  const totalOwed = activeMemberships.reduce((sum: number, m: Membership) => sum + m.pool.price_per_slot, 0);

  return (
    <div className="space-y-8 pr-1">
      {/* ─── Stats Row ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              label="POOLS OWNED"
              value={String(myPools.length)}
              sub="active"
            />
            <StatCard
              label="JOINED"
              value={String(memberships.length)}
              sub="1 pending"
            />
            <StatCard
              label="YOU OWE"
              value={formatPrice(totalOwed)}
              sub="due this cycle"
              subVariant="danger"
              accentTop
            />
          </>
        )}
      </div>

      {/* ─── Pools I Own ─────────────────────────────────────────── */}
      <section>
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-3">
          POOLS I OWN
        </p>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PoolCardSkeleton />
            <PoolCardSkeleton />
          </div>
        ) : myPools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myPools.map((pool) => (
              <PoolCard key={pool.id} pool={pool} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🏊"
            title="No pools yet"
            description="Share your subscriptions and earn by listing your first pool."
            action={() => navigate('/list')}
            actionLabel="List your first pool"
          />
        )}
      </section>

      {/* ─── My Memberships ──────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            MY MEMBERSHIPS
          </p>

          {/* View Switcher — Mobile Only */}
          <div className="flex md:hidden bg-secondary/50 p-1 rounded-lg border border-border">
            <button
              onClick={() => setViewMode('cards')}
              className={cn(
                "px-3 py-1 rounded-md text-[10px] font-bold transition-all",
                viewMode === 'cards' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              CARDS
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                "px-3 py-1 rounded-md text-[10px] font-bold transition-all",
                viewMode === 'table' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              TABLE
            </button>
          </div>
        </div>

        {/* Desktop/Tablet Table View or Mobile Table if selected */}
        <div className={cn(
          "bg-card border border-border rounded-[6px] overflow-hidden",
          viewMode === 'table' ? "block" : "hidden md:block"
        )}>
          <div className="overflow-x-auto">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow className="border-b border-border hover:bg-transparent">
                  <TableHead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-5 h-10">
                    Platform
                  </TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-5 h-10">
                    Owner
                  </TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-5 h-10">
                    Monthly
                  </TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-5 h-10">
                    Next Due
                  </TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-5 h-10">
                    Status
                  </TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-5 h-10 text-right">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6} className="p-0">
                        <TableRowSkeleton cells={6} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : memberships.length > 0 ? (
                  memberships.map((m: Membership) => {
                    const platform = getPlatform(m.pool.platform_id);

                    return (
                      <TableRow
                        key={m.id}
                        className="hover:bg-secondary/30 border-b border-border"
                      >
                        <TableCell className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <PlatformIcon
                              platformId={m.pool.platform_id}
                              size="sm"
                            />
                            <div>
                              <p className="font-display font-semibold text-sm text-foreground">
                                {platform?.name ?? m.pool.platform_id}
                              </p>
                              <p className="font-mono text-[10px] text-muted-foreground">
                                {m.pool.plan_name}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="px-5 py-3.5">
                          <span className="font-display text-sm text-foreground">
                            {m.pool.owner.display_name}
                          </span>
                        </TableCell>

                        <TableCell className="px-5 py-3.5">
                          <span className="font-mono font-medium text-foreground">
                            {formatPrice(m.pool.price_per_slot)}
                          </span>
                        </TableCell>

                        <TableCell className="px-5 py-3.5">
                          <span className="font-mono text-sm text-foreground">
                            {m.next_billing_at ? formatDate(m.next_billing_at) : '—'}
                          </span>
                        </TableCell>

                        <TableCell className="px-5 py-3.5">
                          <StatusPill status={m.status as any} />
                        </TableCell>

                        <TableCell className="px-5 py-3.5 text-right">
                          {m.status === 'active' ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                className="font-display text-xs"
                                onClick={() =>
                                  showToast('Payment marked ✓')
                                }
                              >
                                Pay {formatPrice(m.pool.price_per_slot)}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="font-mono text-[10px] text-muted-foreground hover:text-destructive"
                                onClick={() => {
                                  if (window.confirm('Cancel this membership?')) {
                                    showToast('Cancellation request sent');
                                  }
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <span className="font-mono text-[11px] text-muted-foreground">
                              Awaiting approval
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <EmptyState
                        icon="🚫"
                        title="No memberships"
                        description="You haven't joined any pools yet."
                        action={() => navigate('/browse')}
                        actionLabel="Browse pools"
                      />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className={cn(
          "grid grid-cols-1 gap-4 mt-2",
          viewMode === 'cards' ? "md:hidden" : "hidden"
        )}>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <PoolCardSkeleton key={i} />)
          ) : memberships.map((m: Membership) => (
            <div key={m.id} className="bg-card border border-border rounded-lg p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PlatformIcon platformId={m.pool.platform_id} size="sm" />
                  <div>
                    <p className="font-display font-bold text-sm">{getPlatform(m.pool.platform_id)?.name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{m.pool.plan_name}</p>
                  </div>
                </div>
                <StatusPill status={m.status as any} />
              </div>

              <div className="grid grid-cols-2 gap-4 py-3 border-y border-border/50">
                <div>
                  <p className="font-mono text-[9px] uppercase text-muted-foreground mb-1">Monthly</p>
                  <p className="font-mono font-bold text-sm">{formatPrice(m.pool.price_per_slot)}</p>
                </div>
                <div>
                  <p className="font-mono text-[9px] uppercase text-muted-foreground mb-1">Next Due</p>
                  <p className="font-mono text-sm">{m.next_billing_at ? formatDate(m.next_billing_at) : '—'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <div className="size-5 rounded-full bg-secondary flex items-center justify-center text-[8px] font-bold">
                    {m.pool.owner.display_name.charAt(0)}
                  </div>
                  <span className="font-display text-[11px] text-muted-foreground">
                    {m.pool.owner.display_name}
                  </span>
                </div>
                {m.status === 'active' && (
                  <div className="flex gap-2">
                    <Button size="sm" className="h-8 text-xs px-3" onClick={() => showToast('Payment sent')}>
                      Pay
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 text-xs px-2" onClick={() => { if (window.confirm('Cancel?')) { showToast('Cancelled'); } }}>
                      ✕
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Inline Toast ──────────────────────────────────────── */}
      {toast.visible && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-lg bg-card border border-success text-foreground font-display text-sm shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
          {toast.message}
        </div>
      )}
    </div>
  );
}