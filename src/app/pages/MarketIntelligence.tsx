import { useNavigate } from 'react-router';
import {
  ArrowRight,
  BarChart3,
  Clock3,
  DollarSign,
  Flame,
  Minus,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

type Demand = 'hot' | 'rising' | 'stable';

type PlatformMarketData = {
  name: string;
  demand: Demand;
  avgPrice: number;
  fillTime: string;
  activePools: number;
};

const platformMarketData: PlatformMarketData[] = [
  { name: 'Figma', demand: 'hot', avgPrice: 6.2, fillTime: '1.2 days', activePools: 124 },
  { name: 'Netflix', demand: 'rising', avgPrice: 3.5, fillTime: '0.8 days', activePools: 412 },
  { name: 'Spotify', demand: 'stable', avgPrice: 4.1, fillTime: '2.1 days', activePools: 189 },
  { name: 'YouTube', demand: 'rising', avgPrice: 2.9, fillTime: '1.5 days', activePools: 256 },
  { name: 'ChatGPT Plus', demand: 'hot', avgPrice: 5, fillTime: '0.5 days', activePools: 86 },
  { name: 'Adobe CC', demand: 'stable', avgPrice: 12.4, fillTime: '3.4 days', activePools: 67 },
  { name: 'Notion', demand: 'rising', avgPrice: 4.8, fillTime: '1.9 days', activePools: 143 },
  { name: 'GitHub', demand: 'stable', avgPrice: 4, fillTime: '2.5 days', activePools: 92 },
];

function DemandIcon({ demand }: { demand: Demand }) {
  if (demand === 'hot') return <Flame className="size-3.5" aria-hidden="true" />;
  if (demand === 'rising') return <TrendingUp className="size-3.5" aria-hidden="true" />;
  return <Minus className="size-3.5" aria-hidden="true" />;
}

function demandLabel(demand: Demand): string {
  if (demand === 'hot') return 'Hot';
  if (demand === 'rising') return 'Rising';
  return 'Stable';
}

function demandClass(demand: Demand): string {
  if (demand === 'hot') return 'text-primary border-primary/40 bg-primary/10';
  if (demand === 'rising') return 'text-success border-success/40 bg-success/10';
  return 'text-muted-foreground border-border bg-muted/20';
}

export function MarketIntelligence() {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-display font-black text-3xl md:text-4xl tracking-tight">Market Intelligence</h1>
          <p className="font-mono text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Real-time supply and demand snapshots across active SubPool listings.
          </p>
        </div>
        <Button onClick={() => navigate('/list')} className="w-full sm:w-auto">
          List a Pool
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </header>

      <Card className="border-dashed border-border bg-card/40">
        <CardContent className="p-4 sm:p-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-foreground">
            <BarChart3 className="size-4 text-primary" aria-hidden="true" />
            <p className="font-mono text-xs sm:text-sm">
              Data freshness: refreshed daily from live pool activity and fill outcomes.
            </p>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Confidence: medium
          </p>
        </CardContent>
      </Card>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {platformMarketData.map((platform) => (
          <Card key={platform.name} className="border-border hover:border-primary/30 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="font-display text-lg">{platform.name}</CardTitle>
                <Badge className={`font-mono text-[10px] uppercase tracking-wider border ${demandClass(platform.demand)}`}>
                  <span className="inline-flex items-center gap-1">
                    <DemandIcon demand={platform.demand} />
                    {demandLabel(platform.demand)}
                  </span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-md border border-border/60 bg-secondary/20 px-3 py-2">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <DollarSign className="size-3" aria-hidden="true" />
                    Avg Slot
                  </p>
                  <p className="font-mono font-semibold text-sm text-foreground mt-1">${platform.avgPrice.toFixed(2)}</p>
                </div>
                <div className="rounded-md border border-border/60 bg-secondary/20 px-3 py-2">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Clock3 className="size-3" aria-hidden="true" />
                    Fill Time
                  </p>
                  <p className="font-mono font-semibold text-sm text-foreground mt-1">{platform.fillTime}</p>
                </div>
                <div className="rounded-md border border-border/60 bg-secondary/20 px-3 py-2">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Users className="size-3" aria-hidden="true" />
                    Active
                  </p>
                  <p className="font-mono font-semibold text-sm text-foreground mt-1">{platform.activePools}</p>
                </div>
              </div>
              <p className="font-mono text-[11px] text-muted-foreground">
                Suggested host action: keep pricing within this band for faster fill rates.
              </p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
