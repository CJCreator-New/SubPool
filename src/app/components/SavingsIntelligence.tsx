// src/app/components/SavingsIntelligence.tsx
import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, PieChart, ShieldCheck, Zap, ArrowRight, DollarSign } from 'lucide-react';
import { useUserSavingsQuery } from '../../lib/supabase/queries';
import { useAuth } from '../../lib/supabase/auth';
import { useCurrency } from '../../lib/currency-context';
import { cn } from './ui/utils';
import { Button } from './ui/button';

export function SavingsIntelligence() {
  const { user } = useAuth();
  const { data: savings, isLoading } = useUserSavingsQuery(user?.id);
  const { formatPrice } = useCurrency();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 bg-white/5 rounded-3xl border border-white/5" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-white/5 rounded-2xl border border-white/5" />
          <div className="h-24 bg-white/5 rounded-2xl border border-white/5" />
        </div>
      </div>
    );
  }

  if (!savings || savings.details.length === 0) {
    return (
      <div className="p-10 rounded-[32px] bg-white/[0.02] border border-white/5 text-center space-y-4">
        <div className="size-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
          <DollarSign size={32} className="text-muted-foreground/40" />
        </div>
        <h3 className="font-display font-black text-xl uppercase tracking-tighter">No Savings Data</h3>
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest max-w-[260px] mx-auto">
          Initialize your first node to begin tracking network-wide cost efficiency.
        </p>
        <Button variant="outline" className="mt-4 font-mono text-[10px] uppercase tracking-widest" onClick={() => window.location.hash = '/browse'}>
          Explore Nodes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Stats Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden p-8 rounded-[32px] bg-primary/10 border border-primary/20 shadow-glow-primary"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <TrendingUp size={160} />
        </div>
        
        <div className="relative space-y-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary/60">Total Monthly Savings</p>
          <div className="flex items-baseline gap-2">
            <h2 className="font-display font-black text-6xl tracking-tighter text-foreground drop-shadow-md">
              {formatPrice(savings.monthlySavings)}
            </h2>
            <span className="font-mono text-xs text-primary font-black uppercase">/ mo</span>
          </div>
          <div className="flex items-center gap-2 pt-4">
            <div className="bg-success/20 text-success px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-widest border border-success/30 flex items-center gap-1.5">
              <Zap size={10} fill="currentColor" />
              Efficiency: {savings.savingsPct.toFixed(0)}%
            </div>
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-tighter">vs {formatPrice(savings.totalMonthlyRetail)} retail</p>
          </div>
        </div>
      </motion.div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChart size={14} className="text-primary" />
                <span className="font-mono text-[10px] font-black uppercase tracking-widest">Asset Breakdown</span>
              </div>
            </div>
            <div className="space-y-3">
              {savings.details.map((d, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="space-y-0.5">
                    <p className="font-display font-bold text-[12px] uppercase tracking-tight">{d.platform}</p>
                    <p className="font-mono text-[9px] text-muted-foreground uppercase">Joined {new Date(d.joinedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[11px] font-black text-success">+{formatPrice(d.savings)}</p>
                    <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest line-through opacity-40">{formatPrice(d.retail)}</p>
                  </div>
                </div>
              ))}
            </div>
         </div>

         <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-primary" />
                <span className="font-mono text-[10px] font-black uppercase tracking-widest">Savings Intelligence</span>
              </div>
              <p className="text-[10px] text-muted-foreground font-mono leading-relaxed uppercase">
                Your nodes are currently operating at a {savings.savingsPct.toFixed(0)}% yield increase compared to standard retail acquisition. SubPool protocol has neutralized {formatPrice(savings.monthlySavings)} of monthly overhead.
              </p>
            </div>
            
            <Button variant="outline" className="w-full mt-6 h-12 rounded-xl font-mono text-[10px] uppercase tracking-widest group">
              View Detailed Ledger <ArrowRight size={14} className="ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
         </div>
      </div>
    </div>
  );
}
