import * as React from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter,
  SheetTrigger,
  SheetClose
} from './ui/sheet';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Filter, RotateCcw } from 'lucide-react';
import { cn } from './ui/utils';
import { PaywallModal } from './paywall-modal';

export type BrowseFilterKey = 'all' | 'OTT' | 'AI_IDE' | 'ai' | 'open' | 'creative';
export type BrowseSortKey = 'recent' | 'price-asc' | 'price-desc' | 'savings-desc';

export interface FilterState {
  category: BrowseFilterKey;
  status: 'all' | 'open';
  priceRange: [number, number];
  minRating: number;
}

interface AdvancedFilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
  resultCount: number;
  isPro?: boolean;
}

const CATEGORIES: { key: BrowseFilterKey; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: '🌐' },
  { key: 'OTT', label: 'OTT / Media', icon: '🎬' },
  { key: 'AI_IDE', label: 'AI & Dev Tools', icon: '💻' },
  { key: 'ai', label: 'AI Tools', icon: '🤖' },
  { key: 'creative', label: 'Creative', icon: '🎨' },
];

export function AdvancedFilterPanel({ 
  filters, 
  onFiltersChange, 
  onReset,
  resultCount,
  isPro = false
}: AdvancedFilterPanelProps) {
  const [paywallOpen, setPaywallOpen] = React.useState(false);
  const [tempFilters, setTempFilters] = React.useState<FilterState>(filters);
  const activeCount = React.useMemo(() => {
    let count = 0;
    if (filters.category !== 'all') count++;
    if (filters.status !== 'all') count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 100) count++;
    if (filters.minRating > 0) count++;
    return count;
  }, [filters]);

  // Sync temp filters when prop filters change
  React.useEffect(() => {
    setTempFilters(filters);
  }, [filters]);

  const handleApply = () => {
    onFiltersChange(tempFilters);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="h-10 rounded-xl font-mono text-[10px] uppercase tracking-widest gap-2 relative">
          <Filter size={14} />
          Refine Search
          {activeCount > 0 && (
            <Badge variant="default" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
              {activeCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md border-l border-border/50 bg-background/95 backdrop-blur-xl">
        <SheetHeader className="pb-6 border-b border-border/50">
          <SheetTitle className="font-display font-black text-2xl tracking-tight">Calibration</SheetTitle>
          <SheetDescription className="font-mono text-[10px] uppercase tracking-widest">
            Adjust filters to locate optimal subscription nodes
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-8 overflow-y-auto max-h-[calc(100vh-200px)] px-1">
          {/* Categories */}
          <div className="space-y-4">
            <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Category Cluster</Label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setTempFilters(prev => ({ ...prev, category: cat.key }))}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-200",
                    tempFilters.category === cat.key
                      ? "bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]"
                      : "bg-card/40 border-border hover:border-muted-foreground/30"
                  )}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span className="font-display font-bold text-xs">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-card/40 border border-border">
            <div className="space-y-0.5">
              <Label className="font-display font-bold text-sm">Open Nodes Only</Label>
              <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">Hide full or closed pools</p>
            </div>
            <Switch 
              checked={tempFilters.status === 'open'}
              onCheckedChange={(checked) => setTempFilters(prev => ({ ...prev, status: checked ? 'open' : 'all' }))}
            />
          </div>

          {/* Price Range */}
          <div className={cn("space-y-6 relative", !isPro && "opacity-50 pointer-events-none")}>
            {!isPro && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/5 rounded-xl border border-dashed border-primary/20 backdrop-blur-[1px]">
                <Button variant="outline" size="sm" onClick={() => setPaywallOpen(true)} className="h-8 text-[9px] font-mono gap-1.5 shadow-xl">
                  <span>🔒</span> UNLOCK PRICE CALIBRATION
                </Button>
              </div>
            )}
            <div className="flex justify-between items-end">
              <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Price Calibration (USD/mo)</Label>
              <span className="font-mono text-xs font-bold text-primary">
                ${tempFilters.priceRange[0]} — ${tempFilters.priceRange[1]}
              </span>
            </div>
            <Slider 
              min={0}
              max={100}
              step={1}
              value={tempFilters.priceRange}
              onValueChange={(val) => setTempFilters(prev => ({ ...prev, priceRange: val as [number, number] }))}
              className="py-4"
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-mono text-muted-foreground">MIN</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">$</span>
                  <Input 
                    type="number" 
                    value={tempFilters.priceRange[0]}
                    onChange={(e) => setTempFilters(prev => ({ ...prev, priceRange: [Number(e.target.value), prev.priceRange[1]] }))}
                    className="pl-6 h-9 text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-mono text-muted-foreground">MAX</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">$</span>
                  <Input 
                    type="number" 
                    value={tempFilters.priceRange[1]}
                    onChange={(e) => setTempFilters(prev => ({ ...prev, priceRange: [prev.priceRange[0], Number(e.target.value)] }))}
                    className="pl-6 h-9 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Host Rating */}
          <div className={cn("space-y-4 relative", !isPro && "opacity-50 pointer-events-none")}>
            {!isPro && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/5 rounded-xl border border-dashed border-primary/20 backdrop-blur-[1px]">
                <Button variant="outline" size="sm" onClick={() => setPaywallOpen(true)} className="h-8 text-[9px] font-mono gap-1.5 shadow-xl">
                  <span>🔒</span> UNLOCK TRUST FILTERS
                </Button>
              </div>
            )}
            <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Host Trust Threshold</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setTempFilters(prev => ({ ...prev, minRating: star }))}
                  className={cn(
                    "w-10 h-10 rounded-lg border flex items-center justify-center transition-all",
                    tempFilters.minRating >= star
                      ? "bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.1)]"
                      : "bg-card/40 border-border text-muted-foreground/40"
                  )}
                >
                  <span className="text-sm">★</span>
                </button>
              ))}
              <span className="ml-2 font-mono text-xs text-muted-foreground">{tempFilters.minRating}+ Stars</span>
            </div>
          </div>
        </div>

        <SheetFooter className="pt-6 border-t border-border/50 sm:flex-col gap-3">
          <div className="flex items-center justify-between w-full mb-2">
             <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{resultCount} systems located</span>
             <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                onReset();
                setTempFilters({
                  category: 'all',
                  status: 'all',
                  priceRange: [0, 100],
                  minRating: 0
                });
              }}
              className="h-8 text-[9px] font-mono uppercase tracking-widest gap-1.5"
             >
              <RotateCcw size={10} /> Reset
             </Button>
          </div>
          <SheetClose asChild>
            <Button onClick={handleApply} className="w-full h-12 font-display font-black tracking-widest uppercase">
              Apply Calibration
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
      <PaywallModal
        feature="Advanced Filters"
        requiredPlan="pro"
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
      />
    </Sheet>
  );
}
