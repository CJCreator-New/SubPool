// ─── MyPools Page ────────────────────────────────────────────────────────────
// Owned pools grid + memberships table with payment actions.

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { StatCard, PoolCard, StatusPill, PlatformIcon } from '../components/subpool-components';
import { Button } from '../components/ui/button';
import { EmptyState } from '../components/empty-state';
import { PoolCardSkeleton, StatCardSkeleton, TableRowSkeleton } from '../components/skeletons';
import { MembershipRequestCard } from '../components/membership-request-card';
import { PoolSettingsModal } from '../components/pool-settings-modal';
import { RatingModal } from '../components/rating-modal';
import { IdentityVerificationModal } from '../components/kyc-modal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../components/ui/table';
import { cn } from '../components/ui/utils';
import { getPlatform, formatPrice, formatDate, timeAgo } from '../../lib/constants';
import type { Pool, Membership, JoinRequest } from '../../lib/types';
import { 
  useMyPoolsQuery, 
  useMembershipsQuery, 
  useJoinRequestsQuery,
  useApproveRequestMutation,
  useRejectRequestMutation
} from '../../lib/supabase/queries';
import { useAuth } from '../../lib/supabase/auth';
import { MOCK_EARNINGS_DATA, MOCK_PAYMENT_TIMELINE } from '../../lib/mock-data';
import { EarningsBarChart, MemberPaymentTimeline, PoolHealthGauge } from '../components/pool-analytics-charts';
import { getUserFacingError } from '../../lib/error-feedback';
import { toast as sonnerToast } from 'sonner';
import { Zap, ShieldCheck, Fingerprint, ArrowRight, AlertTriangle, ShieldCheck as ShieldIcon } from 'lucide-react';

