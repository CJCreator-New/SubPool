// ─── BrowsePools Page ──────────────────────────────────────────────────────────
// Filterable grid of pool cards with stats, search, and detail modal.

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { motion, AnimatePresence } from 'motion/react';
import { StatCard } from '../components/subpool-components';
import { PoolCard } from '../components/subpool/PoolCard';
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
import { useNavigate, useSearchParams } from 'react-router';
import { Insight, useDemo } from '../components/demo-mode';
import { useCountUp } from '../../hooks/useCountUp';
import { useCurrency } from '../../lib/currency-context';
import { CurrencyToggle } from '../components/currency-toggle';
import { ActivationChecklist } from '../components/activation-checklist';
import { AdvancedFilterPanel, type FilterState, type BrowseFilterKey, type BrowseSortKey } from '../components/advanced-filter-panel';
import { useInfinitePoolsQuery } from '../../lib/supabase/queries';

// ─── Filter constants ─────────────────────────────────────────────────────────

const FILTER_VALUES: BrowseFilterKey[] = ['all', 'OTT', 'AI_IDE', 'ai', 'open', 'creative'];
const SORT_VALUES: BrowseSortKey[] = ['recent', 'price-asc', 'price-desc'];
const CATEGORY_CHIPS: { key: BrowseFilterKey; label: string }[] = [
  { key: 'all', label: 'All Pools' },
  { key: 'open', label: 'Open only' },
  { key: 'OTT', label: 'OTT / Media' },
  { key: 'AI_IDE', label: 'AI & Dev Tools' },
  { key: 'ai', label: 'AI Tools' },
  { key: 'creative', label: 'Creative' },
];

const INITIAL_FILTERS: FilterState = {
  category: 'all',
  status: 'all',
  priceRange: [0, 100],
  minRating: 0
};

// ─── Toast helper (inline) ──────────────────────────────────────────────────

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

// ─── Market Intelligence Component ────────────────────────────────────────────

const TOP_PLATFORMS = [
  { id: 'netflix', plan: '4K', name: 'Netflix' },
  { id: 'chatgpt', plan: 'Plus', name: 'ChatGPT' },
  { id: 'figma', plan: 'Professional', name: 'Figma' },
  { id: 'spotify', plan: 'Family', name: 'Spotify' },
  { id: 'youtube', plan: 'Family', name: 'YouTube' }
];

// ─── Level 3: typed market metric entry (replaces `any[]`) ────────────────────
interface MarketMetricEntry {
  id: string;
  plan: string;
  name: string;
  avg: number;
  solo: number;
  savingsPct: number;
  count: number;
}

function MarketIntelligenceRow() {
  const [expanded, setExpanded] = useState(false);
  const [metrics, setMetrics] = useState<MarketMetricEntry[]>([]);
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
  }, [expanded, isDataLoaded, currency]);

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
        📊 See market rates {expanded ? '▲' : '▼'}
        {isFree && <span className="ml-2 text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">PRO</span>}
      </Button>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative overflow-hidden"
          >
            <div className={`flex overflow-x-auto gap-3 pb-2 snap-x hide-scrollbar ${isFree ? 'focus-within:blur-none transition-all' : ''}`}>
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
                      <p className="font-mono text-[13px] text-primary">Avg: {formatPrice(m.avg)}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">vs {formatPrice(m.solo)} solo</p>
                      <p className="font-mono text-[10px] text-[#4DFF91]">Saves {m.savingsPct.toFixed(0)}%</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {isFree && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/40 backdrop-blur-[2px] rounded-lg border border-primary/20 p-4 text-center z-10">
                <span className="text-xl mb-2" role="img" aria-label="icon">📊</span>
                <p className="font-display font-bold text-sm mb-1">Market Intelligence</p>
                <p className="font-mono text-[10px] text-muted-foreground mb-4 max-w-[200px]">Unlock real-time market averages and demand tracking with Pro.</p>
                <Button size="sm" onClick={() => setPaywallOpen(true)} className="h-8 text-[10px] font-display font-bold px-4">
                  Unlock Now
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <PaywallModal
        feature="Market Intelligence"
        requiredPlan="pro"
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
      />
    </div>
  );
}

