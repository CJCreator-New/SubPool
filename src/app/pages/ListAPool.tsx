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
import { PlatformIcon } from '../components/subpool-components';
import { PLATFORMS } from '../../lib/constants';
import { createPool } from '../../lib/supabase/mutations';
import type { PoolCategory } from '../../lib/types';
import { useAuth } from '../../lib/supabase/auth';

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
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [form, setForm] = useState({
    planName: '',
    totalCost: '',
    slots: '2',
    category: 'entertainment' as PoolCategory,
    billingCycle: 'monthly' as 'monthly' | 'yearly',
  });
  const [submitting, setSubmitting] = useState(false);

  // Computed
  const pricePerSlot =
    form.totalCost && form.slots
      ? (parseFloat(form.totalCost) / parseInt(form.slots)).toFixed(2)
      : null;
  const savingsPct =
    form.totalCost && form.slots
      ? Math.round((1 - 1 / parseInt(form.slots)) * 100)
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

  // ─── Step 1 — Choose Platform ──────────────────────────────────────────────

  const renderStep1 = () => (
    <div className="max-w-2xl mx-auto">
      <h2 className="font-display font-bold text-xl mb-6">Choose a platform</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {PLATFORMS.map((p) => {
          const isSelected = selectedPlatform === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPlatform(p.id)}
              className={`
                flex flex-col items-center p-3 border rounded-[6px] transition-all text-center cursor-pointer
                ${isSelected
                  ? 'border-primary bg-primary/8 text-primary'
                  : 'border-border hover:border-muted-foreground'
                }
              `}
            >
              <PlatformIcon platformId={p.id} size="sm" />
              <span className="font-display font-semibold text-[11px] mt-1.5">
                {p.name}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-8 flex justify-end">
        <Button
          disabled={!selectedPlatform}
          onClick={() => setStep(2)}
        >
          Continue
        </Button>
      </div>
    </div>
  );

  // ─── Step 2 — Configure ────────────────────────────────────────────────────

  const renderStep2 = () => (
    <div className="max-w-lg mx-auto space-y-5">
      <h2 className="font-display font-bold text-xl mb-6">Configure your pool</h2>

      {/* Plan Name */}
      <div className="space-y-1.5">
        <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Plan Name
        </Label>
        <Input
          placeholder="e.g. Standard 4K"
          value={form.planName}
          onChange={(e) => updateForm('planName', e.target.value)}
        />
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
            <SelectItem value="entertainment">Entertainment</SelectItem>
            <SelectItem value="work">Work</SelectItem>
            <SelectItem value="productivity">Productivity</SelectItem>
            <SelectItem value="ai">AI</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 2-col: Cost + Slots */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Total monthly cost ($)
          </Label>
          <Input
            type="number"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={form.totalCost}
            onChange={(e) => updateForm('totalCost', e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Slots to share
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

      {/* Live Preview */}
      {pricePerSlot && (
        <div className="bg-primary/5 border border-primary/20 rounded-[6px] p-4 mt-4">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block">
            Price Per Slot
          </span>
          <span className="font-display font-bold text-3xl text-primary block mt-1">
            ${pricePerSlot}/mo
          </span>
          <span className="font-mono text-[11px] text-muted-foreground block mt-1">
            Members save {savingsPct}% vs solo plan
          </span>
        </div>
      )}

      {/* Nav */}
      <div className="flex justify-between pt-2">
        <Button variant="ghost" onClick={() => setStep(1)}>
          Back
        </Button>
        <Button disabled={!allFieldsFilled} onClick={() => setStep(3)}>
          Continue
        </Button>
      </div>
    </div>
  );

  // ─── Step 3 — Review ───────────────────────────────────────────────────────

  const handlePublish = async () => {
    if (!selectedPlatform || !platform || !user) return;
    setSubmitting(true);
    try {
      await createPool({
        platform_id: selectedPlatform,
        owner_id: user.id,
        category: form.category,
        status: 'open',
        plan_name: form.planName,
        price_per_slot: Math.round(parseFloat(pricePerSlot!) * 100),
        slots_total: parseInt(form.slots),
        auto_approve: false,
        description: null,
      });
      navigate('/my-pools');
      toast.success('Your pool is live! 🎉');
    } catch {
      toast.error('Failed to publish pool');
    } finally {
      setSubmitting(false);
    }
  };

  const summaryRows = [
    { label: 'Platform', value: platform?.name ?? '' },
    { label: 'Plan', value: form.planName },
    { label: 'Category', value: form.category.charAt(0).toUpperCase() + form.category.slice(1) },
    { label: 'Total cost', value: `$${parseFloat(form.totalCost).toFixed(2)}` },
    { label: 'Slots', value: form.slots },
    {
      label: 'Price per slot',
      value: `$${pricePerSlot}/mo`,
      highlight: true,
    },
    { label: 'Savings', value: `${savingsPct}%` },
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
            <div className="font-mono text-[11px] text-muted-foreground">{form.planName}</div>
          </div>
        </div>

        {/* Key/value rows */}
        {summaryRows.map((row, i) => (
          <div
            key={row.label}
            className={`flex justify-between items-center py-3 ${i < summaryRows.length - 1 ? 'border-b border-border' : ''
              }`}
          >
            <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider">
              {row.label}
            </span>
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
        ))}
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

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="py-6">
      <StepIndicator step={step} />
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
}
