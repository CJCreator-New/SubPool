import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { cn } from './ui/utils';

export type BrowseFilterKey = 'all' | 'entertainment' | 'work' | 'ai' | 'open' | 'creative';
export type BrowseSortKey = 'recent' | 'price-asc' | 'price-desc';

type FilterChip = {
  key: BrowseFilterKey;
  label: string;
};

const CATEGORY_CHIPS: FilterChip[] = [
  { key: 'all', label: 'All Pools' },
  { key: 'open', label: 'Open only' },
  { key: 'entertainment', label: 'Entertainment' },
  { key: 'work', label: 'Team SaaS' },
  { key: 'ai', label: 'AI Tools' },
  { key: 'creative', label: 'Creative' },
];

type FilterPanelProps = {
  filter: BrowseFilterKey;
  search: string;
  sort: BrowseSortKey;
  activeFilterCount: number;
  resultCount: number;
  onFilterChange: (filter: BrowseFilterKey) => void;
  onSearchChange: (search: string) => void;
  onSortChange: (sort: BrowseSortKey) => void;
  onClear: () => void;
};

export function FilterPanel({
  filter,
  search,
  sort,
  activeFilterCount,
  resultCount,
  onFilterChange,
  onSearchChange,
  onSortChange,
  onClear,
}: FilterPanelProps) {
  return (
    <div className="sticky top-[60px] z-20 rounded-[10px] border border-border/60 bg-background/90 px-3 py-3 backdrop-blur-md">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {CATEGORY_CHIPS.map((chip) => (
            <button
              key={chip.key}
              onClick={() => onFilterChange(chip.key)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-xs font-display font-bold transition-all',
                filter === chip.key
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground',
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto_auto] md:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="browse-search" className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Search
            </Label>
            <Input
              id="browse-search"
              type="text"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search platforms, plans, or categories..."
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="browse-sort" className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Sort
            </Label>
            <select
              id="browse-sort"
              value={sort}
              onChange={(event) => onSortChange(event.target.value as BrowseSortKey)}
              className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground"
            >
              <option value="recent">Newest</option>
              <option value="price-asc">Lowest price</option>
              <option value="price-desc">Highest price</option>
            </select>
          </div>

          <div className="flex items-center gap-2 md:justify-end">
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                className="h-10 text-xs font-mono text-muted-foreground"
              >
                Clear ({activeFilterCount})
              </Button>
            )}
          </div>

          <div className="flex items-center md:justify-end">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {resultCount} results
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
