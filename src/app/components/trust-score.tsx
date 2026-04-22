import React from 'react';
import { Star, Shield, Award, CheckCircle, Fingerprint, CreditCard,Zap } from 'lucide-react';
import { cn } from './ui/utils';
import { motion } from 'motion/react';

interface TrustScoreProps {
    rating: number;
    reviewCount?: number;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    pulse?: boolean;
}

export function TrustScore({ rating, reviewCount, size = 'md', className, pulse }: TrustScoreProps) {
    const safeRating = Math.max(0, Math.min(5, isNaN(rating) ? 0 : rating));

    // Config values based on size
    const starSizeMap = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5'
    };

    const textClassMap = {
        sm: 'text-[10px]',
        md: 'text-xs',
        lg: 'text-sm'
    };

    const sSize = starSizeMap[size];

    return (
        <div className={cn("inline-flex items-center gap-1.5 group select-none relative", className)}>
            {pulse && safeRating >= 4.5 && (
                <div className="absolute inset-0 -m-1 rounded-full border border-primary/30 animate-ping opacity-20 pointer-events-none" />
            )}
            
            <div className="flex relative">
                {/* Background stars */}
                <div className="flex text-muted/30">
                    {[1, 2, 3, 4, 5].map((idx) => (
                        <Star key={`bg-${idx}`} className={sSize} fill="currentColor" strokeWidth={0} />
                    ))}
                </div>

                {/* Foreground filled stars (animated width) */}
                <div
                    className="flex text-[#F5A623] overflow-hidden absolute top-0 left-0 transition-all duration-1000 ease-out"
                    style={{ width: `${(safeRating / 5) * 100}%` }}
                >
                    {[1, 2, 3, 4, 5].map((idx) => (
                        <Star key={`fg-${idx}`} className={cn(sSize, "shrink-0 shadow-glow-primary")} fill="currentColor" strokeWidth={0} />
                    ))}
                </div>
            </div>

            <span className={cn("font-mono font-bold text-foreground transition-colors group-hover:text-primary", textClassMap[size])}>
                {safeRating.toFixed(1)}
            </span>

            {reviewCount !== undefined && (
                <span className={cn("font-mono text-muted-foreground ml-1", textClassMap[size])}>
                    ({reviewCount})
                </span>
            )}
        </div>
    );
}

// ─── Trust Badges ─────────────────────────────────────────────────────────────

type BadgeType = 'new' | 'trusted' | 'pro' | 'identity' | 'payment' | 'top_host' | 'responsive';

interface TrustBadgeProps {
    type: BadgeType;
    className?: string;
    label?: string;
}

export function TrustBadge({ type, className, label }: TrustBadgeProps) {
    const base = "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm font-mono text-[9px] uppercase tracking-wider font-semibold border";
    
    switch (type) {
        case 'new':
            return (
                <div className={cn(base, "bg-blue-500/10 border-blue-500/20 text-blue-500", className)}>
                    {label || 'New Host'}
                </div>
            );
        case 'trusted':
            return (
                <div className={cn(base, "bg-emerald-500/10 border-emerald-500/20 text-emerald-500", className)}>
                    <CheckCircle className="w-2.5 h-2.5" /> {label || 'Trusted'}
                </div>
            );
        case 'pro':
            return (
                <div className={cn(base, "bg-primary/10 border-primary/20 text-primary", className)}>
                    <Award className="w-2.5 h-2.5" /> {label || 'Verified Pro'}
                </div>
            );
        case 'identity':
            return (
                <div className={cn(base, "bg-purple-500/10 border-purple-500/20 text-purple-500 shadow-glow-purple/5", className)}>
                    <Fingerprint className="w-2.5 h-2.5" /> {label || 'ID Verified'}
                </div>
            );
        case 'payment':
            return (
                <div className={cn(base, "bg-amber-500/10 border-amber-500/20 text-amber-500", className)}>
                    <CreditCard className="w-2.5 h-2.5" /> {label || 'Stripe Pay'}
                </div>
            );
        case 'top_host':
            return (
                <div className={cn(base, "bg-primary/20 border-primary/30 text-primary shadow-glow-primary/10", className)}>
                    <Zap className="w-2.5 h-2.5" /> {label || 'Top 1% Host'}
                </div>
            );
        default:
            return null;
    }
}

// ─── Owner Profile Ribbon (Combines and Calculates) ───────────────────────────

export function OwnerTrustRibbon({
    rating,
    totalHosted,
    plan,
    verified = false,
    stripeConnected = false
}: {
    rating: number;
    totalHosted?: number;
    plan?: string;
    verified?: boolean;
    stripeConnected?: boolean;
}) {
    const isPro = plan === 'pro' || plan === 'host_plus';
    const isTrusted = rating >= 4.5 && (totalHosted ?? 0) >= 5;
    const isTopHost = rating >= 4.9 && (totalHosted ?? 0) >= 20;
    const isNew = (totalHosted ?? 0) === 0;

    return (
        <div className="flex flex-wrap items-center gap-2">
            <TrustScore rating={rating} size="sm" pulse={isTopHost} />
            
            <div className="flex flex-wrap gap-1.5">
                {isPro && <TrustBadge type="pro" />}
                {isTopHost && <TrustBadge type="top_host" />}
                {!isTopHost && isTrusted && <TrustBadge type="trusted" />}
                {verified && <TrustBadge type="identity" />}
                {stripeConnected && <TrustBadge type="payment" />}
                {isNew && <TrustBadge type="new" />}
            </div>

            {totalHosted !== undefined && totalHosted > 0 && (
                <span className="font-mono text-[10px] text-muted-foreground border-l border-border pl-2 ml-1">
                    {totalHosted} run{totalHosted !== 1 && 's'}
                </span>
            )}
        </div>
    );
}
