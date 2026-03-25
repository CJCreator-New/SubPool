// ─── Referral System UI ──────────────────────────────────────────────────────
// Shows the user's referral code, copy link, and their referral stats.

import { useState } from 'react';
import { Copy, Check, Users, Gift } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from './ui/utils';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase/client';
import { useAuth } from '../../lib/supabase/auth';

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
        <div
            className={cn(
                'rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-4',
                className
            )}
            onMouseEnter={loadStats}
            onFocus={loadStats}
        >
            <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Gift className="size-5 text-primary" />
                </div>
                <div>
                    <p className="font-display font-bold text-sm">Invite Friends</p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                        Earn rewards for every signup via your link
                    </p>
                </div>
            </div>

            {/* Referral code display */}
            <div className="flex items-center gap-2">
                <div className="flex-1 rounded-md border border-border bg-background px-3 py-2 font-mono text-sm font-bold tracking-widest text-foreground select-all">
                    {referralCode}
                </div>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={copyLink}
                    className={cn(
                        'shrink-0 h-9 transition-all',
                        copied && 'border-primary/40 bg-primary/10 text-primary'
                    )}
                >
                    {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    <span className="ml-1.5">{copied ? 'Copied' : 'Copy'}</span>
                </Button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="flex items-center gap-4 pt-1 border-t border-border/50">
                    <div className="flex items-center gap-1.5">
                        <Users className="size-3.5 text-muted-foreground" />
                        <span className="font-mono text-[11px] text-muted-foreground">
                            <span className="font-bold text-foreground">{stats.count}</span> signed up
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Gift className="size-3.5 text-primary" />
                        <span className="font-mono text-[11px] text-muted-foreground">
                            <span className="font-bold text-primary">{stats.rewardsGranted}</span> rewards
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

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
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 font-mono text-sm tracking-widest uppercase placeholder:normal-case placeholder:tracking-normal text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Button
                size="sm"
                variant="outline"
                onClick={handleApply}
                disabled={!value.trim() || loading}
            >
                {loading ? '…' : 'Apply'}
            </Button>
        </div>
    );
}
