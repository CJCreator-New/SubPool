import React from 'react';
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
  Activity,
  Zap,
  ShieldCheck,
  Globe,
  Lock,
  ArrowUpRight,
  Coins,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../../lib/supabase/auth';
import { PremiumCard, MagneticButton } from '../components/premium-ui';
import { NumberTicker } from '../components/subpool-components';
import { cn } from '../components/ui/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useCurrency } from '../../lib/currency-context';

type Demand = 'hot' | 'rising' | 'stable';

type PlatformMarketData = {
  name: string;
  demand: Demand;
  avgPriceCents: number;
  fillTime: string;
  activePools: number;
  forecast: string;
  volatility: number;
};

const platformMarketData: PlatformMarketData[] = [
  { name: 'Figma', demand: 'hot', avgPriceCents: 620, fillTime: '1.2 days', activePools: 124, forecast: 'Bullish (+8%)', volatility: 12 },
  { name: 'Netflix', demand: 'rising', avgPriceCents: 350, fillTime: '0.8 days', activePools: 412, forecast: 'Stable', volatility: 5 },
  { name: 'Spotify', demand: 'stable', avgPriceCents: 410, fillTime: '2.1 days', activePools: 189, forecast: 'Neutral', volatility: 3 },
  { name: 'YouTube', demand: 'rising', avgPriceCents: 290, fillTime: '1.5 days', activePools: 256, forecast: 'Bullish (+5%)', volatility: 8 },
  { name: 'ChatGPT Plus', demand: 'hot', avgPriceCents: 500, fillTime: '0.5 days', activePools: 86, forecast: 'Hyper-Demand', volatility: 22 },
  { name: 'Adobe CC', demand: 'stable', avgPriceCents: 1240, fillTime: '3.4 days', activePools: 67, forecast: 'Consolidating', volatility: 4 },
  { name: 'Notion', demand: 'rising', avgPriceCents: 480, fillTime: '1.9 days', activePools: 143, forecast: 'Bullish (+12%)', volatility: 15 },
  { name: 'GitHub', demand: 'stable', avgPriceCents: 400, fillTime: '2.5 days', activePools: 92, forecast: 'Neutral', volatility: 2 },
];

const arbitrageSignals = [
    { platform: 'Netflix', regionA: 'TR (Turkey)', regionB: 'US (Global)', spread: '68%', signal: 'STRONG BUY' },
    { platform: 'YouTube Premium', regionA: 'IN (India)', regionB: 'UK', spread: '82%', signal: 'STRONG BUY' },
    { platform: 'ChatGPT', regionA: 'Global', regionB: 'Enterprise', spread: '15%', signal: 'NEUTRAL' },
    { platform: 'Figma Pro', regionA: 'Annual', regionB: 'Monthly', spread: '20%', signal: 'BUY' },
];

const globalParityData = [
    { region: 'United States', code: 'US', retailCents: 1999, subpoolCents: 450, savings: 77 },
    { region: 'United Kingdom', code: 'GB', retailCents: 1799, subpoolCents: 410, savings: 77 },
    { region: 'Germany', code: 'DE', retailCents: 1850, subpoolCents: 420, savings: 77 },
    { region: 'India', code: 'IN', retailCents: 649, subpoolCents: 149, savings: 77 },
    { region: 'Turkey', code: 'TR', retailCents: 350, subpoolCents: 90, savings: 74 },
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
  if (demand === 'hot') return 'text-primary border-primary/40 bg-primary/10 shadow-[0_0_10px_rgba(var(--primary-rgb),0.2)]';
  if (demand === 'rising') return 'text-success border-success/40 bg-success/10';
  return 'text-muted-foreground border-border bg-muted/20';
}

