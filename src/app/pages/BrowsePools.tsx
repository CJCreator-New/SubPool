// ─── BrowsePools Page ──────────────────────────────────────────────────────────
// Filterable grid of pool cards with stats, search, and detail modal.

import { useState, useEffect } from 'react';
import { StatCard, PoolCard } from '../components/subpool-components';
import { PoolDetailModal } from '../components/pool-detail-modal';
import { Button } from '../components/ui/button';
import { PoolCardSkeleton, StatCardSkeleton } from '../components/skeletons';
import { EmptyState } from '../components/empty-state';
import { cn } from '../components/ui/utils';
import { usePools } from '../../lib/supabase/hooks';
import { getPlatform, formatPrice } from '../../lib/constants';
import type { Pool } from '../../lib/types';
import { useAuth } from '../../lib/supabase/auth';
import { useNavigate } from 'react-router';
import { Insight, useDemo } from '../components/demo-mode';

// ─── Filter constants ─────────────────────────────────────────────────────────

type FilterKey = 'all' | 'entertainment' | 'work' | 'ai' | 'open';

const FILTER_CHIPS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'entertainment', label: 'Entertainment' },
  { key: 'work', label: 'Work' },
  { key: 'ai', label: 'AI Tools' },
  { key: 'open', label: 'Open Only' },
];

// ─── Toast helper (inline, no sonner dependency) ──────────────────────────────

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

// ─── Skeletons ──────────────────────────────────────────────────────────────

// ─── Component ────────────────────────────────────────────────────────────────

export function BrowsePools() {
  const [filter, setFilter] = useState<FilterKey>('all');
  const [search, setSearch] = useState('');
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);

  const { data: pools, loading } = usePools({
    category: filter === 'all' || filter === 'open' ? undefined : filter,
    status: filter === 'open' ? 'open' : undefined,
    searchQuery: search
  });

  const { toast, show: showToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { isDemo, currentStep } = useDemo();

  // Demo Mode Interaction
  useEffect(() => {
    if (isDemo) {
      if (currentStep === 2) {
        setFilter('entertainment');
      } else if (currentStep === 1) {
        setFilter('all');
      }
    }
  }, [isDemo, currentStep]);

  const filtered = pools;

  const handleRequestJoin = async (pool: Pool) => {
    if (!user) {
      showToast('Sign in to join pools →');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }
    await new Promise((r) => setTimeout(r, 1200));
    setSelectedPool(null);
    showToast('Request sent! Waiting for approval 🙌');
  };

  const clearFilters = () => {
    setFilter('all');
    setSearch('');
  };

  return (
    <div className="space-y-7">
      {/* ─── Page Header ─────────────────────────────────────────── */}
      <div>
        <h1 className="font-display font-bold text-[28px] tracking-tight text-foreground">
          Browse Pools
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Find and join subscription pools to save on your favorite platforms.
        </p>
      </div>

      {/* ─── Stats Row ───────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative">
          <StatCard
            label="OPEN POOLS"
            value="142"
            sub="↑ 12 new today"
            subVariant="success"
            accentTop
            live
          />
          <StatCard
            label="PLATFORMS"
            value="28"
            sub="entertainment + work + ai"
          />
          <StatCard
            label="AVG. SAVINGS"
            value="67%"
            sub="vs solo pricing"
            subVariant="success"
            accentTop
          />
          <StatCard
            label="MEMBERS"
            value="3,241"
            sub="↑ 847 this month"
            subVariant="success"
          />

          <Insight id="browse-stats" activeStep={1} className="-top-10 left-1/2 -translate-x-1/2" />
        </div>
      )}

      {/* ─── Filter Row ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex flex-wrap gap-2 items-center flex-1">
          {FILTER_CHIPS.map((chip) => (
            <button
              key={chip.key}
              onClick={() => setFilter(chip.key)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-xs font-display font-bold transition-all',
                filter === chip.key
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground',
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-card border border-border rounded-[6px] px-3 py-2 w-full sm:w-auto overflow-hidden">
          <span className="text-muted-foreground text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search platforms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 bg-transparent p-0 h-auto text-sm flex-1 sm:w-[180px] focus:outline-none text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* ─── Pool Grid or Empty State ────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <PoolCardSkeleton key={i} />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((pool) => (
            <div key={pool.id} className="relative">
              <PoolCard
                pool={pool}
                onClick={(p) => setSelectedPool(p)}
              />
              {pool.platform_id === 'netflix' && (
                <Insight id="netflix-card" activeStep={3} className="top-1/2 -right-1/2 translate-x-4 -translate-y-1/2" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🔭"
          title="No pools found"
          description="Try a different filter or search term to find what you're looking for."
          action={clearFilters}
          actionLabel="Clear filters"
        />
      )}

      {/* ─── Pool Detail Modal ───────────────────────────────────── */}
      <PoolDetailModal
        pool={selectedPool}
        open={!!selectedPool}
        onClose={() => setSelectedPool(null)}
        onRequestJoin={handleRequestJoin}
      />

      {/* ─── Inline Toast ────────────────────────────────────────── */}
      {toast.visible && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-lg bg-card border border-success text-foreground font-display text-sm shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
          {toast.message}
        </div>
      )}
    </div>
  );
}
