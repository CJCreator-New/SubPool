// â”€â”€â”€ BrowsePools Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Filterable grid of pool cards with stats, search, and detail modal.

import { useState, useEffect, useRef } from 'react';
import { StatCard, PoolCard } from '../components/subpool-components';
import { PoolDetailModal } from '../components/pool-detail-modal';
import { Button } from '../components/ui/button';
import { PoolCardSkeleton, StatCardSkeleton } from '../components/skeletons';
import { PlatformIcon } from '../components/subpool-components';
import { getMarketMetrics, analyzePricing } from '../../lib/pricing-service';
import { EmptyState } from '../components/empty-state';
import { PaywallModal } from '../components/paywall-modal';
import { cn } from '../components/ui/utils';
import { track } from '../../lib/analytics';
import type { Pool } from '../../lib/types';
import { useCursorPagination } from '../../lib/hooks/useCursorPagination';
import { resolveDataMode } from '../../lib/data-mode';
import { MOCK_POOLS } from '../../lib/mock-data';
import { getPlatform } from '../../lib/constants';
import { useAuth } from '../../lib/supabase/auth';
import { useNavigate, useSearchParams } from 'react-router';
import { Insight, useDemo } from '../components/demo-mode';
import { useCountUp } from '../../hooks/useCountUp';
import { useCurrency } from '../../lib/currency-context';
import { CurrencyToggle } from '../components/currency-toggle';
import { ActivationChecklist } from '../components/activation-checklist';
import type { BrowseFilterKey, BrowseSortKey } from '../components/filter-panel';

// â”€â”€â”€ Filter constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const FILTER_VALUES: BrowseFilterKey[] = ['all', 'entertainment', 'work', 'ai', 'open', 'creative'];
const SORT_VALUES: BrowseSortKey[] = ['recent', 'price-asc', 'price-desc'];
const CATEGORY_CHIPS: { key: BrowseFilterKey; label: string }[] = [
  { key: 'all', label: 'All Pools' },
  { key: 'open', label: 'Open only' },
  { key: 'entertainment', label: 'Entertainment' },
  { key: 'work', label: 'Team SaaS' },
  { key: 'ai', label: 'AI Tools' },
  { key: 'creative', label: 'Creative' },
];

// â”€â”€â”€ Toast helper (inline, no sonner dependency) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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



// â”€â”€â”€ Market Intelligence Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const TOP_PLATFORMS = [
  { id: 'netflix', plan: '4K', name: 'Netflix' },
  { id: 'chatgpt', plan: 'Plus', name: 'ChatGPT' },
  { id: 'figma', plan: 'Professional', name: 'Figma' },
  { id: 'spotify', plan: 'Family', name: 'Spotify' },
  { id: 'youtube', plan: 'Family', name: 'YouTube' }
];

