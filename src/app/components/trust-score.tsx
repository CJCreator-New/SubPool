import React from 'react';
import { Star, Shield, Award, CheckCircle } from 'lucide-react';
import { cn } from './ui/utils';

interface TrustScoreProps {
    rating: number;
    reviewCount?: number;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function TrustScore({ rating, reviewCount, size = 'md', className }: TrustScoreProps) {
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
        <div className={cn("inline-flex items-center gap-1.5 group select-none", className)}>
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
                        <Star key={`fg-${idx}`} className={cn(sSize, "shrink-0")} fill="currentColor" strokeWidth={0} />
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

interface TrustBadgeProps {
    type: 'new' | 'trusted' | 'pro';
    className?: string;
}

export function TrustBadge({ type, className }: TrustBadgeProps) {
    switch (type) {
        case 'new':
            return (
                <div className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-blue-500/10 border border-blue-500/20 text-blue-500 font-mono text-[9px] uppercase tracking-wider font-semibold", className)}>
                    New Host
                </div>
            );
        case 'trusted':
            return (
                <div className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-mono text-[9px] uppercase tracking-wider font-semibold", className)}>
                    <CheckCircle className="w-2.5 h-2.5" /> Trusted
                </div>
            );
        case 'pro':
            return (
                <div className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-primary/10 border border-primary/20 text-primary font-mono text-[9px] uppercase tracking-wider font-semibold", className)}>
                    <Award className="w-2.5 h-2.5" /> Verified Pro
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
    plan
}: {
    rating: number;
    totalHosted?: number;
    plan?: string;
}) {
    const isPro = plan === 'pro' || plan === 'host_plus';
    const isTrusted = rating >= 4.5 && (totalHosted ?? 0) >= 2;
    const isNew = (totalHosted ?? 0) === 0;

    let badgeType: 'new' | 'trusted' | 'pro' | null = null;
    if (isPro) badgeType = 'pro';
    else if (isTrusted) badgeType = 'trusted';
    else if (isNew) badgeType = 'new';

    return (
        <div className="flex items-center gap-3">
            <TrustScore rating={rating} size="sm" />
            {badgeType && <TrustBadge type={badgeType} />}
            {totalHosted !== undefined && totalHosted > 0 && (
                <span className="font-mono text-[10px] text-muted-foreground border-l border-border pl-2">
                    {totalHosted} run{totalHosted !== 1 && 's'}
                </span>
            )}
        </div>
    );
}