export function MyPools() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [membershipToCancel, setMembershipToCancel] = useState<Membership | null>(null);
  const [selectedPoolForEdit, setSelectedPoolForEdit] = useState<Pool | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPoolForRating, setSelectedPoolForRating] = useState<Pool | null>(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isKYCModalOpen, setIsKYCModalOpen] = useState(false);
  const { user, profile } = useAuth();

  const { data: myPoolsData, isLoading: poolsLoading, refetch: ownedRefetch } = useMyPoolsQuery(user?.id);
  const { data: membershipsData, isLoading: membershipsLoading, refetch: membershipsRefetch } = useMembershipsQuery(user?.id);
  const {
    data: joinRequestsData,
    isLoading: requestsLoading,
    error: joinRequestsError,
  } = useJoinRequestsQuery(user?.id);

  const approveMutation = useApproveRequestMutation();
  const rejectMutation = useRejectRequestMutation();

  const myPools = myPoolsData || [];
  const memberships = membershipsData || [];
  const joinRequests = joinRequestsData || [];

  const loading = poolsLoading || membershipsLoading || requestsLoading;

  // Derived data
  const activeMemberships = memberships.filter((m: Membership) => m.status === 'active');
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;
  const totalOwed = activeMemberships.reduce((sum: number, m: Membership) => {
    if (!m.pool) return sum;
    return sum + m.pool.price_per_slot;
  }, 0);
  const renewalsDueSoon = activeMemberships.filter((membership) => {
    if (!membership.next_billing_at) return false;
    const dueAt = new Date(membership.next_billing_at).getTime();
    return dueAt >= now && dueAt - now <= 3 * dayInMs;
  }).length;
  const overduePayments = activeMemberships.filter((membership) => {
    if (!membership.next_billing_at) return false;
    const dueAt = new Date(membership.next_billing_at).getTime();
    return dueAt < now;
  }).length;

  const pendingRequests = joinRequests.filter(r => r.status === 'pending');
  const joinRequestErrorMessage = joinRequestsError
    ? getUserFacingError(joinRequestsError, 'load join requests').message
    : null;

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id);
      sonnerToast.success('Request approved! Slot filled.');
    } catch (err) {
      const friendly = getUserFacingError(err, 'approve this request');
      sonnerToast.error(friendly.message);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectMutation.mutateAsync(id);
      sonnerToast.success('Request rejected.');
    } catch (err) {
      const friendly = getUserFacingError(err, 'reject this request');
      sonnerToast.error(friendly.message);
    }
  };

  const requestCancelMembership = (membership: Membership) => {
    setMembershipToCancel(membership);
    setCancelDialogOpen(true);
  };

  const confirmCancelMembership = () => {
    if (!membershipToCancel) return;

    const platformName = getPlatform(membershipToCancel.pool.platform)?.name ?? membershipToCancel.pool.platform;
    sonnerToast.success('Cancellation request sent.', {
      description: `${platformName} ${membershipToCancel.pool.plan_name} will be cancelled at period end.`,
      action: {
        label: 'Undo',
        onClick: () => sonnerToast.info('Cancellation undone.'),
      },
    });

    setCancelDialogOpen(false);
    setMembershipToCancel(null);
  };

  return (
    <div className="space-y-8 pr-1">
      {/* ─── KYC / Identity Banner ─────────────────────────────────── */}
      {!profile?.is_verified && (
        <div className="bg-primary/5 border border-primary/20 rounded-[20px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
            <Fingerprint size={120} />
          </div>
          <div className="flex items-center gap-5 relative z-10">
            <div className="size-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-glow-primary/5">
              <ShieldCheck size={28} className="text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-black text-lg uppercase italic tracking-tight">Identity Sync Required</h3>
              <p className="font-mono text-[10px] text-muted-foreground max-w-md leading-relaxed uppercase tracking-wider">
                Unverified nodes are restricted from premium clusters. Sync your government identity to unlock 0% fees and elite host status.
              </p>
            </div>
          </div>
          <Button 
            onClick={() => setIsKYCModalOpen(true)} 
            className="h-12 px-8 rounded-2xl font-display font-black text-xs uppercase tracking-widest shadow-glow-primary shrink-0 relative z-10"
          >
            Initialize Verification
          </Button>
        </div>
      )}

      {/* ─── Stats Row ───────────────────────────────────────────── */}
      {profile?.plan === 'free' && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <Zap size={20} className="text-primary animate-pulse" />
            </div>
            <div>
              <p className="font-display font-bold text-sm">Level up your hosting</p>
              <p className="font-mono text-[10px] text-muted-foreground">Host Plus members get automated approval, higher slot limits, and 0% platform fees.</p>
            </div>
          </div>
          <Button size="sm" onClick={() => navigate('/plans')} className="h-8 text-[10px] font-display font-bold px-4 shrink-0">
            View Plans
          </Button>
        </div>
      )}

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
              sparklineData={MOCK_EARNINGS_DATA.map(d => ({ month: d.month, amount: d.earned }))}
              sparklineColor="#C8F135"
              accentTop
            />
            <StatCard
              label="JOINED"
              value={String(memberships.length)}
              sub="1 pending"
              accentTop
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

      {!loading && (
        <section className="space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            TODAY COMMAND CENTER
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-[6px] border border-border bg-card px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Renewals (72h)</p>
              <p className="font-display text-2xl font-bold mt-1">{renewalsDueSoon}</p>
              <p className="font-mono text-[10px] text-muted-foreground mt-1">Upcoming renewals due soon</p>
            </div>
            <div className="rounded-[6px] border border-warning/30 bg-warning/10 px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-wider text-warning">Unpaid Members</p>
              <p className="font-display text-2xl font-bold mt-1 text-warning">{overduePayments}</p>
              <p className="font-mono text-[10px] text-warning/80 mt-1">Past due and needs follow-up</p>
            </div>
            <div className="rounded-[6px] border border-primary/30 bg-primary/10 px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-wider text-primary">Pending Requests</p>
              <p className="font-display text-2xl font-bold mt-1 text-primary">{pendingRequests.length}</p>
              <p className="font-mono text-[10px] text-primary/80 mt-1">Awaiting host action today</p>
            </div>
          </div>
        </section>
      )}

      {joinRequestErrorMessage && (
        <div className="px-4 py-3 rounded-lg border border-warning/30 bg-warning/10 text-warning">
          <p className="font-mono text-xs">{joinRequestErrorMessage}</p>
        </div>
      )}

      {/* ─── Pending Requests ────────────────────────────────────────── */}
      {pendingRequests.length > 0 && !loading && (
        <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <p className="font-mono text-[11px] uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Pending Join Requests ({pendingRequests.length})
          </p>

          <div className="grid grid-cols-1 gap-3">
            {pendingRequests.map((req) => (
              <MembershipRequestCard
                key={req.id}
                request={req}
                onApprove={async () => handleApprove(req.id)}
                onReject={async () => handleReject(req.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ─── Pools I Own ────────────────────────────────────────────── */}
      <section>
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-3">
          POOLS I OWN
        </p>

        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            <PoolCardSkeleton />
            <PoolCardSkeleton />
          </div>
        ) : myPools.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {myPools.map((pool) => {
              const fillRate = (pool.filled_slots / pool.total_slots) * 100;
              const payRate = 85;
              const healthScore = Math.round((fillRate * 0.6) + (payRate * 0.4));

              return (
                <div key={pool.id} className="bg-card border border-border rounded-[6px] p-4 flex flex-col lg:flex-row gap-6 items-center relative group">
                  <div className="flex-1 w-full max-w-sm lg:max-w-none">
                    <PoolCard pool={pool} />
                  </div>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="h-7 px-2 rounded-md font-mono text-[10px] uppercase tracking-widest border border-border"
                      onClick={() => {
                        setSelectedPoolForEdit(pool);
                        setIsEditModalOpen(true);
                      }}
                    >
                      Configure
                    </Button>
                  </div>
                  <div className="shrink-0 flex flex-col items-center justify-center p-6 bg-secondary/10 rounded-lg w-full lg:w-auto min-w-[200px] border border-border/30">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[#6B6860] mb-4">Sys Health</p>
                    <PoolHealthGauge score={healthScore} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon="→"
            title="No pools yet"
            description="Share your subscriptions and earn by listing your first pool."
            action={() => navigate('/list')}
            actionLabel="List your first pool"
          />
        )}
      </section>

      {/* ─── Analytics ──────────────────────────────────────────────── */}
      <section className="relative">
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-3">
          ANALYTICS (PRO)
        </p>

        <div className={cn(
          "grid grid-cols-1 lg:grid-cols-2 gap-4 transition-all duration-500",
          profile?.plan === 'free' ? "blur-md pointer-events-none opacity-40 select-none pb-12" : ""
        )}>
          <div className="bg-card border border-border rounded-[6px] p-5 shadow-sm">
            <h3 className="font-display font-bold text-sm mb-6 text-foreground">Earnings & Savings</h3>
            <EarningsBarChart data={MOCK_EARNINGS_DATA} />
          </div>
          <div className="bg-card border border-border rounded-[6px] p-5 shadow-sm">
            <h3 className="font-display font-bold text-sm mb-6 text-foreground">Member Status</h3>
            <MemberPaymentTimeline members={MOCK_PAYMENT_TIMELINE} />
          </div>
        </div>

        {profile?.plan === 'free' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pt-8">
            <div className="bg-background/90 backdrop-blur-lg p-7 rounded-xl border border-primary/20 text-center max-w-sm shadow-2xl">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl border border-primary/20">
                <ShieldCheck size={24} className="text-primary" />
              </div>
              <h3 className="font-display font-bold text-lg mb-2 text-foreground">Unlock Analytics</h3>
              <p className="font-mono text-[11px] text-muted-foreground mb-6 leading-relaxed">
                Upgrade to Pro to see detailed earnings history, payment timelines, and predictive health scores.
              </p>
              <Button onClick={() => navigate('/plans')} className="w-full font-display shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                Upgrade to Pro
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* ─── Market Intelligence (Host Plus) ────────────────────────── */}
      <section className="relative">
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-3">
          MARKET INTELLIGENCE (HOST PLUS)
        </p>

        <div className={cn(
          "grid grid-cols-1 md:grid-cols-3 gap-4 transition-all duration-500",
          profile?.plan !== 'host_plus' && profile?.plan !== 'enterprise' ? "blur-md pointer-events-none opacity-40 select-none pb-12" : ""
        )}>
          <div className="bg-card border border-border rounded-[6px] p-5 shadow-sm">
            <h3 className="font-display font-bold text-sm mb-4 text-foreground">Demand Heatmap</h3>
            <div className="h-32 bg-secondary/20 rounded-lg flex items-center justify-center border border-border/50">
              <span className="font-mono text-[10px] text-muted-foreground uppercase">High demand for Netflix Premium</span>
            </div>
          </div>
          <div className="bg-card border border-border rounded-[6px] p-5 shadow-sm">
            <h3 className="font-display font-bold text-sm mb-4 text-foreground">Yield Optimization</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] text-muted-foreground">Suggested Price</span>
                <span className="font-mono font-bold text-primary">₹149/mo</span>
              </div>
              <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[75%]" />
              </div>
              <p className="font-mono text-[9px] text-muted-foreground">Current pricing is 15% below market peak.</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-[6px] p-5 shadow-sm">
            <h3 className="font-display font-bold text-sm mb-4 text-foreground">Competitor Density</h3>
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-full border-4 border-primary/20 border-t-primary animate-[spin_3s_linear_infinite]" />
              <div>
                <p className="font-display font-bold text-lg">Low Density</p>
                <p className="font-mono text-[10px] text-muted-foreground uppercase">Prime time to list new slots</p>
              </div>
            </div>
          </div>
        </div>

        {profile?.plan !== 'host_plus' && profile?.plan !== 'enterprise' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pt-8">
            <div className="bg-background/90 backdrop-blur-lg p-7 rounded-xl border border-primary/20 text-center max-w-sm shadow-2xl">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl border border-primary/20">
                <Zap size={24} className="text-primary" />
              </div>
              <h3 className="font-display font-bold text-lg mb-2 text-foreground">Host Plus Intelligence</h3>
              <p className="font-mono text-[11px] text-muted-foreground mb-6 leading-relaxed">
                Unlock real-time market data, yield optimization suggestions, and competitor insights to maximize your hosting revenue.
              </p>
              <Button onClick={() => navigate('/plans')} className="w-full font-display shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                Upgrade to Host Plus
              </Button>
            </div>
          </div>
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
                    const platform = getPlatform(m.pool.platform);

                    return (
                      <TableRow
                        key={m.id}
                        className="hover:bg-secondary/30 border-b border-border"
                      >
                        <TableCell className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <PlatformIcon
                              platformId={m.pool.platform}
                              size="sm"
                            />
                            <div>
                              <p className="font-display font-semibold text-sm text-foreground">
                                {platform?.name ?? m.pool.platform}
                              </p>
                              <p className="font-mono text-[10px] text-muted-foreground">
                                {m.pool.plan_name}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="px-5 py-3.5">
                          <span className="font-display text-sm text-foreground">
                            {m.pool.owner?.display_name ?? m.pool.owner?.username ?? 'Host'}
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
                                  sonnerToast.success('Payment marked ✓')
                                }
                              >
                                Pay {formatPrice(m.pool.price_per_slot)}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="font-mono text-[10px] h-8"
                                onClick={() => {
                                  setSelectedPoolForRating(m.pool);
                                  setIsRatingModalOpen(true);
                                }}
                              >
                                Rate
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="font-mono text-[10px] text-muted-foreground hover:text-destructive"
                                onClick={() => requestCancelMembership(m)}
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
                        icon="⚠️"
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
                  <PlatformIcon platformId={m.pool.platform} size="sm" />
                  <div>
                    <p className="font-display font-bold text-sm">{getPlatform(m.pool.platform)?.name}</p>
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
                    {(m.pool.owner?.display_name ?? m.pool.owner?.username ?? '?').charAt(0)}
                  </div>
                  <span className="font-display text-[11px] text-muted-foreground">
                    {m.pool.owner?.display_name ?? m.pool.owner?.username ?? 'Host'}
                  </span>
                </div>
                {m.status === 'active' && (
                  <div className="flex gap-2">
                    <Button size="sm" className="h-8 text-xs px-3" onClick={() => sonnerToast.success('Payment sent')}>
                      Pay
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-xs"
                      onClick={() => {
                        setSelectedPoolForRating(m.pool);
                        setIsRatingModalOpen(true);
                      }}
                    >
                      Rate
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 text-xs px-2" onClick={() => requestCancelMembership(m)}>
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
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel membership?</AlertDialogTitle>
            <AlertDialogDescription>
              This sends a cancellation request for{' '}
              {membershipToCancel
                ? `${getPlatform(membershipToCancel.pool.platform)?.name ?? membershipToCancel.pool.platform} ${membershipToCancel.pool.plan_name}`
                : 'this membership'}
              . You can undo immediately after confirming.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMembershipToCancel(null)}>
              Keep Membership
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancelMembership}>
              Confirm Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PoolSettingsModal 
        pool={selectedPoolForEdit}
        open={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPoolForEdit(null);
        }}
        onUpdate={() => {
          ownedRefetch();
          membershipsRefetch();
        }}
      />

      <RatingModal 
        pool={selectedPoolForRating}
        raterId={user?.id || ''}
        open={isRatingModalOpen}
        onClose={() => {
          setIsRatingModalOpen(false);
          setSelectedPoolForRating(null);
        }}
      />

      <IdentityVerificationModal 
        open={isKYCModalOpen}
        onClose={() => setIsKYCModalOpen(false)}
      />
    </div>
  );
}