function MarketIntelligenceRow() {
  const [expanded, setExpanded] = useState(false);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const { profile } = useAuth();
  const { currency, formatPrice } = useCurrency();
  const isFree = profile?.plan === 'free' || !profile;

  useEffect(() => {
    if (expanded && !isDataLoaded) {
      Promise.all(
        TOP_PLATFORMS.map(async (p) => {
          const m = await getMarketMetrics(p.id, p.plan);
          const avg = m?.avg_slot_price ?? 0;
          const userCurrency = currency || 'USD';
          const analysis = analyzePricing({
            platformId: p.id,
            planName: p.plan,
            userSlotPrice: avg,
            totalSlots: 4,
            currency: userCurrency,
            countryCode: 'GLOBAL'
          });
          return {
            ...p,
            avg: avg,
            solo: analysis.officialSoloPrice,
            savingsPct: analysis.savingsPct,
            count: Math.floor(Math.random() * 15) + 5
          };
        })
      ).then(data => {
        setMetrics(data);
        setIsDataLoaded(true);
      });
    }
  }, [expanded, isDataLoaded]);

  return (
    <div className="mt-2 mb-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          if (!expanded) track('market_intelligence_expanded');
          setExpanded(!expanded);
        }}
        className="text-xs font-mono mb-3 group"
      >
        ðŸ“Š See market rates {expanded ? 'â–²' : 'â–¼'}
        {isFree && <span className="ml-2 text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">PRO</span>}
      </Button>

      {expanded && (
        <div className="relative">
          <div className={`flex overflow-x-auto gap-3 pb-2 snap-x hide-scrollbar ${isFree ? 'focus-within:blur-none transition-all' : ''}`}>
            {/* content same as before ... */}
            {!isDataLoaded ? (
              <div className="text-sm text-muted-foreground font-mono px-2 py-4">
                {isFree ? 'Subscribe to Pro to unlock market rates.' : 'Loading market data...'}
              </div>
            ) : (
              metrics.map(m => (
                <div key={m.id} className={`w-[160px] shrink-0 bg-card border border-border rounded-[6px] p-3 snap-start relative ${isFree ? 'blur-[3px] select-none pointer-events-none' : ''}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <PlatformIcon platformId={m.id} size="sm" />
                    <span className="font-display font-semibold text-sm truncate">{m.name}</span>
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-mono text-[13px] text-primary">Avg slot: {formatPrice(m.avg)}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">vs {formatPrice(m.solo)} solo</p>
                    <p className="font-mono text-[10px] text-[#4DFF91]">Saves {m.savingsPct.toFixed(0)}%</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {isFree && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/40 backdrop-blur-[2px] rounded-lg border border-primary/20 p-4 text-center z-10 animate-in fade-in duration-500">
              <span className="text-xl mb-2" role="img" aria-label="icon">ðŸ“Š</span>
              <p className="font-display font-bold text-sm mb-1">Market Intelligence</p>
              <p className="font-mono text-[10px] text-muted-foreground mb-4 max-w-[200px]">Unlock real-time market averages and demand tracking with Pro.</p>
              <Button size="sm" onClick={() => setPaywallOpen(true)} className="h-8 text-[10px] font-display font-bold px-4">
                Unlock Now
              </Button>
            </div>
          )}
        </div>
      )}

      <PaywallModal
        feature="Market Intelligence"
        requiredPlan="pro"
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
      />
    </div>
  );
}

// â”€â”€â”€ Skeletons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function BrowsePools() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter');
  const initialSort = searchParams.get('sort');
  const initialSearch = searchParams.get('q') ?? '';
  const [filter, setFilter] = useState<BrowseFilterKey>(
    FILTER_VALUES.includes(initialFilter as BrowseFilterKey) ? (initialFilter as BrowseFilterKey) : 'all',
  );
  const [sort, setSort] = useState<BrowseSortKey>(
    SORT_VALUES.includes(initialSort as BrowseSortKey) ? (initialSort as BrowseSortKey) : 'recent',
  );
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const { isDemo, currentStep } = useDemo();

  // Debounce search to prevent excessive queries
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const nextParams = new URLSearchParams();

    if (filter !== 'all') nextParams.set('filter', filter);
    if (debouncedSearch.trim()) nextParams.set('q', debouncedSearch.trim());
    if (sort !== 'recent') nextParams.set('sort', sort);

    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [debouncedSearch, filter, sort, searchParams, setSearchParams]);

  // Shared infinite scroll pagination hook
  const { data: pagedPools, loading, loadMore, hasMore, refetch } = useCursorPagination<Pool>({
    limit: 9,
    fetchPage: async (cursorParam, limit) => {
      const mode = resolveDataMode({ allowDemoFallback: true });

      // Demo mode: filter mock data
      if (mode !== 'production') {
        const start = cursorParam ? Number(cursorParam) : 0;
        const base = MOCK_POOLS;
        const filtered = base.filter((pool) => {
          const category = filter === 'all' || filter === 'open' ? undefined : filter;
          const status = filter === 'open' ? 'open only' : undefined;

          if (category && pool.category !== category) return false;
          if (status === 'open only' && pool.status !== 'open') return false;
          if (debouncedSearch) {
            const q = debouncedSearch.toLowerCase();
            const plat = getPlatform(pool.platform);
            const owner = (pool.owner?.display_name ?? pool.owner?.username ?? '').toLowerCase();
            if (!plat?.name.toLowerCase().includes(q) && !pool.plan_name.toLowerCase().includes(q) && !owner.includes(q)) {
              return false;
            }
          }
          return true;
        });
        const page = filtered.slice(start, start + limit);
        const nextCursor = start + limit < filtered.length ? String(start + limit) : undefined;
        return { items: page, nextCursor };
      }

      // Production: fetch from Supabase
      const { supabase } = await import('../../lib/supabase/client');
      if (!supabase) {
        throw new Error('Supabase not available');
      }
      let query = supabase.from('pools').select('*, owner:profiles(*)').order('created_at', { ascending: false });

      const category = filter === 'all' || filter === 'open' ? undefined : filter;
      const status = filter === 'open' ? 'open only' : undefined;

      if (category) {
        query = query.eq('category', category);
      }
      if (status === 'open only') {
        query = query.eq('status', 'open');
      }
      if (debouncedSearch) {
        query = query.textSearch('search_vector', debouncedSearch, {
          type: 'websearch',
          config: 'english'
        });
      }

      const start = cursorParam ? Number(cursorParam) : 0;
      const end = start + limit - 1;
      const { data: rows, error } = await query.range(start, end);

      if (error) throw error;

      const items = (rows ?? []) as Pool[];
      const nextCursor = items.length === limit ? String(start + limit) : undefined;
      return { items, nextCursor };
    },
  });

  // Reset pagination when filters change
  useEffect(() => {
    // The useCursorPagination hook handles reset via its refetch function
  }, [filter, debouncedSearch]);

  const { toast, show: showToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const mounted = useRef(false);

  useEffect(() => {
    if (isDemo && !mounted.current) {
      document.body.classList.add('demo-mode');
      mounted.current = true;
    } else if (!isDemo) {
      document.body.classList.remove('demo-mode');
      mounted.current = false; // Reset if demo is toggled off
    }
    return () => document.body.classList.remove('demo-mode');
  }, [isDemo]);

  const openPoolsCount = Math.floor(useCountUp(142, 1200, isDemo));
  const platformsCount = Math.floor(useCountUp(28, 1200, isDemo));
  const savingsCount = Math.floor(useCountUp(67, 1200, isDemo));
  const membersCount = Math.floor(useCountUp(3241, 1200, isDemo));

  const formatStat = (val: number, target: number, type: 'number' | 'percent' | 'currency' = 'number') => {
    if (isDemo && val < target) return val.toString();
    if (type === 'percent') return `${val}%`;
    if (type === 'currency') return `$${val}`;
    return val.toLocaleString();
  };

  useEffect(() => {
    if (user) {
      track('activation_checklist_viewed', { source: 'dashboard' });
    }
  }, [user]);

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

  const filtered = [...(pagedPools?.items || [])].sort((a, b) => {
    if (sort === 'price-asc') {
      return a.price_per_slot - b.price_per_slot;
    }
    if (sort === 'price-desc') {
      return b.price_per_slot - a.price_per_slot;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  const hasSearchFilter = debouncedSearch.trim().length > 0;
  const hasCategoryFilter = filter !== 'all';
  const hasSortFilter = sort !== 'recent';
  const activeFilterCount = Number(hasSearchFilter) + Number(hasCategoryFilter) + Number(hasSortFilter);

  const handleRequestJoin = async (_pool: Pool) => {
    if (!user) {
      showToast('Sign in to join pools.');
      setTimeout(() => navigate(`/login?next=${encodeURIComponent('/browse')}`), 1500);
      return;
    }
    await new Promise((r) => setTimeout(r, 1200));
    setSelectedPool(null);
    showToast('Request sent. Waiting for approval.');
  };

  const clearFilters = () => {
    setFilter('all');
    setSort('recent');
    setSearch('');
    setDebouncedSearch('');
    refetch();
  };

  return (
    <div className="space-y-7">
      {/* â”€â”€â”€ Page Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div>
        <h1 className="font-display font-bold text-[28px] tracking-tight text-foreground">
          Browse Pools
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Find and join subscription pools to save on your favorite platforms.
        </p>
      </div>

      <ActivationChecklist />

      {/* â”€â”€â”€ Stats Row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative">
          <StatCard
            label="OPEN POOLS"
            value={formatStat(openPoolsCount, 142)}
            sub="â†‘ 12 new today"
            subVariant="success"
            accentTop
            live
          />
          <StatCard
            label="PLATFORMS"
            value={formatStat(platformsCount, 28)}
            sub="entertainment + work + ai"
            accentTop
          />
          <StatCard
            label="AVG. SAVINGS"
            value={formatStat(savingsCount, 67, 'percent')}
            sub="vs solo pricing"
            subVariant="success"
            accentTop
          />
          <StatCard
            label="MEMBERS"
            value={formatStat(membersCount, 3241)}
            sub="â†‘ 847 this month"
            subVariant="success"
          />

          <Insight id="browse-stats" activeStep={1} className="-top-10 left-1/2 -translate-x-1/2" />
        </div>
      )}

      <style>{`
        .demo-mode .pool-card {
          animation: cardSlideIn 400ms ease-out both;
        }
        .demo-mode .pool-card:nth-child(1) { animation-delay: 0ms; }
        .demo-mode .pool-card:nth-child(2) { animation-delay: 60ms; }
        .demo-mode .pool-card:nth-child(3) { animation-delay: 120ms; }
        .demo-mode .pool-card:nth-child(4) { animation-delay: 180ms; }
        .demo-mode .pool-card:nth-child(5) { animation-delay: 240ms; }
        .demo-mode .pool-card:nth-child(6) { animation-delay: 300ms; }
        .demo-mode .pool-card:nth-child(7) { animation-delay: 360ms; }
        .demo-mode .pool-card:nth-child(8) { animation-delay: 420ms; }
        @keyframes cardSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* â”€â”€â”€ Market Intelligence Row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <MarketIntelligenceRow />

      {/* â”€â”€â”€ Filter Row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="sticky top-[60px] z-20 flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-background/90 backdrop-blur-md border-y border-border/60 py-2 px-2 -mx-2 rounded-[6px]">
        <div className="flex flex-wrap gap-2 items-center flex-1 overflow-x-auto pb-1">
          {CATEGORY_CHIPS.map((chip) => (
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

        <CurrencyToggle />

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as BrowseSortKey)}
          className="h-10 rounded-[6px] border border-border bg-card px-3 text-sm text-foreground"
          aria-label="Sort pools"
        >
          <option value="recent">Newest</option>
          <option value="price-asc">Lowest price</option>
          <option value="price-desc">Highest price</option>
        </select>

        {/* Search */}
        <div className="flex items-center gap-2 bg-card border border-border rounded-[6px] px-3 py-2 w-full sm:w-auto overflow-hidden">
          <span className="text-muted-foreground text-sm" role="img" aria-label="icon">ðŸ”</span>
          <input
            type="text"
            placeholder="Search platforms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 bg-transparent p-0 h-auto text-sm flex-1 sm:w-[180px] focus:outline-none text-foreground placeholder:text-muted-foreground"
          />
        </div>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 text-xs font-mono text-muted-foreground"
          >
            Clear ({activeFilterCount})
          </Button>
        )}
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {filtered.length} results
        </span>
      </div>

      {/* â”€â”€â”€ Pool Grid or Empty State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {
        loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => <PoolCardSkeleton key={i} />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((pool) => (
              <div key={pool.id} className="relative pool-card">
                <PoolCard
                  pool={pool}
                  onClick={(p) => {
                    track('pool_card_clicked', { poolId: p.id, platformId: p.platform });
                    setSelectedPool(p);
                  }}
                  animate={isDemo}
                />
                {pool.platform === 'netflix' && (
                  <Insight id="netflix-card" activeStep={3} className="top-1/2 -right-1/2 translate-x-4 -translate-y-1/2" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5 py-8">
            <EmptyState
              icon="🔭"
              title="No pools found"
              description="Try a different filter or search term to find what you're looking for."
              action={clearFilters}
              actionLabel="Clear filters"
            />
            {hasSearchFilter && (
              <div className="max-w-sm w-full rounded-xl border border-dashed border-primary/30 bg-primary/5 p-5 text-center">
                <p className="font-display font-semibold text-sm text-foreground mb-1">
                  Don't see what you need?
                </p>
                <p className="font-mono text-[11px] text-muted-foreground mb-4">
                  Post a wishlist request and get notified when a host offers a slot.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-primary/40 text-primary hover:bg-primary/10 font-mono text-[11px] uppercase tracking-wider"
                  onClick={() => navigate('/wishlist')}
                >
                  ✨ Add to Wishlist
                </Button>
              </div>
            )}
          </div>
        )
      }

      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={loading}
            className="font-mono text-[11px] uppercase tracking-wider"
          >
            {loading ? 'Loading...' : 'Load more pools'}
          </Button>
        </div>
      )}

      {/* â”€â”€â”€ Pool Detail Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <PoolDetailModal
        pool={selectedPool}
        open={!!selectedPool}
        onClose={() => setSelectedPool(null)}
        onRequestJoin={handleRequestJoin}
      />

      {/* â”€â”€â”€ Inline Toast â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {
        toast.visible && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-lg bg-card border border-success text-foreground font-display text-sm shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
            {toast.message}
          </div>
        )
      }
    </div >
  );
}