export function MarketIntelligence() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { formatPrice, currency } = useCurrency();
  const isPremium = profile?.plan === 'pro' || profile?.plan === 'host_plus';

  const [activeParityPlatform, setActiveParityPlatform] = React.useState('Netflix');

  return (
    <div className="relative max-w-7xl mx-auto p-6 space-y-12 bg-grid-technical min-h-screen scan-line">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 size-[600px] bg-primary/5 rounded-full blur-[160px] -z-10" />
      
      {!user && (
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/10 backdrop-blur-xl border border-primary/20 p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-glow-primary">
                <ShieldCheck size={24} />
            </div>
            <div>
              <p className="font-display font-black text-lg uppercase tracking-tight">External Data Terminal</p>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Sign in to unlock personalized alpha and node tracking.</p>
            </div>
          </div>
          <MagneticButton onClick={() => navigate('/login')} className="bg-primary text-primary-foreground font-display font-bold px-8 h-12 rounded-2xl shadow-glow-primary">
            Initialize Access
          </MagneticButton>
        </motion.div>
      )}

      {!isPremium && (
        <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-background/60 backdrop-blur-xl p-8 text-center">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full glass border-primary/20 bg-surface-gradient shadow-glow-primary rounded-[32px] p-10"
            >
                <div className="size-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                    <Lock size={32} className="text-primary" />
                </div>
                <h1 className="font-display font-black text-3xl mb-3 tracking-tighter uppercase italic">Protocol Locked</h1>
                <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest leading-relaxed mb-10">
                    Market Intelligence and Arbitrage Signals are reserved for <b>Pro</b> and <b>Host Plus</b> operators.
                </p>
                <div className="space-y-4">
                    <Button 
                        className="w-full bg-primary text-black font-display font-black uppercase text-xs h-14 rounded-2xl shadow-glow-primary border-none"
                        onClick={() => navigate('/plans')}
                    >
                        Upgrade Pipeline
                    </Button>
                    <Button 
                        variant="ghost" 
                        className="w-full font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                        onClick={() => navigate('/dashboard')}
                    >
                        Return to Public Node
                    </Button>
                </div>
            </motion.div>
        </div>
      )}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-4 border-b border-white/5">
        <div>
          <h1 className="font-display font-black text-5xl tracking-tighter text-foreground italic uppercase">Market Alpha</h1>
          <div className="flex items-center gap-2 mt-3">
             <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-[0.3em]">Global Subscription Liquidity & Yield Analysis</p>
             <div className="size-2 rounded-full bg-primary shadow-glow-primary animate-pulse" />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
             <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
                <p className="font-mono text-[8px] text-muted-foreground uppercase tracking-widest mb-1">Index Health</p>
                <div className="flex items-center gap-2">
                    <Activity size={12} className="text-primary" />
                    <span className="font-display font-black text-sm">99.4%</span>
                </div>
             </div>
             <MagneticButton onClick={() => navigate('/list')} className="bg-white/5 hover:bg-white/10 text-foreground border border-white/10 rounded-2xl px-6 h-14 font-display font-bold flex items-center gap-2">
                Provision Pool <ArrowRight size={16} />
             </MagneticButton>
        </div>
      </header>

      {/* ─── Core Metrics Section ────────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <Card className="bg-card/40 border-border/50 border-technical p-6 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-5">
                <Users size={48} />
            </div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Network Nodes</p>
            <div className="text-4xl font-display font-black tracking-tighter group-hover:text-primary transition-colors">
                <NumberTicker value={1248} />
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-primary font-mono text-[10px]">
                <TrendingUp size={10} />
                <span>+12.4% vs prev week</span>
            </div>
         </Card>
         <Card className="bg-card/40 border-border/50 border-technical p-6 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-5">
                <RefreshCw size={48} />
            </div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Clearing Velocity</p>
            <div className="text-4xl font-display font-black tracking-tighter group-hover:text-primary transition-colors">
                <NumberTicker value={1.2} />
                <span className="text-sm ml-1 text-muted-foreground">DAYS</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-primary font-mono text-[10px]">
                <Zap size={10} />
                <span>Optimization active</span>
            </div>
         </Card>
         <Card className="bg-card/40 border-border/50 border-technical p-6 md:col-span-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Global Settlement Confidence</p>
            <div className="flex items-end justify-between relative z-10">
                <div className="space-y-1">
                    <p className="text-2xl font-display font-black text-success uppercase italic">Alpha State</p>
                    <p className="font-mono text-[10px] text-muted-foreground uppercase">Aggregated cross-region demand delta</p>
                </div>
                <div className="flex gap-1 items-end h-12">
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                        <motion.div 
                            key={i} 
                            initial={{ height: 0 }}
                            animate={{ height: Math.random() * 40 + 8 }}
                            transition={{ repeat: Infinity, repeatType: 'reverse', duration: 0.5 + Math.random() }}
                            className={cn("w-1.5 rounded-full", i < 10 ? "bg-primary shadow-glow-primary" : "bg-white/5")} 
                        />
                    ))}
                </div>
            </div>
         </Card>
      </section>

      {/* ─── Global Price Parity Analyzer (Phase 4.3) ────────────────────── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Coins className="text-primary size-5" />
                <h2 className="font-display font-black text-2xl tracking-tighter uppercase italic">Price Parity Analyzer</h2>
            </div>
            <div className="flex gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5">
                {['Netflix', 'Spotify', 'YouTube', 'Figma'].map(p => (
                    <button 
                        key={p}
                        onClick={() => setActiveParityPlatform(p)}
                        className={cn(
                            "px-4 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-widest transition-all",
                            activeParityPlatform === p ? "bg-primary text-black font-black" : "text-muted-foreground hover:bg-white/5"
                        )}
                    >
                        {p}
                    </button>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-8">
                <Card className="bg-card/40 border-border/50 border-technical overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="px-6 py-4 font-mono text-[10px] uppercase text-muted-foreground">Region / Locale</th>
                                    <th className="px-6 py-4 font-mono text-[10px] uppercase text-muted-foreground">Retail Premium</th>
                                    <th className="px-6 py-4 font-mono text-[10px] uppercase text-muted-foreground">SubPool Optimized</th>
                                    <th className="px-6 py-4 font-mono text-[10px] uppercase text-muted-foreground text-right">Net Savings</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {globalParityData.map((d, i) => (
                                    <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <MapPin size={14} className="text-muted-foreground/40" />
                                                <div>
                                                    <p className="font-display font-bold text-sm">{d.region}</p>
                                                    <p className="font-mono text-[9px] text-muted-foreground uppercase">{d.code} NODE</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs line-through opacity-40">{formatPrice(d.retailCents)}</td>
                                        <td className="px-6 py-4 font-mono text-sm font-black text-primary">{formatPrice(d.subpoolCents)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-display font-black text-success text-lg">{d.savings}%</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
            <div className="xl:col-span-4">
                <PremiumCard className="h-full flex flex-col justify-between p-8 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                    <div className="space-y-4">
                        <Badge className="bg-primary text-black font-mono text-[10px] uppercase font-black px-3 py-1">Optimal Arbitrage</Badge>
                        <h3 className="font-display font-black text-3xl uppercase italic tracking-tighter leading-none">Global <br />Yield Alpha</h3>
                        <p className="text-muted-foreground font-mono text-[11px] uppercase tracking-widest leading-loose">
                            Current arbitrage yield for <b>{activeParityPlatform}</b> is hovering at <b>74%</b> savings across active nodes. 
                            Proximity to TR/IN nodes recommended for maximum extraction.
                        </p>
                    </div>
                    <Button className="w-full bg-primary text-black font-display font-black uppercase text-xs h-12 rounded-2xl shadow-glow-primary border-none mt-8">
                        Deploy Protocol Node
                    </Button>
                </PremiumCard>
            </div>
        </div>
      </section>

      {/* ─── Arbitrage Signals Section (Phase 3.5) ───────────────────────── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Globe className="text-primary size-5" />
                <h2 className="font-display font-black text-2xl tracking-tighter uppercase italic">Arbitrage Signals</h2>
            </div>
            {!isPremium && (
                <Badge variant="outline" className="font-mono text-[10px] uppercase text-primary border-primary/20 bg-primary/5">
                    Premium Feature
                </Badge>
            )}
        </div>

        <Card className="bg-card/40 border-border/50 border-technical overflow-hidden relative">
            {!isPremium && (
                <div className="absolute inset-0 z-20 backdrop-blur-md bg-black/40 flex flex-col items-center justify-center text-center p-8">
                    <Lock size={32} className="text-primary mb-4" />
                    <h3 className="font-display font-black text-xl uppercase italic">Protocol Locked</h3>
                    <p className="font-mono text-[10px] text-muted-foreground max-w-xs mt-2 uppercase tracking-widest leading-loose">
                        Upgrade to <b>Host Plus</b> to access real-time regional spread data and arbitrage alerts.
                    </p>
                    <Button onClick={() => navigate('/plans')} className="mt-6 bg-primary text-black font-display font-bold px-8 h-12 rounded-xl border-none">
                        Upgrade Now
                    </Button>
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                            <th className="px-6 py-4 font-mono text-[10px] uppercase text-muted-foreground">Platform</th>
                            <th className="px-6 py-4 font-mono text-[10px] uppercase text-muted-foreground">Low Index (Origin)</th>
                            <th className="px-6 py-4 font-mono text-[10px] uppercase text-muted-foreground">Target Market</th>
                            <th className="px-6 py-4 font-mono text-[10px] uppercase text-muted-foreground text-right">Potential Spread</th>
                            <th className="px-6 py-4 font-mono text-[10px] uppercase text-muted-foreground text-right">Confidence</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {arbitrageSignals.map((signal, i) => (
                            <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-2 rounded-full bg-primary" />
                                        <span className="font-display font-bold text-sm text-foreground uppercase italic">{signal.platform}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{signal.regionA}</td>
                                <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{signal.regionB}</td>
                                <td className="px-6 py-4 text-right">
                                    <span className="font-display font-black text-success text-lg">+{signal.spread}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Badge className={cn("font-mono text-[9px] uppercase", signal.signal === 'STRONG BUY' ? "bg-success/20 text-success border-success/30" : "bg-white/10 text-muted-foreground")}>
                                        {signal.signal}
                                    </Badge>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
      </section>

      {/* ─── Platform Intelligence Cards ──────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {platformMarketData.map((platform) => (
          <PremiumCard key={platform.name} flareColor="rgba(255,255,255,0.05)" className="group">
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                   <h3 className="font-display font-black text-2xl tracking-tighter uppercase italic">{platform.name}</h3>
                   <div className="flex items-center gap-2 mt-1">
                        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Protocol Stats</p>
                        <span className="text-[10px] text-primary/70 font-mono">#{platform.volatility}% Vol</span>
                   </div>
                </div>
                <Badge className={cn("h-8 px-4 font-mono text-[10px] uppercase tracking-widest rounded-full border", demandClass(platform.demand))}>
                  <span className="inline-flex items-center gap-2">
                    <DemandIcon demand={platform.demand} />
                    {demandLabel(platform.demand)}
                  </span>
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 group-hover:border-primary/20 transition-colors">
                  <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-2">
                    <DollarSign size={10} className="text-primary" />
                    Slot
                  </p>
                  <p className="font-display font-black text-lg">{formatPrice(platform.avgPriceCents)}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 group-hover:border-primary/20 transition-colors">
                  <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-2">
                    <Clock3 size={10} className="text-primary" />
                    Fill
                  </p>
                  <p className="font-display font-black text-lg">{platform.fillTime.split(' ')[0]}d</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 group-hover:border-primary/20 transition-colors relative overflow-hidden">
                   <div className="relative z-10">
                        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-2">
                            <Users size={10} className="text-primary" />
                            Nodes
                        </p>
                        <p className="font-display font-black text-lg">{platform.activePools}</p>
                   </div>
                   {/* Mini background graph */}
                   <div className="absolute bottom-0 left-0 right-0 h-4 flex items-end gap-0.5 opacity-20 pointer-events-none">
                        {[1,2,3,4,5,6,7,8].map(i => (
                            <div key={i} className="flex-1 bg-primary" style={{ height: `${Math.random() * 100}%` }} />
                        ))}
                   </div>
                </div>
              </div>

              {/* Forecast Indicator */}
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                 <div className="flex items-center justify-between mb-2">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-primary/70">Future Forecast (30D)</p>
                    <ArrowUpRight size={12} className="text-primary" />
                 </div>
                 <p className="font-display font-black text-sm uppercase italic tracking-tight">{platform.forecast}</p>
              </div>

              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                 <p className="font-mono text-[9px] text-muted-foreground uppercase italic tracking-tighter">Optimal pricing band active</p>
                 <MagneticButton className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                    <ArrowRight size={16} />
                 </MagneticButton>
              </div>
            </div>
          </PremiumCard>
        ))}
      </section>

      <footer className="pt-12 border-b border-white/5 pb-12 text-center">
         <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.4em] opacity-40">
            End of Intelligence Transmission · Version 6.0.0-Alpha
         </p>
      </footer>
    </div>
  );
}
