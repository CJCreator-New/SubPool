import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from '../components/ui/accordion';
import { useAuth } from '../../lib/supabase/auth';
import { toast } from 'sonner';
import { track } from '../../lib/analytics';
import { useCurrency } from '../../lib/currency-context';
import { CurrencyToggle } from '../components/currency-toggle';
import { supabase } from '../../lib/supabase/client';
import { redirectToCheckout, isStripeEnabled } from '../../lib/stripe';
import { SEO } from '../components/seo';

// ─── Plans Data ─────────────────────────────────────────────────────────────

const PLANS = [
    {
        id: 'free',
        name: 'Free',
        tagline: 'Get started, no credit card',
        price: { monthly: 0, yearly: 0 },
        highlight: false,
        cta: 'Current plan',
        features: [
            { label: 'Host up to 1 pool', included: true },
            { label: 'Join up to 3 pools', included: true },
            { label: 'Up to 4 members per pool', included: true },
            { label: 'Basic ledger', included: true },
            { label: 'Pool analytics', included: false },
            { label: 'Auto-approve members', included: false },
            { label: 'Priority listing', included: false },
            { label: 'Market intelligence', included: false },
            { label: 'Bulk payment reminders', included: false },
        ]
    },
    {
        id: 'pro',
        name: 'Pro',
        tagline: 'For active savers and small hosts',
        price: { monthly: 4.99, yearly: 47.88 },
        highlight: true,
        cta: 'Upgrade to Pro',
        features: [
            { label: 'Host up to 5 pools', included: true },
            { label: 'Join unlimited pools', included: true },
            { label: 'Up to 6 members per pool', included: true },
            { label: 'Advanced ledger + export', included: true },
            { label: 'Pool analytics', included: true },
            { label: 'Auto-approve members', included: false },
            { label: 'Priority listing', included: false },
            { label: 'Market intelligence', included: false },
            { label: 'Bulk payment reminders', included: true },
        ]
    },
    {
        id: 'host_plus',
        name: 'Host Plus',
        tagline: 'For power hosts and resellers',
        price: { monthly: 9.99, yearly: 95.88 },
        highlight: false,
        cta: 'Upgrade to Host Plus',
        features: [
            { label: 'Unlimited pools hosted', included: true },
            { label: 'Join unlimited pools', included: true },
            { label: 'Up to 10 members per pool', included: true },
            { label: 'Advanced ledger + export', included: true },
            { label: 'Pool analytics', included: true },
            { label: 'Auto-approve members', included: true },
            { label: 'Priority listing', included: true },
            { label: 'Market intelligence', included: true },
            { label: 'Bulk payment reminders', included: true },
        ]
    }
];

// ─── Plans Page ───────────────────────────────────────────────────────────────

