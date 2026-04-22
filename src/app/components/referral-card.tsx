// ─── Viral Referral System UI ──────────────────────────────────────────────────────
// High-fidelity referral dashboard with milestone tracking and social sharing.

import { useState, useMemo } from 'react';
import { Copy, Check, Users, Gift, Share2, Twitter, MessageSquare, Send, Zap, Award } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from './ui/utils';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase/client';
import { useAuth } from '../../lib/supabase/auth';
import { motion, AnimatePresence } from 'motion/react';

interface ReferralStats {
    count: number;
    rewardsGranted: number;
}

export function ReferralCard({ className }: { className?: string }) {
    const { profile } = useAuth();
    const [copied, setCopied] = useState(false);
    const [stats, setStats] = useState<ReferralStats | null>(null);
    const [statsLoaded, setStatsLoaded] = useState(false);

    const referralCode = profile?.referral_code ?? null;
    const referralUrl = referralCode
        ? `${window.location.origin}/login?ref=${referralCode}`
        : null;

    const milestones = [
        { count: 1, label: 'Early Bird', reward: 'Starter Pack' },
        { count: 5, label: 'Ambassador', reward: 'Pro Trial' },
        { count: 20, label: 'Evangelist', reward: 'Free Host Plus' },
        { count: 100, label: 'Legend', reward: 'SubPool Partner' }
    ];

    const currentMilestone = useMemo(() => {
        if (!stats) return milestones[0];
        return milestones.find(m => m.count > stats.count) || milestones[milestones.length - 1];
    }, [stats]);

    const progress = useMemo(() => {
        if (!stats) return 0;
        const prevMilestone = milestones.filter(m => m.count <= stats.count).pop()?.count || 0;
        const range = currentMilestone.count - prevMilestone;
        const current = stats.count - prevMilestone;
        return Math.min(100, (current / range) * 100);
    }, [stats, currentMilestone]);

    const copyLink = async () => {
        if (!referralUrl) return;
        try {
            await navigator.clipboard.writeText(referralUrl);
            setCopied(true);
            toast.success('Referral link copied!');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Could not copy link.');
        }
    };

    const shareOnTwitter = () => {
        const text = `Join me on SubPool and optimize your subscription capital! Use my code: ${referralCode}`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralUrl!)}`);
    };

    const shareOnWhatsApp = () => {
        const text = `Join me on SubPool! Code: ${referralCode} - ${referralUrl}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
    };

    // Lazy-load stats on hover/focus
    const loadStats = async () => {
        if (statsLoaded || !profile?.id || !supabase) return;
        setStatsLoaded(true);
        try {
            const { count } = await supabase
                .from('referrals')
                .select('*', { count: 'exact', head: true })
                .eq('referrer_id', profile.id);
            const { count: rewarded } = await supabase
                .from('referrals')
                .select('*', { count: 'exact', head: true })
                .eq('referrer_id', profile.id)
                .eq('reward_granted', true);
            setStats({ count: count ?? 0, rewardsGranted: rewarded ?? 0 });
        } catch { /* silent */ }
    };

    if (!referralCode) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                'rounded-2xl border border-primary/20 bg-primary/5 p-6 relative overflow-hidden group shadow-glow-primary/5',
                className
            )}
            onMouseEnter={loadStats}
            onFocus={loadStats}
        >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 size-32 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-glow-primary/10">
                        <Gift className="size-6 text-primary" />
                    </div>
                    <div>
                        <p className="font-display font-black text-lg uppercase italic tracking-tight">Viral Protocol</p>
                        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Scale the network, earn rewards.</p>
                    </div>
                </div>
                {stats && stats.count >= 5 && (
                    <Badge className="bg-primary/20 text-primary border-primary/30 font-mono text-[9px] uppercase">
                        <Zap size={10} className="mr-1" /> Viral Boost Active
                    </Badge>
                )}
            </div>

            {/* Referral code display */}
            <div className="flex items-center gap-2 mb-6 relative z-10">
                <div className="flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-lg font-bold tracking-[0.3em] text-primary select-all text-center">
                    {referralCode}
                </div>
                <Button
                    size="icon"
                    variant="outline"
                    onClick={copyLink}
                    className={cn(
                        'size-12 rounded-xl transition-all border-white/10',
                        copied && 'border-primary bg-primary text-black'
                    )}
                >
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                </Button>
            </div>

            {/* Milestone Progress */}
            {stats && (
                <div className="space-y-3 mb-6 relative z-10">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Next Milestone</p>
                            <p className="font-display font-black text-sm uppercase italic">{currentMilestone.label}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-mono text-[10px] text-muted-foreground uppercase">{stats.count} / {currentMilestone.count}</p>
                            <p className="font-mono text-[9px] text-primary uppercase font-bold tracking-tighter">Reward: {currentMilestone.reward}</p>
                        </div>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-primary shadow-glow-primary"
                        />
                    </div>
                </div>
            )}

            {/* Share Buttons */}
            <div className="grid grid-cols-3 gap-3 relative z-10">
                <Button variant="ghost" size="sm" onClick={shareOnTwitter} className="h-10 bg-white/[0.02] border border-white/5 hover:bg-sky-500/10 hover:border-sky-500/20 hover:text-sky-400">
                    <Twitter size={14} className="mr-2" /> 𝕏
                </Button>
                <Button variant="ghost" size="sm" onClick={shareOnWhatsApp} className="h-10 bg-white/[0.02] border border-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/20 hover:text-emerald-400">
                    <MessageSquare size={14} className="mr-2" /> WA
                </Button>
                <Button variant="ghost" size="sm" className="h-10 bg-white/[0.02] border border-white/5 hover:bg-blue-500/10 hover:border-blue-500/20 hover:text-blue-400">
                    <Send size={14} className="mr-2" /> TG
                </Button>
            </div>

            {/* Footer Stats */}
            {stats && (
                <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <Users className="size-3.5 text-muted-foreground" />
                            <span className="font-mono text-[10px] text-muted-foreground uppercase">
                                <span className="font-bold text-foreground">{stats.count}</span> Conversions
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Award className="size-3.5 text-primary" />
                            <span className="font-mono text-[10px] text-muted-foreground uppercase">
                                <span className="font-bold text-primary">{stats.rewardsGranted}</span> Granted
                            </span>
                        </div>
                    </div>
                    <p className="font-mono text-[9px] text-muted-foreground uppercase opacity-40">System verified</p>
                </div>
            )}
        </motion.div>
    );
}

