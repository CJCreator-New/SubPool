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
import { motion } from 'motion/react';
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
import { getPlatformSharingNote, analyzePricing, getSuggestion, getPricingData } from '../../lib/pricing-service';
import { PLATFORM_PRICING_SEED } from '../../lib/pricing-seed';
import type { PlatformPricing } from '../../lib/pricing-seed';
import { track } from '../../lib/analytics';
import { useCurrency } from '../../lib/currency-context';
import { CurrencyToggle } from '../components/currency-toggle';
import { getUserFacingError } from '../../lib/error-feedback';

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2 mb-8 max-w-xs mx-auto">
      {[1, 2, 3].map((n) => (
        <React.Fragment key={n}>
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

export function ListAPool() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [form, setForm] = useState({
    planName: '',
    totalCost: '',
    slots: '2',
    category: 'OTT' as PoolCategory,
    billingCycle: 'monthly' as 'monthly' | 'yearly',
  });
  const { currency, symbol: sym } = useCurrency();
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [marketMetrics, setMarketMetrics] = useState<any>(null);
  const [isLive, setIsLive] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [allPricing, setAllPricing] = useState<any[]>([]);
  const [allPlatforms, setAllPlatforms] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [hostedCount, setHostedCount] = useState(0);

  const userPlan = profile?.plan || 'free';

  React.useEffect(() => {
    if (user?.id) {
      import('../../lib/supabase/client').then(({ supabase }) => {
        if (supabase) {
          supabase.from('pools').select('id', { count: 'exact' })
            .eq('owner_id', user.id)
            .in('status', ['open', 'filled'])
            .then(({ count }) => setHostedCount(count || 0));
        }
      });
    }
  }, [user?.id]);

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
        };
      });
      setAllPlatforms(unique);
    });
  }, []);

  const updateForm = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const platform = PLATFORMS.find((p) => p.id === selectedPlatform);

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

  const handlePublish = async () => {
    if (!selectedPlatform || !platform || !user) return;
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
        auto_approve: false,
        description: null,
      });
      if (!result.success) throw result.error;
      navigate('/my-pools');
      toast.success('Your pool is live!');
    } catch (error) {
      toast.error(getUserFacingError(error, 'publish this pool').message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="font-display font-bold text-xl">Choose a platform</h2>
        <Input
          placeholder="Search SaaS products..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="h-9 text-xs font-mono w-full sm:w-64"
        />
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {PLATFORMS.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPlatform(p.id)}
            className={`p-4 border rounded-xl transition-all text-center ${selectedPlatform === p.id ? 'border-primary bg-primary/10' : 'border-white/5 bg-white/5'}`}
          >
            <PlatformIcon platformId={p.id} size="sm" className="mx-auto mb-2" />
            <span className="text-[10px] uppercase font-bold">{p.name}</span>
          </button>
        ))}
      </div>
      <div className="mt-8 flex justify-end">
        <Button disabled={!selectedPlatform} onClick={() => setStep(2)}>Continue</Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="font-display font-black text-2xl uppercase italic">Configuration</h2>
        <CurrencyToggle />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <section className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-mono text-muted-foreground">Plan Name</Label>
                <Input value={form.planName} onChange={e => updateForm('planName', e.target.value)} className="h-12 bg-white/5 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-mono text-muted-foreground">Category</Label>
                <Select value={form.category} onValueChange={v => updateForm('category', v)}>
                  <SelectTrigger className="h-12 bg-white/5 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OTT">OTT / Media</SelectItem>
                    <SelectItem value="AI_IDE">AI & Dev Tools</SelectItem>
                    <SelectItem value="ai">AI Tools</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-mono text-muted-foreground">Total Cost</Label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">{sym}</span>
                    <Input type="number" value={form.totalCost} onChange={e => updateForm('totalCost', e.target.value)} className="h-12 pl-10 bg-white/5 rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-mono text-muted-foreground">Slots</Label>
                <Input type="number" value={form.slots} onChange={e => updateForm('slots', e.target.value)} className="h-12 bg-white/5 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-mono text-muted-foreground">Cycle</Label>
                <Select value={form.billingCycle} onValueChange={v => updateForm('billingCycle', v)}>
                  <SelectTrigger className="h-12 bg-white/5 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>
        </div>
        <aside className="lg:col-span-4">
          <PremiumCard className="p-6 text-center space-y-4">
            <p className="text-[10px] uppercase font-mono text-muted-foreground">Slot Yield</p>
            <div className="text-4xl font-black">{sym}{(parseFloat(form.totalCost || '0') / parseInt(form.slots || '1')).toFixed(2)}</div>
            <Button className="w-full h-12" onClick={() => setStep(3)}>Review</Button>
          </PremiumCard>
        </aside>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="max-w-lg mx-auto space-y-6">
      <h2 className="font-display font-bold text-xl">Review</h2>
      <div className="bg-white/5 p-6 rounded-xl space-y-4">
        <div className="flex justify-between"><span>Platform</span><span>{platform?.name}</span></div>
        <div className="flex justify-between"><span>Plan</span><span>{form.planName}</span></div>
        <div className="flex justify-between font-bold text-primary"><span>Price/Slot</span><span>{sym}{(parseFloat(form.totalCost) / parseInt(form.slots)).toFixed(2)}</span></div>
      </div>
      <Button className="w-full h-14 text-lg" disabled={submitting} onClick={handlePublish}>Publish</Button>
      <Button variant="ghost" className="w-full" onClick={() => setStep(2)}>Back</Button>
    </div>
  );

  return (
    <div className="container py-12">
      <StepIndicator step={step} />
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
}
