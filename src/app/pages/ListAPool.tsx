import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Activity, ArrowRight } from 'lucide-react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription, 
    DialogFooter 
} from '../components/ui/dialog';
import { PremiumCard } from '../components/premium-ui';
import { PlatformIcon } from '../components/subpool-components';
import { PaywallModal } from '../components/paywall-modal';
import { PLATFORMS } from '../../lib/constants';
import { createPool } from '../../lib/supabase/mutations';
import type { PoolCategory } from '../../lib/types';
import { useAuth } from '../../lib/supabase/auth';
import { useMyPoolsQuery } from '../../lib/supabase/queries';
import { checkPlanAccess, getUpgradeMessage } from '../../lib/gating';
import { getPlatformSharingNote, analyzePricing, getSuggestion, getPricingData } from '../../lib/pricing-service';
import { PLATFORM_PRICING_SEED } from '../../lib/pricing-seed';
import type { PlatformPricing } from '../../lib/pricing-seed';
import { track } from '../../lib/analytics';
import { useCurrency } from '../../lib/currency-context';
import { CurrencyToggle } from '../components/currency-toggle';
import { getUserFacingError } from '../../lib/error-feedback';

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2 mb-10 max-w-sm mx-auto">
      {[1, 2, 3, 4].map((n) => (
        <React.Fragment key={n}>
          <div
            className={`
              w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-mono font-black transition-all duration-500
              ${step > n
                ? 'bg-primary/20 text-primary border border-primary/20 shadow-[0_0_15px_rgba(200,241,53,0.1)]'
                : step === n
                  ? 'bg-primary text-black shadow-glow-primary border-none'
                  : 'bg-white/5 border border-white/5 text-muted-foreground'
              }
            `}
          >
            {step > n ? '✓' : n}
          </div>
          {n < 4 && (
            <div
              className={`flex-1 h-[2px] transition-all duration-500 rounded-full ${step > n ? 'bg-primary/40' : 'bg-white/5'
                }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export function ListAPool() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [form, setForm] = useState({
    planName: '',
    totalCost: '',
    slots: '2',
    category: 'OTT' as PoolCategory,
    billingCycle: 'monthly' as 'monthly' | 'yearly',
    autoApprove: false,
    rules: '',
    visibility: 'public' as 'public' | 'private',
  });
  const { currency, symbol: sym } = useCurrency();
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPaywall, setShowPaywall] = useState(false);
  
  const { data: myPools } = useMyPoolsQuery(user?.id);
  const activePoolsCount = myPools?.length || 0;

  const updateForm = (key: string, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const platform = PLATFORMS.find((p) => p.id === selectedPlatform);

  const analysis = React.useMemo(() => {
    if (!selectedPlatform || !form.planName || !form.slots || !form.totalCost) return null;
    const totalCostNum = parseFloat(form.totalCost);
    const slotsNum = parseInt(form.slots);
    if (isNaN(totalCostNum) || isNaN(slotsNum) || slotsNum <= 0) return null;
    
    return analyzePricing({
      platformId: selectedPlatform,
      planName: form.planName,
      userSlotPrice: totalCostNum / slotsNum,
      totalSlots: slotsNum,
      currency: currency as 'USD' | 'INR',
      countryCode: currency === 'INR' ? 'IN' : 'US',
    });
  }, [selectedPlatform, form.planName, form.totalCost, form.slots, currency]);

  const handlePublish = async () => {
    if (!selectedPlatform || !platform || !user) return;

    const access = checkPlanAccess(profile, 'MAX_ACTIVE_POOLS', activePoolsCount);
    if (!access.allowed) {
      setShowPaywall(true);
      return;
    }

    setSubmitting(true);
    const slotPrice = parseFloat(form.totalCost) / parseInt(form.slots);
    const slotPriceCents = Math.round(slotPrice * 100);
    try {
      const result = await createPool({
        platform: selectedPlatform,
        owner_id: user.id,
        category: form.category,
        status: 'open',
        plan_name: form.planName,
        price_per_slot: slotPriceCents,
        total_slots: parseInt(form.slots),
        auto_approve: form.autoApprove,
        description: form.rules || null,
        visibility: form.visibility as any,
      });
      if (!result.success) throw result.error;
      navigate('/my-pools');
      toast.success('Protocol Node deployed successfully.');
    } catch (error) {
      toast.error(getUserFacingError(error, 'publish this pool').message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-white/5">
        <div>
          <h1 className="font-display font-black text-5xl tracking-tighter italic uppercase">Asset Selection</h1>
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mt-2">Initialize pool deployment by selecting a platform node.</p>
        </div>
        <div className="relative w-full md:w-80 group">
          <Input
            placeholder="FILTER PLATFORMS..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="h-12 bg-white/5 border-white/10 rounded-xl pl-4 font-mono text-xs focus:border-primary/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {PLATFORMS.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPlatform(p.id)}
            className={cn(
              "flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-500 group relative overflow-hidden",
              selectedPlatform === p.id 
                ? "border-primary bg-primary/10 shadow-glow-primary scale-[1.02]" 
                : "border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
            )}
          >
            <div className={cn(
              "size-12 rounded-xl mb-4 flex items-center justify-center text-2xl transition-all duration-500",
              selectedPlatform === p.id ? "bg-primary text-black" : "bg-white/5"
            )}>
              {p.icon}
            </div>
            <span className="font-mono text-[10px] font-black uppercase tracking-widest text-center">{p.name}</span>
            {selectedPlatform === p.id && (
              <motion.div layoutId="platform-active" className="absolute bottom-0 inset-x-0 h-1 bg-primary" />
            )}
          </button>
        ))}
      </div>
      
      <div className="flex justify-end pt-8">
        <Button 
          disabled={!selectedPlatform} 
          onClick={() => setStep(2)}
          className="h-14 px-10 font-display font-black uppercase tracking-widest rounded-2xl group shadow-glow-primary"
        >
          Proceed to Config <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-white/5">
        <div>
          <h1 className="font-display font-black text-5xl tracking-tighter italic uppercase">Configuration</h1>
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mt-2">Calibrate yield parameters and settlement cycles.</p>
        </div>
        <CurrencyToggle />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-8">
          <section className="p-10 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Activity size={120} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground ml-1">Plan Specification</Label>
                <Input 
                  value={form.planName} 
                  onChange={e => updateForm('planName', e.target.value)} 
                  placeholder="e.g. Ultra HD Premium"
                  className="h-14 bg-white/5 border-white/10 rounded-2xl font-display font-bold" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground ml-1">Sector Classification</Label>
                <Select value={form.category} onValueChange={v => updateForm('category', v)}>
                  <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-2xl font-display font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-black/90 backdrop-blur-xl border-white/10">
                    <SelectItem value="OTT">OTT / Media</SelectItem>
                    <SelectItem value="AI_IDE">AI & Dev Tools</SelectItem>
                    <SelectItem value="ai">AI Solutions</SelectItem>
                    <SelectItem value="Productivity">Productivity Suite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground ml-1">Total Payload Cost</Label>
                <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary font-black">{sym}</span>
                    <Input 
                      type="number" 
                      value={form.totalCost} 
                      onChange={e => updateForm('totalCost', e.target.value)} 
                      className="h-14 pl-12 bg-white/5 border-white/10 rounded-2xl font-display font-bold" 
                    />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground ml-1">Node Capacity (Slots)</Label>
                <Input 
                  type="number" 
                  value={form.slots} 
                  onChange={e => updateForm('slots', e.target.value)} 
                  className="h-14 bg-white/5 border-white/10 rounded-2xl font-display font-bold" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground ml-1">Settlement Cycle</Label>
                <Select value={form.billingCycle} onValueChange={v => updateForm('billingCycle', v)}>
                  <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-2xl font-display font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-black/90 backdrop-blur-xl border-white/10">
                    <SelectItem value="monthly">Monthly Cycle</SelectItem>
                    <SelectItem value="yearly">Annual Settlement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {analysis && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-6 rounded-2xl border flex items-center justify-between gap-6",
                analysis.band === 'overpriced' ? "border-destructive/30 bg-destructive/10" : "border-primary/20 bg-primary/5"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn("size-10 rounded-full flex items-center justify-center", analysis.band === 'overpriced' ? "bg-destructive text-white" : "bg-primary text-black")}>
                  {analysis.band === 'overpriced' ? '⚠️' : <Sparkles size={18} />}
                </div>
                <div>
                  <p className="font-display font-black text-sm uppercase italic">Market Alpha: {analysis.label}</p>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase mt-1">{analysis.warningMessage || analysis.tipMessage || 'Pricing is optimal for current network liquidity.'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">Savings / Slot</p>
                <p className="font-display font-black text-xl text-success">{analysis.savingsPct.toFixed(0)}%</p>
              </div>
            </motion.div>
          )}
        </div>

        <aside className="xl:col-span-4 space-y-6">
          <PremiumCard className="p-8 text-center space-y-6 flex flex-col items-center">
            <div className="space-y-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Calculated Yield</p>
              <div className="text-5xl font-display font-black tracking-tighter text-primary">
                {sym}{(parseFloat(form.totalCost || '0') / parseInt(form.slots || '1')).toFixed(0)}
                <span className="text-sm font-mono text-muted-foreground uppercase ml-1">/ mo</span>
              </div>
            </div>
            
            <div className="w-full space-y-3 pt-4 border-t border-white/5">
              <div className="flex justify-between font-mono text-[10px] uppercase tracking-widest">
                <span className="text-muted-foreground">Host Offset</span>
                <span className="text-success font-black">-{analysis?.hostOffset.toFixed(0) || '0'}%</span>
              </div>
              <div className="flex justify-between font-mono text-[10px] uppercase tracking-widest">
                <span className="text-muted-foreground">Market Status</span>
                <span className="text-foreground font-black">LIQUID</span>
              </div>
            </div>

            <Button 
              className="w-full h-16 rounded-2xl font-display font-black uppercase tracking-widest group" 
              onClick={() => setStep(3)}
              disabled={!form.planName || !form.totalCost}
            >
              Verify Protocol <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="ghost" className="w-full font-mono text-[10px] uppercase tracking-widest text-muted-foreground" onClick={() => setStep(1)}>
              Reselect Asset
            </Button>
          </PremiumCard>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
             <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-primary" />
                <span className="font-mono text-[10px] font-black uppercase tracking-widest">Host Protection</span>
             </div>
             <p className="text-[10px] text-muted-foreground font-mono leading-relaxed uppercase">
                SubPool automates billing and ledger settlement. Your access remains secure under our encrypted vault protocol.
             </p>
          </div>
        </aside>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-white/5">
        <div>
          <h1 className="font-display font-black text-5xl tracking-tighter italic uppercase">Protocol Rules</h1>
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mt-2">Define entry requirements and visibility parameters.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
           <section className="p-10 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground ml-1">Auto-Approval</Label>
                  <Switch checked={form.autoApprove} onCheckedChange={v => updateForm('autoApprove', v)} />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  When enabled, members who pay the initial slot fee will be granted access immediately without manual host verification.
                </p>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/5">
                <Label className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground ml-1">Network Visibility</Label>
                <div className="grid grid-cols-2 gap-4">
                   <button 
                    onClick={() => updateForm('visibility', 'public')}
                    className={cn(
                      "p-6 rounded-2xl border text-left transition-all",
                      form.visibility === 'public' ? "border-primary bg-primary/5" : "border-white/5 bg-white/[0.02]"
                    )}
                   >
                      <p className="font-display font-black text-sm uppercase mb-1">Public Grid</p>
                      <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">Visible to all marketplace participants.</p>
                   </button>
                   <button 
                    onClick={() => updateForm('visibility', 'private')}
                    className={cn(
                      "p-6 rounded-2xl border text-left transition-all",
                      form.visibility === 'private' ? "border-primary bg-primary/5" : "border-white/5 bg-white/[0.02]"
                    )}
                   >
                      <p className="font-display font-black text-sm uppercase mb-1">Stealth Mode</p>
                      <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">Only accessible via direct uplink (referral link).</p>
                   </button>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/5">
                <Label className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground ml-1">Operational Rules / Bio</Label>
                <Textarea 
                  value={form.rules}
                  onChange={e => updateForm('rules', e.target.value)}
                  placeholder="e.g. Please use the profile 'Slot 1' only. No password changes allowed."
                  className="bg-white/5 border-white/10 rounded-2xl min-h-[150px] font-display text-sm p-6"
                />
              </div>
           </section>
        </div>
        
        <aside className="lg:col-span-4">
           <PremiumCard className="p-8 space-y-6">
              <div className="space-y-2">
                <p className="font-display font-black text-2xl uppercase italic">Validation</p>
                <p className="font-mono text-[10px] text-muted-foreground uppercase leading-relaxed">
                  Ensure rules are clear to prevent disputes. High clarity leads to 80% higher retention.
                </p>
              </div>
              <Button className="w-full h-16 rounded-2xl font-display font-black uppercase tracking-widest" onClick={() => setStep(4)}>
                Review Deployment
              </Button>
              <Button variant="ghost" className="w-full font-mono text-[10px] uppercase tracking-widest text-muted-foreground" onClick={() => setStep(2)}>
                Edit Config
              </Button>
           </PremiumCard>
        </aside>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="max-w-2xl mx-auto space-y-10 py-10">
      <div className="text-center space-y-4">
        <div className="size-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 shadow-glow-primary animate-pulse">
           <Zap size={32} className="text-primary fill-primary/20" />
        </div>
        <h1 className="font-display font-black text-5xl tracking-tighter italic uppercase">Final Review</h1>
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">Authorize deployment of sub-subscription node.</p>
      </div>

      <Card className="bg-white/[0.02] border-white/5 overflow-hidden rounded-[32px] glass-premium">
        <CardContent className="p-10 space-y-8">
           <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                 <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Asset Node</p>
                 <div className="flex items-center gap-3">
                    <PlatformIcon platformId={selectedPlatform!} size="xs" />
                    <span className="font-display font-black text-xl uppercase tracking-tighter">{platform?.name}</span>
                 </div>
              </div>
              <div className="space-y-1">
                 <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Settlement Price</p>
                 <p className="font-display font-black text-xl text-primary">{sym}{(parseFloat(form.totalCost) / parseInt(form.slots)).toFixed(2)} <span className="text-[10px] text-muted-foreground uppercase font-mono">/ mo</span></p>
              </div>
              <div className="space-y-1">
                 <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Plan Class</p>
                 <p className="font-display font-bold text-sm uppercase">{form.planName}</p>
              </div>
              <div className="space-y-1">
                 <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Capacity</p>
                 <p className="font-display font-bold text-sm uppercase">{form.slots} Units</p>
              </div>
           </div>

           <div className="pt-8 border-t border-white/5 flex flex-col gap-4">
              <Button 
                className="h-16 w-full text-lg font-display font-black uppercase tracking-[0.2em] shadow-glow-primary rounded-2xl" 
                disabled={submitting} 
                onClick={handlePublish}
              >
                {submitting ? 'DEPLOYING NODE...' : 'INITIALIZE DEPLOYMENT'}
              </Button>
              <Button 
                variant="ghost" 
                className="w-full font-mono text-[10px] uppercase tracking-widest text-muted-foreground" 
                onClick={() => setStep(3)}
              >
                Return to Protocol
              </Button>
           </div>
        </CardContent>
      </Card>
      
      <p className="text-center font-mono text-[9px] text-muted-foreground uppercase tracking-widest opacity-40">
        SubPool Deployment Protocol v2.5.0 · Encrypted Uplink Active
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-grid-technical py-12 px-4 scan-line selection:bg-primary selection:text-black">
      <div className="container max-w-7xl mx-auto">
        <StepIndicator step={step} />
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
          </motion.div>
        </AnimatePresence>

        <PaywallModal 
          isOpen={showPaywall} 
          onClose={() => setShowPaywall(false)}
          feature="MAX_ACTIVE_POOLS"
          title="Operational Limit Reached"
          description={getUpgradeMessage('MAX_ACTIVE_POOLS')}
        />
      </div>
    </div>
  );
}