export function PlansPage() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const { profile } = useAuth();
    const { currency, formatPrice } = useCurrency();
    const currentPlanId = profile?.plan || 'free';
    React.useEffect(() => {
        track('plans_page_viewed', { currentPlan: currentPlanId });
    }, [currentPlanId]);

    const handleUpgrade = async (planId: string) => {
        track('upgrade_cta_clicked', { targetPlan: planId, billingCycle });

        if (!isStripeEnabled) {
            toast.error('Payment gateway is currently offline.', { description: 'Please try again later. Code: NO_STRIPE_KEYS' });
            return;
        }

        const loadToast = toast.loading('Initializing secure checkout...');

        try {
            if (!supabase) throw new Error('Database connection is uninitialised.');

            const { data, error } = await supabase.functions.invoke('create-checkout-session', {
                body: { planId, billingCycle, currency }
            });

            if (error || !data?.url) {
                throw new Error(error?.message || 'Failed to initialize checkout session');
            }

            toast.dismiss(loadToast);
            // Engage Stripe Redirect (Level 8 Monetization Logic)
            redirectToCheckout(data.url);
        } catch (err: any) {
            console.error('[Stripe] Checkout initialisation failed:', err);
            toast.error('Checkout failed', {
                description: err.message || 'Could not connect to payment provider.',
                id: loadToast
            });
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <SEO 
                title="Premium Plans & Pricing" 
                description="Unlock advanced subscription pooling tools. Pro and Host Plus plans available for power users and resellers. Save more, earn more."
            />
            {/* ─── Header & Toggle ────────────────────────────────────────── */}
            <div className="text-center mb-16">
                <h1 className="font-display font-black text-[32px] md:text-[44px] tracking-tight mb-4">
                    Choose the plan that fits your habits
                </h1>
                <p className="text-muted-foreground text-sm max-w-lg mx-auto mb-10">
                    Save money, coordinate sharing, and manage your subscriptions with powerful tools built for the peer-to-peer economy.
                </p>

                <div className="inline-flex items-center p-1 bg-secondary/30 border border-border rounded-full shadow-inner">
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-8 py-2 rounded-full font-display font-bold text-sm transition-all ${billingCycle === 'monthly' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingCycle('yearly')}
                        className={`px-8 py-2 rounded-full font-display font-bold text-sm transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Yearly
                        <span className="bg-[#4DFF91]/10 text-[#4DFF91] font-mono text-[9px] px-2 py-0.5 rounded-full border border-[#4DFF91]/20">
                            SAVE 20%
                        </span>
                    </button>
                </div>

                <div className="flex justify-center mt-6">
                    <CurrencyToggle />
                </div>
            </div>

            {/* ─── Plans Grid ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {PLANS.map((plan) => {
                    const isCurrent = plan.id === currentPlanId;
                    const monthlyPrice = billingCycle === 'monthly' ? plan.price.monthly : (plan.price.yearly / 12);

                    return (
                        <Card key={plan.id} className={`relative flex flex-col bg-card border-[1.5px] rounded-xl overflow-visible h-full ${plan.highlight ? 'border-primary shadow-xl shadow-primary/5' : 'border-border'
                            }`}>
                            {plan.highlight && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground font-mono text-[10px] font-bold uppercase px-4 py-1 rounded-full whitespace-nowrap z-10">
                                    Most Popular
                                </div>
                            )}

                            <CardHeader className="pb-8 pt-10">
                                <CardTitle className="font-display font-black text-2xl mb-1">{plan.name}</CardTitle>
                                <p className="font-mono text-[11px] text-muted-foreground">{plan.tagline}</p>
                            </CardHeader>

                            <CardContent className="flex-1 space-y-8">
                                <div className="flex items-baseline gap-1">
                                    {plan.price.monthly === 0 ? (
                                        <span className="font-display font-black text-4xl">Free</span>
                                    ) : (
                                        <>
                                            <span className="font-display font-black text-4xl tracking-tight">
                                                {currency === 'INR' ? formatPrice(monthlyPrice * 80) : formatPrice(monthlyPrice)}
                                            </span>
                                            <span className="font-mono text-muted-foreground text-sm">/mo</span>
                                        </>
                                    )}
                                </div>

                                {billingCycle === 'yearly' && plan.price.yearly > 0 && (
                                    <p className="font-mono text-[10px] text-primary bg-primary/5 border border-primary/20 inline-block px-2 py-1 rounded">
                                        Billed annually at {currency === 'INR' ? formatPrice(plan.price.yearly * 80) : formatPrice(plan.price.yearly)}/yr
                                    </p>
                                )}

                                <div className="space-y-4 pt-4">
                                    {plan.features.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className={`size-5 rounded-full flex items-center justify-center shrink-0 ${feature.included ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                                                }`}>
                                                {feature.included ? (
                                                    <span className="text-[10px]" role="img" aria-label="Check">✓</span>
                                                ) : (
                                                    <span className="text-[10px]" role="img" aria-label="icon">−</span>
                                                )}
                                            </div>
                                            <span className={`font-display text-sm ${feature.included ? 'text-foreground' : 'text-muted-foreground opacity-60'}`}>
                                                {feature.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>

                            <CardFooter className="pt-8 pb-10">
                                <Button
                                    className="w-full h-12 font-display font-bold text-sm shadow-sm"
                                    variant={isCurrent ? 'outline' : 'default'}
                                    disabled={isCurrent}
                                    onClick={() => handleUpgrade(plan.id)}
                                >
                                    {isCurrent ? '✓ Current Plan' : plan.cta}
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

            {/* ─── FAQ Section ────────────────────────────────────────────── */}
            <div className="mt-32 max-w-3xl mx-auto">
                <h2 className="font-display font-black text-2xl text-center mb-12">Frequently asked questions</h2>
                <Accordion type="single" collapsible className="w-full space-y-4">
                    <AccordionItem value="switch" className="border border-border rounded-lg bg-card px-6">
                        <AccordionTrigger className="font-display font-bold text-left hover:no-underline">Can I switch plans?</AccordionTrigger>
                        <AccordionContent className="font-mono text-[12px] text-muted-foreground leading-relaxed pb-6">
                            Absolutely. You can upgrade or downgrade anytime. If you upgrade, the change is instant. If you downgrade, your current plan remains active until the end of the billing period.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="limits" className="border border-border rounded-lg bg-card px-6">
                        <AccordionTrigger className="font-display font-bold text-left hover:no-underline">What happens if I exceed free limits?</AccordionTrigger>
                        <AccordionContent className="font-mono text-[12px] text-muted-foreground leading-relaxed pb-6">
                            If you exceed the membership limit, your existing pools remain active, but you won't be able to join new ones until you upgrade to Pro. For hosting, you'll need the Host Plus plan to manage more than 1 pool simultaneously.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="trial" className="border border-border rounded-lg bg-card px-6">
                        <AccordionTrigger className="font-display font-bold text-left hover:no-underline">Is there a free trial for Pro?</AccordionTrigger>
                        <AccordionContent className="font-mono text-[12px] text-muted-foreground leading-relaxed pb-6">
                            Yes! We offer a 7-day free trial for first-time Pro users. No charges will occur until after the trial period ends, and you can cancel anytime.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="priority" className="border border-border rounded-lg bg-card px-6">
                        <AccordionTrigger className="font-display font-bold text-left hover:no-underline">How does Host Plus priority listing work?</AccordionTrigger>
                        <AccordionContent className="font-mono text-[12px] text-muted-foreground leading-relaxed pb-6">
                            Pools hosted by Host Plus members are prioritised in the global browse feed, ensuring 40% faster fill times on average. Your pools also get a "Verified Host" badge.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="refund" className="border border-border rounded-lg bg-card px-6">
                        <AccordionTrigger className="font-display font-bold text-left hover:no-underline">Can I get a refund?</AccordionTrigger>
                        <AccordionContent className="font-mono text-[12px] text-muted-foreground leading-relaxed pb-6">
                            We offer a no-questions-asked refund within 7 days of any transaction if you are unsatisfied with the service. Just contact support and we'll handle it.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    );
}
