// ─── CreatePoolPage — 3-Step Wizard ────────────────────────────────────────────
// Step 1: Choose Platform → Step 2: Configure → Step 3: Review & Publish

import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/dialog';
import { PlatformIcon } from '../components/subpool-components';
import { PaywallModal } from '../components/paywall-modal';
import { PLATFORMS } from '../../lib/constants';
import { createPool } from '../../lib/supabase/mutations';
import type { PoolCategory } from '../../lib/types';
import { useAuth } from '../../lib/supabase/auth';
import { getPlatformSharingNote, analyzePricing, detectUserCurrency, getSuggestion, getPricingData } from '../../lib/pricing-service';
import { PLATFORM_PRICING_SEED } from '../../lib/pricing-seed';
import type { PlatformPricing } from '../../lib/pricing-seed';
import { track } from '../../lib/analytics';
import { useCurrency } from '../../lib/currency-context';
import { CurrencyToggle } from '../components/currency-toggle';
import { getUserFacingError } from '../../lib/error-feedback';

// ─── Step Indicator ────────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2 mb-8 max-w-xs mx-auto">
      {[1, 2, 3].map((n) => (
        <React.Fragment key={n}>
          {/* Circle */}
          <div
            className={`
              w-10 h-10 rounded-full flex items-center justify-center text-xs font-mono font-black transition-all duration-300
              ${step > n
                ? 'bg-primary/20 text-primary border border-primary/20'
                : step === n
                  ? 'bg-primary text-primary-foreground shadow-glow-primary'
                  : 'bg-white/5 border border-white/5 text-muted-foreground'
              }
            `}
          >
            {step > n ? '✓' : n}
          </div>
          {/* Connecting line */}
          {n < 3 && (
            <div
              className={`flex-1 h-px transition-colors ${step > n ? 'bg-primary/40' : 'bg-border'
                }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function ListAPool() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [form, setForm] = useState({
    planName: '',
    totalCost: '',
    slots: '2',
    category: 'entertainment' as PoolCategory,
    billingCycle: 'monthly' as 'monthly' | 'yearly',
  });
  const { currency, symbol: sym } = useCurrency();
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [marketMetrics, setMarketMetrics] = useState<any>(null);
  const [isLive, setIsLive] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);

  const userPlan = profile?.plan || 'free';
  const [hostedCount, setHostedCount] = useState(0);

  React.useEffect(() => {
    if (user?.id) {
      import('../../lib/supabase/client').then(({ supabase }) => {
        if (supabase) {
          supabase.from('pools').select('id', { count: 'exact' }).eq('owner_id', user.id)
            .then(({ count }) => setHostedCount(count || 0));
        }
      });
    }
  }, [user?.id]);


  const pricePerSlot =
    form.totalCost && form.slots
      ? (parseFloat(form.totalCost) / parseInt(form.slots)).toFixed(2)
      : null;

  const platform = PLATFORMS.find((p) => p.id === selectedPlatform);

  const allFieldsFilled =
    form.planName.trim() !== '' &&
    form.totalCost !== '' &&
    parseFloat(form.totalCost) > 0 &&
    form.slots !== '' &&
    parseInt(form.slots) > 1;

  const updateForm = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  React.useEffect(() => {
    if (selectedPlatform && step === 2 && !form.planName) {
      const plans = PLATFORM_PRICING_SEED.filter((s: PlatformPricing) => s.platform_id === selectedPlatform && s.currency === currency);
      if (plans.length > 0) {
        updateForm('planName', plans[0].plan_name);
        updateForm('totalCost', plans[0].official_price.toString());
      }

      const pData = PLATFORMS.find(p => p.id === selectedPlatform);
      if (pData) updateForm('category', pData.category);
    }
  }, [selectedPlatform, step, currency]);

  React.useEffect(() => {
    if (selectedPlatform && form.planName) {
      import('../../lib/pricing-service').then(m => {
        m.getMarketMetrics(selectedPlatform, form.planName).then(data => {
          setMarketMetrics(data);
          setIsLive(!!data && !data.is_mock);
        });
      });
    }
  }, [selectedPlatform, form.planName]);


  const analysis = React.useMemo(() => {
    if (!selectedPlatform || !form.planName || !form.slots || !form.totalCost) return null;
    return analyzePricing({
      platformId: selectedPlatform,
      planName: form.planName,
      userSlotPrice: parseFloat(form.totalCost) / parseInt(form.slots),
      totalSlots: parseInt(form.slots),
      currency: currency,
      countryCode: currency === 'INR' ? 'IN' : 'US',
    });
  }, [selectedPlatform, form.planName, form.totalCost, form.slots, currency]);


  const handleContinueToStep3 = () => {
    if (analysis && (analysis.band === 'overpriced' || analysis.band === 'aggressive' || analysis.band === 'steal')) {
      track('pricing_guard_shown', { band: analysis.band, userPrice: analysis.userSlotPrice, platformId: selectedPlatform });
      setModalOpen(true);
    } else {
      setStep(3);
    }
  };

  React.useEffect(() => {
    if (step === 2 && analysis && selectedPlatform && form.planName && form.slots) {
      if (analysis.band === 'steal' || analysis.band === 'overpriced' || analysis.band === 'aggressive') {
        const sugg = getSuggestion(selectedPlatform, form.planName, parseInt(form.slots), currency);
        track('pricing_suggestion_viewed', { platformId: selectedPlatform, suggestedPrice: sugg.recommended, userPrice: analysis.userSlotPrice });
      }
    }
  }, [step, analysis?.band, selectedPlatform, form.planName, form.slots, currency]);


  const sharingNote =
    selectedPlatform && form.planName
      ? getPlatformSharingNote(selectedPlatform, form.planName)
      : selectedPlatform
        ? getPlatformSharingNote(selectedPlatform, PLATFORM_PRICING_SEED.find((s: PlatformPricing) => s.platform_id === selectedPlatform)?.plan_name || '')
        : null;

  const [searchQuery, setSearchQuery] = useState('');
  const [allPricing, setAllPricing] = useState<any[]>([]);
  const [allPlatforms, setAllPlatforms] = useState<any[]>([]);

  React.useEffect(() => {
    getPricingData().then((data: any[]) => {
      setAllPricing(data);
      const unique = Array.from(new Set(data.map((p: any) => p.platform_id))).map(id => {
        const item = data.find((p: any) => p.platform_id === id);
        const staticP = PLATFORMS.find(sp => sp.id === id);
        return {
          id,
          name: item?.platform_name || id,
          category: item?.category?.toLowerCase() || 'productivity',
          icon: staticP?.icon || '📦',
          color: staticP?.color || '#FFFFFF',
          bg: staticP?.bg || '#1A1A1A'
        };
      });
      setAllPlatforms(unique);
    });
  }, []);

  const filteredPlatforms = allPlatforms.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.includes(searchQuery.toLowerCase())
  );

  const renderStep1 = () => (
    <div className="max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="font-display font-bold text-xl">Choose a platform</h2>
        <div className="relative w-full sm:w-64">
          <Input
            placeholder="Search SaaS products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="h-9 text-xs font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {(searchQuery ? filteredPlatforms : PLATFORMS).map((p) => {
          const isSelected = selectedPlatform === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPlatform(p.id)}
              className={`
                flex flex-col items-center p-4 border rounded-xl transition-all text-center cursor-pointer min-h-[100px]
                ${isSelected
                  ? 'border-primary bg-primary/10 text-primary shadow-glow-primary scale-[1.02]'
                  : 'border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10'
                }
              `}
            >
              {PLATFORMS.find(sp => sp.id === p.id) ? (
                <PlatformIcon platformId={p.id} size="sm" />
              ) : (
                <span className="text-xl mb-1">{p.icon}</span>
              )}
              <span className="font-display font-black text-[10px] uppercase tracking-wider mt-2 line-clamp-2">
                {p.name}
              </span>
            </button>
          );
        })}
      </div>

      {sharingNote && (
        <div
          className={`mt-6 p-3 rounded-[6px] border transition-all ${sharingNote.policy === 'allowed'
            ? 'bg-[#4DFF91]/5 border-[#4DFF91]/20'
            : sharingNote.policy === 'grey_area'
              ? 'bg-[#F5A623]/5 border-[#F5A623]/20'
              : 'bg-[#FF4D4D]/5 border-[#FF4D4D]/20'
            }`}
        >
          <p
            className={`font-mono text-[11px] leading-relaxed ${sharingNote.policy === 'allowed'
              ? 'text-[#4DFF91]'
              : sharingNote.policy === 'grey_area'
                ? 'text-[#F5A623]'
                : 'text-[#FF4D4D]'
              }`}
          >
            {sharingNote.policy === 'allowed' && `✅ ${platform?.name || 'Platform'} officially supports account sharing on family plans.`}
            {sharingNote.policy === 'grey_area' && `⚠️ ${platform?.name || 'Platform'} is licensed per-user. Position this pool as cost-splitting for small teams, not credential sharing.`}
            {sharingNote.policy === 'not_recommended' && `ℹ️ ${platform?.name || 'Platform'} requires each user to have their own seat. Use SubPool to coordinate team billing, not share one login.`}
          </p>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <Button
          disabled={!selectedPlatform}
          onClick={() => {
            if (userPlan === 'free' && hostedCount >= 1) {
              setPaywallOpen(true);
            } else {
              setStep(2);
            }
          }}
        >
          Continue
        </Button>
      </div>

      <PaywallModal
        feature="hosting more pools"
        requiredPlan="host_plus"
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
      />
    </div>
  );

  const renderStep2 = () => {
    const plans = allPricing.filter((s: any) => s.platform_id === selectedPlatform && s.currency === currency);
    return (
      <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-5 lg:min-w-[400px]">
          <h2 className="font-display font-bold text-xl mb-6">Configure your pool</h2>
          <div className="space-y-1.5">
            <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Plan Name</Label>
            {plans.length > 0 ? (
              <Select
                value={form.planName}
                onValueChange={(v) => {
                  updateForm('planName', v);
                  const p = plans.find((pp: PlatformPricing) => pp.plan_name === v);
                  if (p) updateForm('totalCost', p.official_price.toString());
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((p: PlatformPricing) => (
                    <SelectItem key={p.plan_name} value={p.plan_name}>
                      {p.plan_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder="e.g. Standard 4K"
                value={form.planName}
                onChange={(e) => updateForm('planName', e.target.value)}
              />
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Category</Label>
            <Select value={form.category} onValueChange={(v) => updateForm('category', v)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="entertainment">Entertainment (OTT)</SelectItem>
                <SelectItem value="productivity">Productivity (SaaS)</SelectItem>
                <SelectItem value="ai">AI/IDE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center h-4">
                <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Total cost / mo</Label>
                <div className="scale-75 origin-top-right"><CurrencyToggle /></div>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2 text-muted-foreground font-mono">{sym}</span>
                <Input className="pl-7" type="number" placeholder="0.00" value={form.totalCost} onChange={(e) => updateForm('totalCost', e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground flex items-center h-4">Total Slots</Label>
              <Input type="number" placeholder="2" min="2" max="10" value={form.slots} onChange={(e) => updateForm('slots', e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Billing Cycle</Label>
            <Select value={form.billingCycle} onValueChange={(v) => updateForm('billingCycle', v)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-between pt-6">
            <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
            <Button disabled={!allFieldsFilled} onClick={handleContinueToStep3}>Continue</Button>
          </div>
        </div>
        <div className="lg:w-[320px] lg:border-l lg:border-border lg:pl-8 mt-8 lg:mt-0 flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Pricing Intelligence</span>
            <div className="flex items-center gap-1.5 bg-background border px-2 py-0.5 rounded-full shadow-sm">
              <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'animate-pulse bg-primary' : 'bg-muted-foreground/30'}`} />
              <span className="text-[9px] font-mono font-bold tracking-wider text-muted-foreground">{isLive ? 'LIVE' : 'SEED'}</span>
            </div>
          </div>
          {analysis ? (
            <>
              <div className="grid grid-cols-2 gap-y-2 font-mono text-[12px]">
                <div className="text-muted-foreground">Official solo:</div><div className="text-right">{sym}{analysis.officialSoloPrice.toFixed(2)}</div>
                <div className="text-muted-foreground">Max seats:</div><div className="text-right">{form.slots}</div>
              </div>
              <div className="bg-card border rounded-[8px] p-5 shadow-sm text-center">
                <div className="font-display font-bold text-[36px]" style={{ color: analysis.color }}>
                  {sym}{analysis.userSlotPrice.toFixed(2)}<span className="text-xl text-muted-foreground opacity-50">/mo</span>
                </div>
                <div className="relative h-2 rounded-full bg-muted mt-4 overflow-hidden">
                  <div className="absolute top-0 left-0 h-full transition-all duration-300" style={{ width: `${Math.min(100, (analysis.userSlotPrice / analysis.officialSoloPrice) * 100)}%`, backgroundColor: analysis.color }} />
                </div>
                <div className="mt-4 font-mono text-[11px] font-bold border rounded-full px-3 py-1 inline-block" style={{ color: analysis.color, borderColor: `${analysis.color}40` }}>{analysis.label.toUpperCase()}</div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 border border-dashed rounded-[8px] opacity-50">
              <span className="font-mono text-xs text-muted-foreground">Enter cost & slots</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handlePublish = async () => {
    if (!selectedPlatform || !platform || !user) return;
    setSubmitting(true);
    const slotPriceCents = Math.round(parseFloat(pricePerSlot!) * 100);
    try {
      const result = await createPool({
        platform: selectedPlatform,
        owner_id: user.id,
        category: form.category,
        status: 'open',
        plan_name: form.planName,
        price_per_slot: slotPriceCents,
        total_slots: parseInt(form.slots),
        auto_approve: false,
        description: null,
      });
      if (!result.success) throw result.error;
      track('pool_created', { platformId: selectedPlatform, slotPrice: slotPriceCents });
      navigate('/my-pools');
      toast.success('Your pool is live!');
    } catch (error) {
      toast.error(getUserFacingError(error, 'publish this pool').message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep3 = () => (
    <div className="max-w-lg mx-auto">
      <h2 className="font-display font-bold text-xl mb-6">Review your pool</h2>
      <div className="bg-card border rounded-[6px] p-6">
        <div className="flex items-center gap-3 mb-5">
          <PlatformIcon platformId={selectedPlatform ?? ''} size="lg" />
          <div>
            <div className="font-display font-bold text-base">{platform?.name}</div>
            <div className="font-mono text-[11px] text-muted-foreground">{form.planName}</div>
          </div>
        </div>
        {[
          { label: 'Platform', value: platform?.name ?? '' },
          { label: 'Plan', value: form.planName },
          { label: 'Price per slot', value: `${sym}${pricePerSlot}/mo`, highlight: true }
        ].map((row) => (
          <div key={row.label} className="flex justify-between items-center py-3 border-b border-border">
            <span className="font-mono text-[11px] text-muted-foreground uppercase">{row.label}</span>
            <span className={row.highlight ? 'font-display font-bold text-xl text-primary' : 'font-mono text-sm'}>{row.value}</span>
          </div>
        ))}
      </div>
      <Button className="w-full h-12 text-base mt-6" disabled={submitting} onClick={handlePublish}>
        {submitting ? 'Publishing...' : '🚀 Publish Pool'}
      </Button>
      <Button variant="ghost" className="w-full mt-3" onClick={() => setStep(2)}>Back</Button>
    </div>
  );

  return (
    <div className="container py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="font-display font-black text-3xl tracking-tight text-foreground">List a Pool</h1>
        <p className="text-muted-foreground font-display text-sm mt-2">Start sharing and offset your costs</p>
      </div>
      <StepIndicator step={step} />
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Pricing Check</DialogTitle><DialogDescription>Your pricing is {analysis?.band}. Do you want to continue?</DialogDescription></DialogHeader>
          <DialogFooter><Button onClick={() => setModalOpen(false)}>Refine Price</Button><Button onClick={() => { setModalOpen(false); setStep(3); }}>Continue anyway</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