export function BrowsePools() {
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') as BrowseFilterKey;
  const initialSort = searchParams.get('sort') as BrowseSortKey;
  const initialSearch = searchParams.get('q') ?? '';
  
  const [filters, setFilters] = useState<FilterState>({
    category: FILTER_VALUES.includes(initialFilter) ? initialFilter : 'all',
    status: searchParams.get('status') === 'open' ? 'open' : 'all',
    priceRange: [
      Number(searchParams.get('min_price') ?? 0),
      Number(searchParams.get('max_price') ?? 100)
    ],
    minRating: Number(searchParams.get('min_rating') ?? 0)
  });

  const [sort, setSort] = useState<BrowseSortKey>(
    SORT_VALUES.includes(initialSort) ? initialSort : 'recent',
  );
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const { isDemo } = useDemo();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const nextParams = new URLSearchParams();
    if (filters.category !== 'all') nextParams.set('filter', filters.category);
    if (filters.status === 'open') nextParams.set('status', 'open');
    if (filters.priceRange[0] > 0) nextParams.set('min_price', String(filters.priceRange[0]));
    if (filters.priceRange[1] < 100) nextParams.set('max_price', String(filters.priceRange[1]));
    if (filters.minRating > 0) nextParams.set('min_rating', String(filters.minRating));
    if (debouncedSearch.trim()) nextParams.set('q', debouncedSearch.trim());
    if (sort !== 'recent') nextParams.set('sort', sort);
    
    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [debouncedSearch, filters, sort, setSearchParams]);

  const { 
    data: infiniteData, 
    fetchNextPage, 
    hasNextPage, 
    isFetching, 
    isFetchingNextPage,
    refetch 
  } = useInfinitePoolsQuery({
    search: debouncedSearch,
    category: filters.category,
    status: filters.status,
    minPrice: filters.priceRange[0] * 100,
    maxPrice: filters.priceRange[1] * 100,
    minRating: filters.minRating
  });

  const pagedPoolsItems = useMemo(() => {
    return infiniteData?.pages.flatMap(page => page.items) || [];
  }, [infiniteData]);

  const loading = isFetching && !isFetchingNextPage;
  const loadMore = () => fetchNextPage();
  const hasMore = hasNextPage;

  const { toast, show: showToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

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

  const filtered = React.useMemo(() => {
    return [...pagedPoolsItems].sort((a, b) => {
      if (sort === 'price-asc') return a.price_per_slot - b.price_per_slot;
      if (sort === 'price-desc') return b.price_per_slot - a.price_per_slot;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [pagedPoolsItems, sort]);

  const [columns, setColumns] = useState(3);
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth >= 1024) setColumns(3);
      else if (window.innerWidth >= 768) setColumns(2);
      else setColumns(1);
    };
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  const rowCount = Math.ceil(filtered.length / columns);

  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => 450, // Average height of PoolCard
    overscan: 2,
    scrollMargin: parentRef.current?.offsetTop ?? 0,
  });

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
    setFilters(INITIAL_FILTERS);
    setSort('recent');
    setSearch('');
    setDebouncedSearch('');
    refetch();
  };

  const containerVariants = React.useMemo(() => ({
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  }), []);

  return (
    <div className="space-y-8 pb-10 overflow-x-hidden">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tight text-foreground drop-shadow-sm">
          Browse Pools
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base mt-2 max-w-2xl">
          Secure nodes in high-utility subscription pipelines. Filter by category, verify hosts, and optimize your monthly overhead.
        </p>
      </motion.div>

      <ActivationChecklist />

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading && !pagedPoolsItems.length ? (
          [1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="OPEN POOLS" value={formatStat(openPoolsCount, 142)} sub="↑ 12 new today" subVariant="success" accentTop live />
            <StatCard label="PLATFORMS" value={formatStat(platformsCount, 28)} sub="multi-category" accentTop />
            <StatCard label="AVG. SAVINGS" value={formatStat(savingsCount, 67, 'percent')} sub="vs solo pricing" subVariant="success" accentTop />
            <StatCard label="MEMBERS" value={formatStat(membersCount, 3241)} sub="↑ 847 this month" subVariant="success" />
          </>
        )}
      </div>

      <MarketIntelligenceRow />

      {/* Filter Row */}
      <div className="sticky top-[64px] z-30 flex flex-col lg:flex-row gap-4 items-start lg:items-center bg-background/80 backdrop-blur-xl border border-border/40 py-3 px-4 rounded-2xl shadow-sm">
        <div className="flex flex-wrap gap-2 items-center flex-1">
          {CATEGORY_CHIPS.map((chip) => (
            <button
              key={chip.key}
              onClick={() => setFilters(prev => ({ ...prev, category: chip.key }))}
              className={cn(
                'rounded-full border px-4 py-1.5 text-xs font-display font-bold transition-all duration-300',
                filters.category === chip.key
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                  : 'border-border bg-card/40 text-muted-foreground hover:border-primary/40 hover:text-foreground',
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div className="flex w-full lg:w-auto items-center gap-3">
            <CurrencyToggle />
            
            <AdvancedFilterPanel 
              filters={filters}
              onFiltersChange={setFilters}
              onReset={clearFilters}
              resultCount={pagedPoolsItems.length || 0}
              isPro={profile?.plan !== 'free' && !!profile}
            />

            <select
                value={sort}
                onChange={(e) => setSort(e.target.value as BrowseSortKey)}
                className="h-10 rounded-xl border border-border bg-card/50 px-4 text-sm text-foreground font-mono focus:ring-1 focus:ring-primary focus:outline-none"
                aria-label="Sort pools"
            >
                <option value="recent">Newest Arrival</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="savings-desc">Maximum Savings %</option>
            </select>

            <div className="flex items-center gap-2 bg-card/50 border border-border rounded-xl px-4 py-2 flex-1 lg:w-64">
                <span className="text-muted-foreground text-sm opacity-50">🔍</span>
                <input
                    type="text"
                    placeholder="Search systems..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border-0 bg-transparent p-0 text-sm focus:outline-none w-full text-foreground placeholder:text-muted-foreground/50"
                />
            </div>
        </div>
      </div>

      {/* Guest CTA Banner */}
      {!user && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-primary/10 border border-primary/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="space-y-2 text-center md:text-left">
            <h3 className="font-display font-black text-xl text-foreground">Unlock your full potential</h3>
            <p className="text-muted-foreground text-sm max-w-md">Join over 3,200+ members saving up to 75% on premium subscriptions. Create a free account to join these pools.</p>
          </div>
          <Button size="lg" onClick={() => navigate('/login')} className="h-14 px-8 rounded-2xl font-display font-bold text-base shadow-xl shadow-primary/20 shrink-0">
            Get Started — It's Free
          </Button>
        </motion.div>
      )}

      {/* Pool Grid with Virtualization */}
      <div 
        ref={parentRef}
        className="relative w-full"
        style={{
          height: `${virtualizer.getTotalSize()}px`,
        }}
      >
        {loading && !filtered.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => <PoolCardSkeleton key={i} />)}
          </div>
        ) : filtered.length > 0 ? (
          virtualizer.getVirtualItems().map((virtualRow) => {
            const start = virtualRow.index * columns;
            const rowItems = filtered.slice(start, start + columns);

            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                className="absolute top-0 left-0 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                style={{
                  transform: `translateY(${virtualRow.start}px)`,
                  paddingBottom: '24px' // Gap simulation
                }}
              >
                {rowItems.map((pool, idx) => (
                  <motion.div
                    key={pool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <PoolCard
                      pool={pool}
                      index={start + idx}
                      onClick={(p) => {
                        track('pool_card_clicked', { poolId: p.id });
                        setSelectedPool(p);
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            );
          })
        ) : (
          <div className="py-20 bg-card/30 rounded-3xl border border-dashed border-border flex justify-center items-center w-full">
            <EmptyState
              icon="🔭"
              title="Pipeline empty"
              description="No pools match your current calibration. Reset filters to recalibrate."
              action={clearFilters}
              actionLabel="Reset System"
            />
          </div>
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-8">
          <Button variant="outline" onClick={loadMore} disabled={loading} className="font-mono text-xs uppercase tracking-widest px-8 h-12 rounded-xl group overflow-hidden relative">
            <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity" />
            {loading ? 'Propagating...' : 'Load legacy nodes'}
          </Button>
        </div>
      )}

      <PoolDetailModal
        pool={selectedPool}
        open={!!selectedPool}
        onClose={() => setSelectedPool(null)}
        onRequestJoin={handleRequestJoin}
      />

      <AnimatePresence>
        {toast.visible && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl bg-card border border-primary shadow-3xl text-foreground font-display font-bold shadow-[0_0_50px_rgba(0,0,0,0.4)] backdrop-blur-md"
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