import { Badge } from './ui/badge';

// ─── Inline referral code input (for signup / onboarding) ───────────────────

interface ReferralInputProps {
    onApply: (code: string) => void;
    className?: string;
}

export function ReferralInput({ onApply, className }: ReferralInputProps) {
    const [value, setValue] = useState('');
    const [loading, setLoading] = useState(false);

    const handleApply = async () => {
        const code = value.trim().toUpperCase();
        if (!code || !supabase) return;
        setLoading(true);
        try {
            const { data } = await supabase
                .from('profiles')
                .select('id, username')
                .eq('referral_code', code)
                .maybeSingle();
            if (!data) { toast.error('Referral code not found.'); return; }
            onApply(code);
            toast.success(`Referral applied! You were referred by @${data.username}.`);
        } catch {
            toast.error('Could not verify referral code.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cn('flex gap-2', className)}>
            <input
                value={value}
                onChange={e => setValue(e.target.value.toUpperCase())}
                placeholder="REFERRAL CODE"
                maxLength={8}
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 font-mono text-sm tracking-widest uppercase placeholder:normal-case placeholder:tracking-normal text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white/[0.04] transition-all"
            />
            <Button
                size="sm"
                variant="outline"
                onClick={handleApply}
                disabled={!value.trim() || loading}
                className="rounded-xl px-6 border-white/10"
            >
                {loading ? '…' : 'Apply'}
            </Button>
        </div>
    );
}
