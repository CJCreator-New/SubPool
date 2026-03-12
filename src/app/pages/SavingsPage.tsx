import React, { useState, useMemo, useRef } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Slider } from '../components/ui/slider';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { PLATFORM_PRICING_SEED } from '../../lib/pricing-seed';
import { useCurrency } from '../../lib/currency-context';
import { CurrencyToggle } from '../components/currency-toggle';
import { useAuth } from '../../lib/supabase/auth';
import { toast } from 'sonner';
import { track } from '../../lib/analytics';
import html2canvas from 'html2canvas';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { BeforeAfterSlider } from '../components/before-after-slider';
import { PlatformIcon } from '../components/subpool-components';

// â”€â”€â”€ Subcomponents â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
    return (
        <div className="flex flex-col items-center p-6 bg-card border border-border rounded-[6px]">
            <span className="font-mono text-[10px] uppercase text-muted-foreground mb-1">{label}</span>
            <span className="font-display font-black text-2xl text-foreground">{value}</span>
            <span className="font-mono text-[10px] text-primary mt-1">{sub}</span>
        </div>
    );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-6 text-center">
            {children}
        </h3>
    );
}

// â”€â”€â”€ Savings Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function SavingsPage() {
    const { profile } = useAuth();
    const [selectedPlatformId, setSelectedPlatformId] = useState('netflix');
    const [memberCount, setMemberCount] = useState(4);
    const { currency, setCurrency, formatPrice } = useCurrency();
    const cardRef = useRef<HTMLDivElement>(null);

    // Filter seeds based on platform and currency
    const availablePlatforms = useMemo(() => {
        const unique = new Map();
        PLATFORM_PRICING_SEED.forEach(s => {
            if (!unique.has(s.platform_id)) unique.set(s.platform_id, s.platform_name);
        });
        return Array.from(unique.entries()).map(([id, name]) => ({ id, name }));
    }, []);

    const currentSeed = useMemo(() => {
        return PLATFORM_PRICING_SEED.find(
            s => s.platform_id === selectedPlatformId &&
                s.currency === currency &&
                s.supports_sharing
        ) || PLATFORM_PRICING_SEED.find(s => s.platform_id === selectedPlatformId);
    }, [selectedPlatformId, currency]);

    const soloPrice = currentSeed?.official_price || 0;
    const subPoolPrice = soloPrice / memberCount;
    const monthlySavings = soloPrice - subPoolPrice;
    const annualSavings = monthlySavings * 12;
    const savingsPct = soloPrice > 0 ? (monthlySavings / soloPrice) * 100 : 0;

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20">

            {/* â”€â”€â”€ Hero Section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <section className="text-center pt-8 pb-12 border-b border-border">
                <div className="text-4xl mb-4">ðŸ’¡</div>
                <h1 className="font-display font-black text-[32px] md:text-[40px] tracking-tight leading-tight mb-3">
                    How SubPool saves you money
                </h1>
                <p className="text-muted-foreground text-base max-w-md mx-auto">
                    Real prices. Real savings. No guesswork. Join 3,000+ members splitting costs fairly.
                </p>

                <div className="flex justify-center mt-6">
                    <CurrencyToggle />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <StatCard label="Avg. Savings" value="67%" sub="vs official solo plans" />
                    <StatCard label="Avg. Saved/Year" value={currency === 'INR' ? 'â‚¹4,200' : '$480'} sub="per active member" />
                    <StatCard label="Open Pools" value="142" sub="live results right now" />
                </div>

                <Card className="mt-6 border-dashed border-border bg-card/40 text-left">
                    <CardContent className="p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="font-mono text-xs text-foreground">
                            Data source: platform pricing seeds and live pool listing snapshots.
                        </p>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                            Freshness: daily | Confidence: medium
                        </p>
                    </CardContent>
                </Card>
            </section>

            {/* â”€â”€â”€ Before / After Demo â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <section>
                <SectionLabel>THE DIFFERENCE</SectionLabel>
                <BeforeAfterSlider
                    leftLabel="WITHOUT SUBPOOL"
                    rightLabel="WITH SUBPOOL"
                    leftContent={
                        <div className="flex flex-col h-full justify-between pb-2">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <PlatformIcon platformId="netflix" size="sm" />
                                    <span className="font-display font-bold text-sm text-foreground">Netflix</span>
                                    <span className="font-mono text-xs text-muted-foreground ml-auto" role="img" aria-label="icon">â‚¹649/mo</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <PlatformIcon platformId="chatgpt" size="sm" />
                                    <span className="font-display font-bold text-sm text-foreground">ChatGPT</span>
                                    <span className="font-mono text-xs text-muted-foreground ml-auto" role="img" aria-label="icon">â‚¹1,699/mo</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <PlatformIcon platformId="figma" size="sm" />
                                    <span className="font-display font-bold text-sm text-foreground">Figma</span>
                                    <span className="font-mono text-xs text-muted-foreground ml-auto">$12/mo</span>
                                </div>
                            </div>
                            <div className="mt-8">
                                <p className="font-mono text-[11px] text-muted-foreground mb-1">Paying full price ðŸ˜”</p>
                                <p className="font-display font-bold text-[32px] text-[#FF4D4D] leading-none">â‚¹2,840/mo</p>
                            </div>
                        </div>
                    }
                    rightContent={
                        <div className="flex flex-col h-full justify-between pb-2">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <PlatformIcon platformId="netflix" size="sm" />
                                    <span className="font-display font-bold text-sm text-foreground">Netflix</span>
                                    <span className="font-mono text-xs text-muted-foreground ml-auto" role="img" aria-label="icon">â‚¹162/mo</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <PlatformIcon platformId="chatgpt" size="sm" />
                                    <span className="font-display font-bold text-sm text-foreground">ChatGPT</span>
                                    <span className="font-mono text-xs text-muted-foreground ml-auto" role="img" aria-label="icon">â‚¹425/mo</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <PlatformIcon platformId="figma" size="sm" />
                                    <span className="font-display font-bold text-sm text-foreground">Figma</span>
                                    <span className="font-mono text-xs text-muted-foreground ml-auto">$3/mo</span>
                                </div>
                            </div>
                            <div className="mt-8 flex justify-between items-end">
                                <div>
                                    <p className="font-mono text-[11px] text-muted-foreground mb-1">Shared via SubPool ðŸŽ‰</p>
                                    <p className="font-display font-bold text-[32px] text-primary leading-none">â‚¹810/mo</p>
                                </div>
                                <div className="text-right pb-1 hidden sm:block">
                                    <p className="font-mono text-[12px] text-[#4DFF91]">Save â‚¹2,030/mo Â· â‚¹24,360/year</p>
                                </div>
                            </div>
                            {/* Mobile savings callout */}
                            <div className="mt-2 text-left block sm:hidden">
                                <p className="font-mono text-[12px] text-[#4DFF91]">Save â‚¹2,030/mo Â· â‚¹24,360/year</p>
                            </div>
                        </div>
                    }
                />
            </section>

            {/* â”€â”€â”€ Calculator Section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <section>
                <SectionLabel>TRY IT YOURSELF</SectionLabel>
                <Card className="border-border bg-card overflow-hidden">
                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end mb-12">
                            <div className="space-y-3">
                                <label className="font-mono text-[10px] uppercase text-muted-foreground">Platform</label>
                                <Select value={selectedPlatformId} onValueChange={setSelectedPlatformId}>
                                    <SelectTrigger className="bg-secondary/30 border-border h-11">
                                        <SelectValue placeholder="Select platform" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availablePlatforms.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <label className="font-mono text-[10px] uppercase text-muted-foreground">Members</label>
                                    <span className="font-display font-bold text-primary">{memberCount} people</span>
                                </div>
                                <Slider
                                    value={[memberCount]}
                                    onValueChange={([val]) => setMemberCount(val)}
                                    min={2}
                                    max={8}
                                    step={1}
                                    className="py-1"
                                />
                            </div>

                            <div className="flex justify-end">
                                <div className="inline-flex bg-secondary/30 p-1 rounded-md border border-border">
                                    <button
                                        onClick={() => setCurrency('INR')}
                                        className={`px-4 py-1.5 rounded text-sm font-display font-bold transition-colors ${currency === 'INR' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        â‚¹
                                    </button>
                                    <button
                                        onClick={() => setCurrency('USD')}
                                        className={`px-4 py-1.5 rounded text-sm font-display font-bold transition-colors ${currency === 'USD' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        $
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 py-8 border-y border-border/50">
                            <div className="text-center">
                                <span className="block font-mono text-[10px] uppercase text-muted-foreground mb-2">Paying Solo</span>
                                <span className="font-display font-bold text-[36px] md:text-[48px] text-muted-foreground line-through opacity-50">
                                    {formatPrice(soloPrice)}
                                </span>
                                <span className="text-muted-foreground text-sm ml-1">/mo</span>
                            </div>

                            <div className="text-3xl text-primary animate-pulse hidden md:block">â†’</div>

                            <div className="text-center">
                                <span className="block font-mono text-[10px] uppercase text-primary mb-2">With SubPool</span>
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={subPoolPrice}
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="font-display font-bold text-[36px] md:text-[48px] text-primary"
                                    >
                                        {formatPrice(subPoolPrice)}
                                    </motion.span>
                                </AnimatePresence>
                                <span className="text-primary text-sm ml-1 font-bold">/mo</span>
                            </div>
                        </div>

                        <div className="mt-8 bg-primary/5 border border-primary/15 rounded-xl p-6 text-center">
                            <motion.div
                                key={monthlySavings}
                                initial={{ y: 5, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="font-display font-bold text-xl text-primary mb-1"
                            >
                                You save {formatPrice(monthlySavings)}/mo Â· {formatPrice(annualSavings)}/year Â· {savingsPct.toFixed(0)}% less
                            </motion.div>
                            <p className="font-mono text-[11px] text-muted-foreground italic">
                                At {formatPrice(subPoolPrice)}/slot with {memberCount} people sharing a {currentSeed?.platform_name || selectedPlatformId} {currentSeed?.plan_name} plan
                            </p>
                        </div>

                        {/* â”€â”€â”€ Share Section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                        <div className="mt-8 pt-6 border-t border-border/50 flex flex-col items-center">
                            <span className="font-mono text-[11px] uppercase text-muted-foreground mb-4">Share this</span>

                            {/* Hidden Share Card */}
                            <div className="overflow-hidden absolute -left-[9999px]">
                                <div
                                    ref={cardRef}
                                    id="savings-share-card"
                                    className="w-[400px] h-[200px] bg-[#0E0E0E] border border-primary/30 rounded-[10px] p-6 flex flex-col justify-between"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-display font-black text-white text-lg tracking-tight">SubPool</span>
                                        <span className="font-mono text-[10px] text-muted-foreground">subpool.app</span>
                                    </div>
                                    <div className="text-center my-4">
                                        <div className="font-display font-black text-[28px] text-primary leading-tight">
                                            I save {savingsPct.toFixed(0)}% on {currentSeed?.platform_name || selectedPlatformId}
                                        </div>
                                        <div className="font-mono text-[14px] text-muted-foreground mt-2">
                                            {formatPrice(monthlySavings)}/mo Â· {formatPrice(annualSavings)}/year
                                        </div>
                                    </div>
                                    <div className="bg-primary/5 rounded-[4px] py-1.5 text-center w-full">
                                        <span className="font-mono text-[10px] text-primary/70">Powered by SubPool â€” subpool.app</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={async () => {
                                        if (!cardRef.current) return;
                                        try {
                                            const canvas = await html2canvas(cardRef.current, { backgroundColor: '#0E0E0E' });
                                            canvas.toBlob(blob => {
                                                if (blob) {
                                                    navigator.clipboard.write([
                                                        new ClipboardItem({ 'image/png': blob })
                                                    ]);
                                                    toast.success("Image copied!");
                                                    track('savings_card_copied', { platformId: selectedPlatformId, savingsPct });
                                                }
                                            });
                                        } catch (err) {
                                            toast.error("Failed to copy image");
                                        }
                                    }}
                                >
                                    ðŸ“‹ Copy image
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        window.open(`https://twitter.com/intent/tweet?text=I save ${savingsPct.toFixed(0)}% on ${currentSeed?.platform_name || selectedPlatformId} with SubPool!&url=https://subpool.app&hashtags=SubPool,SaveMoney`);
                                        track('savings_twitter_share', { platformId: selectedPlatformId, savingsPct });
                                    }}
                                >
                                    ð• Twitter
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        window.open(`https://wa.me/?text=I save ${savingsPct.toFixed(0)}% on ${currentSeed?.platform_name || selectedPlatformId} with SubPool! Check it out: https://subpool.app`);
                                    }}
                                >
                                    ðŸ’¬ WhatsApp
                                </Button>
                            </div>
                        </div>

                    </CardContent>
                </Card>
            </section>

            {/* â”€â”€â”€ Comparison Table â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <section>
                <SectionLabel>WHO SAVES THE MOST</SectionLabel>
                <div className="bg-card border border-border rounded-[6px] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border bg-secondary/20">
                                    <th className="px-6 py-4 font-mono text-[10px] uppercase text-muted-foreground">Persona</th>
                                    <th className="px-6 py-4 font-mono text-[10px] uppercase text-muted-foreground text-right">Solo/mo</th>
                                    <th className="px-6 py-4 font-mono text-[10px] uppercase text-muted-foreground text-right">SubPool/mo</th>
                                    <th className="px-6 py-4 font-mono text-[10px] uppercase text-muted-foreground text-right">Monthly Save</th>
                                    <th className="px-6 py-4 font-mono text-[10px] uppercase text-muted-foreground text-right">Annual Save</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {[
                                    { name: "ðŸŽ¬ Solo binge watcher", solo: "â‚¹1,200", sub: "â‚¹360", monthly: "â‚¹840", annual: "â‚¹10,080", pct: "70%" },
                                    { name: "âš¡ Dev using AI tools", solo: "$60", sub: "$18", monthly: "$42", annual: "$504", pct: "70%" },
                                    { name: "ðŸš€ Startup team (4 ppl)", solo: "$200", sub: "$80", monthly: "$120", annual: "$1,440", pct: "60%" },
                                    { name: "ðŸŒ India + global mix", solo: "â‚¹2,800", sub: "â‚¹920", monthly: "â‚¹1,880", annual: "â‚¹22,560", pct: "67%" },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-secondary/30 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <span className="font-display font-bold text-sm text-foreground">{row.name}</span>
                                                <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#4DFF91]/10 text-[#4DFF91] font-mono text-[9px] px-1.5 rounded">{row.pct} off</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right font-mono text-xs text-muted-foreground line-through">{row.solo}</td>
                                        <td className="px-6 py-5 text-right font-display font-bold text-sm text-foreground">{row.sub}</td>
                                        <td className="px-6 py-5 text-right font-mono text-xs font-medium text-[#4DFF91]">{row.monthly}</td>
                                        <td className="px-6 py-5 text-right font-display font-black text-primary">{row.annual}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="p-4 font-mono text-[10px] text-muted-foreground text-center border-t border-border/50 italic">
                        * Estimates based on official pricing and typical SubPool pools. Actual savings depend on platform, plan, and pool size.
                    </p>
                </div>
            </section>

            {/* â”€â”€â”€ Smart Tips Grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <section>
                <SectionLabel>SMART PRICING TIPS</SectionLabel>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-card border border-border rounded-[6px] p-6 flex flex-col">
                        <div className="text-2xl mb-4">ðŸ’¡</div>
                        <h4 className="font-display font-bold text-lg mb-3">Look for "Fair" rated pools</h4>
                        <p className="font-mono text-[12px] text-muted-foreground leading-relaxed flex-1">
                            Pools priced in the 65â€“85% range of solo cost fill fastest and offer the best value. Use markers like <span className="text-primary italic">"STEAL"</span> to find early-bird deals.
                        </p>
                        <div className="mt-6 pt-4 border-t border-border/50">
                            <span className="inline-block bg-primary/10 text-primary font-mono text-[10px] font-bold rounded-full px-3 py-1">
                                ðŸ’° Best savings: 65â€“85% cost
                            </span>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-[6px] p-6 flex flex-col">
                        <div className="text-2xl mb-4">ðŸŽ¬</div>
                        <h4 className="font-display font-bold text-lg mb-3">Price for speed, not profit</h4>
                        <p className="font-mono text-[12px] text-muted-foreground leading-relaxed flex-1">
                            For Netflix 4K, set slots at â‚¹130â€“165. This attracts members instantly, meaning your own bill gets offset in less than 24 hours.
                        </p>
                        <div className="mt-6 pt-4 border-t border-border/50">
                            <span className="inline-block bg-primary/10 text-primary font-mono text-[10px] font-bold rounded-full px-3 py-1">
                                âš¡ Sweet spot: 75% market rate
                            </span>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-[6px] p-6 flex flex-col">
                        <div className="text-2xl mb-4">âš¡</div>
                        <h4 className="font-display font-bold text-lg mb-3">Team plans are the future</h4>
                        <p className="font-mono text-[12px] text-muted-foreground leading-relaxed flex-1">
                            For AI tools like ChatGPT or Cursor, use "Team" plans. They offer better features and are designed for splitting per seat officially.
                        </p>
                        <div className="mt-6 pt-4 border-t border-border/50">
                            <span className="inline-block bg-primary/10 text-primary font-mono text-[10px] font-bold rounded-full px-3 py-1">
                                âœ… Use Team plans, not Personal
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* â”€â”€â”€ Platform Guide â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <section>
                <SectionLabel>PLATFORM QUICK GUIDE</SectionLabel>
                <Tabs defaultValue="global-ott" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-secondary/20 h-12 p-1 border border-border rounded-lg mb-8">
                        <TabsTrigger value="global-ott" className="font-display font-bold text-sm data-[state=active]:bg-card">Global OTT</TabsTrigger>
                        <TabsTrigger value="india-ott" className="font-display font-bold text-sm data-[state=active]:bg-card">India ðŸ‡®ðŸ‡³</TabsTrigger>
                        <TabsTrigger value="ai" className="font-display font-bold text-sm data-[state=active]:bg-card">AI / IDE Tools</TabsTrigger>
                        <TabsTrigger value="saas" className="font-display font-bold text-sm data-[state=active]:bg-card">Team SaaS</TabsTrigger>
                    </TabsList>

                    <TabsContent value="global-ott">
                        <div className="bg-card border border-border rounded-[6px] overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-secondary/10 border-b border-border">
                                            <th className="px-6 py-3 font-mono text-[10px] uppercase text-muted-foreground">Platform</th>
                                            <th className="px-6 py-3 font-mono text-[10px] uppercase text-muted-foreground">Best Shared Plan</th>
                                            <th className="px-6 py-3 font-mono text-[10px] uppercase text-muted-foreground text-right">Solo Price</th>
                                            <th className="px-6 py-3 font-mono text-[10px] uppercase text-muted-foreground">Policy</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {[
                                            { name: 'Netflix', plan: '4K / Premium', price: formatPrice(22.99), policy: 'allowed', color: '#4DFF91' },
                                            { name: 'Spotify', plan: 'Family', price: formatPrice(16.99), policy: 'allowed', color: '#4DFF91' },
                                            { name: 'YouTube', plan: 'Family', price: formatPrice(22.99), policy: 'allowed', color: '#4DFF91' },
                                            { name: 'Disney+', plan: 'Premium', price: formatPrice(13.99), policy: 'allowed', color: '#4DFF91' },
                                            { name: 'Apple One', plan: 'Family', price: formatPrice(25.95), policy: 'allowed', color: '#4DFF91' },
                                        ].map((p, i) => (
                                            <tr key={i} className="hover:bg-secondary/10 transition-colors">
                                                <td className="px-6 py-4 font-display font-bold text-sm">{p.name}</td>
                                                <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{p.plan}</td>
                                                <td className="px-6 py-4 font-mono text-xs text-right text-foreground">{p.price}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-0.5 rounded-full font-mono text-[9px]" style={{ backgroundColor: p.color + '20', color: p.color }}>
                                                        {p.policy.toUpperCase()}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="india-ott">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { id: 'hotstar', name: 'Hotstar Premium', solo: 1499, slots: 4, pool: 375, save: '75%' },
                                { id: 'jiocinema', name: 'JioCinema Premium', solo: 599, slots: 4, pool: 150, save: '75%' },
                                { id: 'zee5', name: 'ZEE5 Premium', solo: 1199, slots: 3, pool: 400, save: '66%' },
                                { id: 'sonyliv', name: 'SonyLIV Premium', solo: 999, slots: 5, pool: 200, save: '80%' },
                            ].map((p, i) => (
                                <div key={i} className="bg-card border border-border p-5 rounded-[6px] flex justify-between items-center group hover:border-primary/50 transition-colors">
                                    <div>
                                        <h5 className="font-display font-bold text-base mb-1">{p.name}</h5>
                                        <div className="flex gap-4 items-center">
                                            <span className="font-mono text-[11px] text-primary">SubPool: {formatPrice(p.pool)}/slot</span>
                                            <span className="font-mono text-[10px] text-muted-foreground line-through">Solo: {formatPrice(p.solo)}/mo</span>
                                        </div>
                                    </div>
                                    <span className="font-mono text-[9px] px-2 py-1 bg-secondary/50 rounded uppercase tracking-tighter text-muted-foreground border border-border/50">
                                        Save {p.save}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="ai">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { name: 'ChatGPT', team: formatPrice(25) + '/seat', individual: formatPrice(20) + '/mo', note: 'Allowed on Team' },
                                { name: 'Claude', team: formatPrice(25) + '/seat', individual: formatPrice(20) + '/mo', note: 'Allowed on Team' },
                                { name: 'Cursor', team: formatPrice(40) + '/seat', individual: formatPrice(20) + '/mo', note: 'Team Recommended' },
                                { name: 'GitHub Copilot', team: formatPrice(19) + '/seat', individual: formatPrice(10) + '/mo', note: 'Team Recommended' },
                            ].map((tool, i) => (
                                <div key={i} className="bg-card border border-border p-5 rounded-[6px] flex justify-between items-center group hover:border-primary/50 transition-colors">
                                    <div>
                                        <h5 className="font-display font-bold text-base mb-1">{tool.name}</h5>
                                        <div className="flex gap-4 items-center">
                                            <span className="font-mono text-[11px] text-primary">Team: {tool.team}</span>
                                            <span className="font-mono text-[10px] text-muted-foreground">Solo: {tool.individual}</span>
                                        </div>
                                    </div>
                                    <span className="font-mono text-[9px] px-2 py-1 bg-secondary/50 rounded uppercase tracking-tighter text-muted-foreground border border-border/50">
                                        {tool.note}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="saas">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { name: 'Figma', plan: 'Professional', price: formatPrice(15) + '/seat', note: 'Standard for teams' },
                                { name: 'Notion', plan: 'Plus / Business', price: formatPrice(10) + '/seat', note: 'Standard for teams' },
                                { name: 'Linear', plan: 'Plus', price: formatPrice(10) + '/seat', note: 'Standard for teams' },
                                { name: 'Slack', plan: 'Pro', price: formatPrice(8.75) + '/seat', note: 'Standard for teams' },
                            ].map((tool, i) => (
                                <div key={i} className="bg-card border border-border p-5 rounded-[6px] flex justify-between items-center group hover:border-primary/50 transition-colors">
                                    <div>
                                        <h5 className="font-display font-bold text-base mb-1">{tool.name}</h5>
                                        <div className="flex gap-4 items-center">
                                            <span className="font-mono text-[11px] text-primary">{tool.plan}: {tool.price}</span>
                                        </div>
                                    </div>
                                    <span className="font-mono text-[9px] px-2 py-1 bg-[#4DFF91]/10 text-[#4DFF91] rounded uppercase tracking-tighter border border-[#4DFF91]/20">
                                        OFFICIAL SUPPORT
                                    </span>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </section>

            {/* â”€â”€â”€ Pro Teaser â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {(profile?.plan === 'free' || !profile) && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <SectionLabel>UNLOCK MORE WITH PRO</SectionLabel>
                    <div className="relative group overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 group-hover:from-primary/20 transition-all duration-500" />
                        <div className="relative bg-card border border-primary/20 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="text-center md:text-left">
                                <h4 className="font-display font-black text-2xl text-foreground mb-3 flex items-center gap-3 justify-center md:justify-start">
                                    ðŸš€ Host Plus
                                    <span className="bg-primary/20 text-primary font-mono text-[10px] px-2 py-0.5 rounded-full border border-primary/30">ALPHA</span>
                                </h4>
                                <p className="font-mono text-sm text-muted-foreground leading-relaxed max-w-md">
                                    Hosting multiple pools? Get priority listing, bulk member reminders, and detailed market intelligence exports.
                                </p>
                            </div>
                            <div className="flex flex-col items-center md:items-end gap-3 min-w-[160px]">
                                <div className="text-right">
                                    <span className="font-display font-black text-3xl text-foreground">$9.99</span>
                                    <span className="font-mono text-sm text-muted-foreground">/mo</span>
                                </div>
                                <Button asChild className="font-display font-bold px-8 h-12 shadow-lg shadow-primary/20">
                                    <Link to="/plans">See all plans â†’</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            )}

        </div>
    );
}
