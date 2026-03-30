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
              w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all
              ${step > n
                ? 'bg-primary/30 text-primary'
                : step === n
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border text-muted-foreground'
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
  // Simplified for execution: we'll count pools in a useEffect or use a simplified check
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


  // Computed
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

  // Auto-fill form values when platform is selected
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

  // Fetch market metrics
  React.useEffect(() => {
    if (selectedPlatform && form.planName) {
      import('../../lib/pricing-service').then(m => {
        m.getMarketMetrics(selectedPlatform, form.planName).then(data => {
          setMarketMetrics(data);
          // Simple heuristic for "LIVE": if it has more than just seed fallback properties or if we can detect DB connection
          setIsLive(!!data && !data.is_mock);
        });
      });
    }
  }, [selectedPlatform, form.planName]);


  // Pricing Intelligence computation
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


  // Pricing Guard logic
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


  // ─── Step 1 — Choose Platform ──────────────────────────────────────────────

  const sharingNote =
    selectedPlatform && form.planName
      ? getPlatformSharingNote(selectedPlatform, form.planName)
      : selectedPlatform
        ? getPlatformSharingNote(selectedPlatform, PLATFORM_PRICING_SEED.find((s: PlatformPricing) => s.platform_id === selectedPlatform)?.plan_name || '')
        : null;

  // Platform Search — P3 Feature
  const [searchQuery, setSearchQuery] = useState('');
  const [allPricing, setAllPricing] = useState<any[]>([]);
  const [allPlatforms, setAllPlatforms] = useState<any[]>([]);

  React.useEffect(() => {
    getPricingData().then((data: any[]) => {
      setAllPricing(data);
      // Extract unique platforms from pricing data
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
                flex flex-col items-center p-3 border rounded-[6px] transition-all text-center cursor-pointer min-h-[90px]
                ${isSelected
                  ? 'border-primary bg-primary/8 text-primary'
                  : 'border-border hover:border-muted-foreground'
                }
              `}
            >
              {PLATFORMS.find(sp => sp.id === p.id) ? (
                <PlatformIcon platformId={p.id} size="sm" />
              ) : (
                <span className="text-xl mb-1">{p.icon}</span>
              )}
              <span className="font-display font-semibold text-[11px] mt-1.5 line-clamp-2">
                {p.name}
              </span>
            </button>
          );
        })}

        {/* If searching and no results found in DB either, we still allow custom? Or just show nothing. 
            Per requirement: "search and select option for the new saas based products" 
            The platform_pricing table has many more products now from the consolidated seed.
        */}
      </div>

      {/* Sharing Policy Note */}
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
            {sharingNote.policy === 'grey_area' && `⚠ï¸  ${platform?.name || 'Platform'} is licensed per-user. Position this pool as cost-splitting for small teams, not credential sharing.`}
            {sharingNote.policy === 'not_recommended' && `ℹï¸  ${platform?.name || 'Platform'} requires each user to have their own seat. Use SubPool to coordinate team billing, not share one login.`}
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

  // ─── Step 2 — Configure ────────────────────────────────────────────────────

  const renderStep2 = () => {
    const plans = allPricing.filter((s: any) => s.platform_id === selectedPlatform && s.currency === currency);

    return (
      <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Left Column - Form */}
        <div className="flex-1 space-y-5 lg:min-w-[400px]">
          <h2 className="font-display font-bold text-xl mb-6">Configure your pool</h2>

          {/* Plan Name */}
          <div className="space-y-1.5">
            <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Plan Name
            </Label>
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

          {/* Category */}
          <div className="space-y-1.5">
            <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Category
            </Label>
            <Select
              value={form.category}
              onValueChange={(v) => updateForm('category', v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entertainment">Entertainment (OTT)</SelectItem>
                <SelectItem value="productivity">Productivity (SaaS)</SelectItem>
                <SelectItem value="ai">AI/IDE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 2-col: Cost + Slots */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center h-4">
                <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Total cost / mo
                </Label>
                {/* Currency Toggle */}
                <div className="scale-75 origin-top-right">
                  <CurrencyToggle />
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2 text-muted-foreground font-mono">{sym}</span>
                <Input
                  className="pl-7"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={form.totalCost}
                  onChange={(e) => updateForm('totalCost', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground flex items-center h-4">
                Total Slots
              </Label>
              <Input
                type="number"
                placeholder="2"
                min="2"
                max="10"
                value={form.slots}
                onChange={(e) => updateForm('slots', e.target.value)}
              />
            </div>
          </div>

          {/* Billing Cycle */}
          <div className="space-y-1.5">
            <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Billing Cycle
            </Label>
            <Select
              value={form.billingCycle}
              onValueChange={(v) => updateForm('billingCycle', v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Nav */}
          <div className="flex justify-between pt-6">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button disabled={!allFieldsFilled} onClick={handleContinueToStep3}>
              Continue
            </Button>
          </div>
        </div>

        {/* Right Column - Pricing Intelligence Panel */}
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
              {/* Section A: Official Pricing Reference */}
              <div className="grid grid-cols-2 gap-y-2 font-mono text-[12px]">
                <div className="text-muted-foreground">Official solo:</div>
                <div className="text-right">{sym}{analysis.officialSoloPrice.toFixed(2)}</div>

                <div className="text-muted-foreground">Max seats:</div>
                <div className="text-right">{form.slots}</div>

                <div className="text-muted-foreground">Category:</div>
                <div className="text-right truncate">{platform?.category}</div>
              </div>

              {/* Section B: Gauge */}
              <div className="bg-card border rounded-[8px] p-5 shadow-sm text-center">
                <div className="font-display font-bold text-[36px]" style={{ color: analysis.color }}>
                  {sym}{analysis.userSlotPrice.toFixed(2)}<span className="text-xl text-muted-foreground opacity-50">/mo</span>
                </div>

                {/* Horizontal Gauge */}
                <div className="relative h-2 rounded-full bg-muted mt-4 overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (analysis.userSlotPrice / analysis.officialSoloPrice) * 100)}%`,
                      backgroundColor: analysis.color
                    }}
                  />
                </div>
                {/* Tick marks */}
                <div className="relative h-4 mt-1">
                  <div className="absolute left-[65%] w-px h-1.5 bg-border top-0" />
                  <div className="absolute left-[75%] w-px h-2 bg-muted-foreground top-0" />
                  <div className="absolute left-[85%] w-px h-1.5 bg-border top-0" />
                  <div className="flex justify-between w-full font-mono text-[9px] text-muted-foreground mt-1.5">
                    <span>Min</span>
                    <span className="text-primary font-bold">Sweet spot</span>
                    <span>Max</span>
                  </div>
                </div>


                <div
                  className="mt-4 font-mono text-[11px] font-bold border rounded-full px-3 py-1 inline-block"
                  style={{ color: analysis.color, borderColor: `${analysis.color}40` }}
                >
                  {analysis.label.toUpperCase()}
                </div>

                {analysis.warningMessage && (
                  <div className="mt-4 p-2.5 rounded-[6px] font-mono text-[11px] text-left leading-relaxed" style={{ backgroundColor: '#F5A62310', border: '1px solid #F5A62320', color: '#F5A623' }}>
                    {analysis.warningMessage}
                  </div>
                )}
                {analysis.tipMessage && (
                  <div className="mt-4 p-2.5 rounded-[6px] font-mono text-[11px] text-left leading-relaxed" style={{ backgroundColor: `${analysis.color}15`, border: `1px solid ${analysis.color}30`, color: analysis.color }}>
                    {analysis.tipMessage}
                  </div>
                )}
              </div>

              {/* Section C: Economics Breakdown */}
              <div className="space-y-3 font-mono text-[12px]">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Members save:</span>
                  <span className="font-bold text-[#4DFF91]">{analysis.savingsPct.toFixed(0)}% vs solo</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">You earn/mo:</span>
                  <span>{sym}{analysis.hostEarnings.toFixed(2)} from members</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Your net cost:</span>
                  <span className={analysis.hostEarnings > analysis.officialSoloPrice ? 'text-primary' : ''}>
                    {sym}{(analysis.officialSoloPrice - analysis.hostEarnings).toFixed(2)}
                  </span>
                </div>
                <p className="font-mono text-[10px] text-muted-foreground mt-1 leading-tight border-t pt-2">
                  You pay {sym}{analysis.officialSoloPrice.toFixed(2)},
                  collect {sym}{analysis.hostEarnings.toFixed(2)} from {parseInt(form.slots) - 1} members.
                </p>
              </div>

              {/* Section D: Market Comparison */}
              {marketMetrics && (
                <div className="space-y-3">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    MARKET RATES FOR {platform?.name.toUpperCase()} {form.planName.toUpperCase()}
                  </div>

                  <div className="space-y-2">
                    <div className="relative h-12 flex items-end gap-1">
                      {[
                        { label: 'Min', value: marketMetrics.min_slot_price },
                        { label: 'Median', value: marketMetrics.median_slot_price },
                        { label: 'Max', value: marketMetrics.max_slot_price }
                      ].map((m, i) => {
                        const maxValue = Math.max(marketMetrics.max_slot_price, analysis.userSlotPrice);
                        const height = (m.value / maxValue) * 100;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full bg-muted rounded-t-[2px] relative overflow-hidden h-8">
                              <div
                                className="absolute bottom-0 left-0 w-full bg-primary/40 transition-all duration-500"
                                style={{ height: `${height}%` }}
                              />
                              {/* Price Marker for user's price */}
                              {i === 1 && (
                                <div
                                  className="absolute bottom-0 left-1/2 -ml-1 transition-all duration-300 z-10"
                                  style={{ bottom: `${(analysis.userSlotPrice / maxValue) * 100}%` }}
                                >
                                  <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-primary" />
                                </div>
                              )}
                            </div>
                            <span className="font-mono text-[9px] text-muted-foreground">{sym}{m.value.toFixed(0)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="font-mono text-[10px] text-muted-foreground">
                    Based on {marketMetrics.pool_count || 12} active pools
                  </div>
                </div>
              )}


              {/* Section E: Suggestion CTA */}
              {(analysis.band === 'steal' || analysis.band === 'overpriced' || analysis.band === 'aggressive') && (
                <div
                  className={`mt-2 p-3 rounded-[6px] border ${analysis.band === 'steal' ? 'border-primary/30' : 'border-[#F5A623]/30'
                    }`}
                >
                  <p className="font-bold font-display text-base mb-1">
                    {analysis.band === 'steal'
                      ? `You could charge ${sym}${getSuggestion(selectedPlatform!, form.planName, parseInt(form.slots), currency).recommended.toFixed(0)} and still save members ${Math.round((1 - (getSuggestion(selectedPlatform!, form.planName, parseInt(form.slots), currency).recommended / analysis.officialSoloPrice)) * 100)}%`
                      : `Suggested: ${sym}${getSuggestion(selectedPlatform!, form.planName, parseInt(form.slots), currency).recommended.toFixed(0)}/slot`
                    }
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 -ml-2 text-primary"
                    onClick={() => {
                      const sugg = getSuggestion(selectedPlatform!, form.planName, parseInt(form.slots), currency);
                      track('pricing_suggestion_applied', { platformId: selectedPlatform, suggestedPrice: sugg.recommended });
                      updateForm('totalCost', (sugg.recommended * parseInt(form.slots)).toFixed(0));
                    }}
                  >
                    Apply suggestion →
                  </Button>
                </div>
              )}


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

  // ─── Step 3 — Review ───────────────────────────────────────────────────────

  const handlePublish = async () => {
  if (!selectedPlatform || !platform || !user) return;
  if (!pricePerSlot || Number.isNaN(Number(pricePerSlot))) {
    toast.error('Please verify total cost and slots before publishing.');
    return;
  }

  setSubmitting(true);
  const slotPriceCents = Math.round(parseFloat(pricePerSlot) * 100);

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

    if (!result.success) {
      const friendly = getUserFacingError(result.error, 'publish this pool');
      toast.error(friendly.message);
      return;
    }

    track('pool_created', { platformId: selectedPlatform, slotPrice: slotPriceCents, band: analysis?.band, totalSlots: parseInt(form.slots) });
    navigate('/my-pools');
    toast.success('Your pool is live!');
  } catch (error) {
    const friendly = getUserFacingError(error, 'publish this pool');
    toast.error(friendly.message);
  } finally {
    setSubmitting(false);
  }
};

  const summaryRows = [
    { label: 'Platform', value: platform?.name ?? '' },
    { label: 'Plan', value: form.planName },
    { label: 'Category', value: form.category.charAt(0).toUpperCase() + form.category.slice(1) },
    { label: 'Total cost', value: `${sym}${parseFloat(form.totalCost).toFixed(2)}` },
    { label: 'Slots', value: form.slots },
    {
      label: 'Price per slot',
      value: `${sym}${pricePerSlot}/mo`,
      highlight: true,
    },
    { label: 'Billing cycle', value: form.billingCycle === 'monthly' ? 'Monthly' : 'Yearly' },
  ];

  const renderStep3 = () => (
    <div className="max-w-lg mx-auto">
      <h2 className="font-display font-bold text-xl mb-6">Review your pool</h2>

      {/* Summary Card */}
      <div className="bg-card border rounded-[6px] p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <PlatformIcon platformId={selectedPlatform ?? ''} size="lg" />
          <div>
            <div className="font-display font-bold text-base">{platform?.name}</div>
            <div className="font-mono text-[11px] text-muted-foreground flex items-center gap-2">
              {form.planName}
              {analysis && (
                <span
                  className="px-2 py-0.5 rounded-full border text-[9px] font-bold tracking-wider uppercase"
                  style={{ color: analysis.color, borderColor: `${analysis.color}40`, backgroundColor: `${analysis.color}10` }}
                >
                  {analysis.label}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Key/value rows */}
        {summaryRows.map((row, i) => (
          <div
            key={row.label}
            className={`flex justify-between items-center py-3 border-b border-border`}
          >
            <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider">
              {row.label}
            </span>
            <div className="flex items-center gap-2">
              {row.label === 'Price per slot' && analysis && (
                <span
                  className="px-2 py-0.5 rounded-full border text-[9px] font-bold tracking-wider uppercase"
                  style={{ color: analysis.color, borderColor: `${analysis.color}40`, backgroundColor: `${analysis.color}10` }}
                >
                  {analysis.label}
                </span>
              )}
              <span
                className={
                  row.highlight
                    ? 'font-display font-bold text-xl text-primary'
                    : 'font-mono text-sm'
                }
              >
                {row.value}
              </span>
            </div>
          </div>
        ))}


        {/* Economics Sub-summary */}
        {analysis && (
          <div className="py-4 border-b border-border bg-muted/30 -mx-6 px-6 relative">
            <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider block mb-2">Pool Economics</span>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Member savings:</span>
                <span className="font-bold text-[#4DFF91]">{analysis.savingsPct.toFixed(0)}% vs solo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cost offset:</span>
                <span className="font-bold text-primary">
                  {analysis.hostOffset.toFixed(0)}% of total
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Your net cost:</span>
                <span className={analysis.hostEarnings > analysis.officialSoloPrice ? 'text-primary' : ''}>
                  {sym}{(analysis.officialSoloPrice - analysis.hostEarnings).toFixed(0)}/mo
                </span>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Publish Button */}
      <Button
        className="w-full h-12 text-base mt-6"
        disabled={submitting}
        onClick={handlePublish}
      >
        {submitting ? 'Publishing...' : '🚀 Publish Pool'}
      </Button>

      {/* Back */}
      <Button
        variant="ghost"
        className="w-full mt-3"
        onClick={() => setStep(2)}
        disabled={submitting}
      >
        Back
      </Button>
    </div>
  );

  // ─── Modals ────────────────────────────────────────────────────────────────
  const renderGuardModal = () => {
    if (!analysis) return null;
    const isOverpriced = analysis.band === 'overpriced' || analysis.band === 'aggressive';

    return (
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isOverpriced
                ? 'Your price is above the usual range'
                : "You're significantly undercharging"}
            </DialogTitle>
            <DialogDescription className="pt-2 font-mono text-sm leading-relaxed">
              {isOverpriced ? (
                <>At <span className="text-foreground font-bold">{sym}{analysis.userSlotPrice.toFixed(0)}</span>/slot, you're charging more than the typical solo plan. Most users will see better options elsewhere. Are you sure?</>
              ) : (
                <>At <span className="text-foreground font-bold">{sym}{analysis.userSlotPrice.toFixed(0)}</span>/slot, you're essentially subsidising members. The fair range for this pool is <span className="text-[#4DFF91] font-bold" role="img" aria-label="icon">{sym}{analysis.fairRangeMin.toFixed(0)}–{sym}{analysis.fairRangeMax.toFixed(0)}</span>/slot.</>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-2 mt-4">
            <Button variant="ghost" onClick={() => {
              track('pricing_guard_overridden', { band: analysis.band });
              setModalOpen(false);
              setStep(3);
            }}>
              {isOverpriced ? 'Continue anyway' : "That's fine, continue"}
            </Button>
            <Button onClick={() => {
              const sugg = getSuggestion(selectedPlatform!, form.planName, parseInt(form.slots), currency);
              track('pricing_suggestion_applied', { platformId: selectedPlatform, suggestedPrice: sugg.recommended });
              setModalOpen(false);
              updateForm('totalCost', (sugg.recommended * parseInt(form.slots)).toFixed(0));
            }}>
              {isOverpriced ? 'Lower my price' : 'Adjust price'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    );
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="py-6">
      <StepIndicator step={step} />
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {renderGuardModal()}
    </div>
  );
}

