// ─── SubPool Component Library ─────────────────────────────────────────────────
// Built on top of shadcn/ui primitives — never recreates what already exists.

import React from 'react';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { cn } from './ui/utils';
import { motion, AnimatePresence } from 'motion/react';
import { getPlatform } from '../../lib/constants';
import { analyzePricing, detectUserCurrency } from '../../lib/pricing-service';
import { useCurrency } from '../../lib/currency-context';
import type { Pool, Notification } from '../../lib/types';
import { TrustScore, TrustBadge } from './trust-score';

// timeAgo helper
function timeAgo(dateStr: string): string {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diffMs = now - then;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

// ─── 1. SlotBar ───────────────────────────────────────────────────────────────

interface SlotBarProps {
    filled: number;
    total: number;
    size?: 'sm' | 'md';
    animate?: boolean;
}

export function SlotBar({ filled, total, size = 'md', animate = false }: SlotBarProps) {
    const h = size === 'sm' ? 'h-1' : 'h-1.5';

    return (
        <div>
            <div className="flex gap-1">
                {Array.from({ length: total }, (_, i) => (
                    <div
                        key={i}
                        className={cn(
                            'flex-1 rounded-full relative overflow-hidden bg-muted',
                            h,
                        )}
                    >
                        {i < filled && (
                            <motion.div
                                initial={animate ? { width: 0 } : { width: '100%' }}
                                animate={{ width: '100%' }}
                                transition={{ 
                                    duration: 0.5, 
                                    delay: i * 0.1, 
                                    ease: [0.23, 1, 0.32, 1] 
                                }}
                                className="absolute inset-0 bg-primary"
                            />
                        )}
                    </div>
                ))}
            </div>
            <p className="font-mono text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1.5">
                <span className="text-foreground font-bold">{filled}/{total}</span>
                <span>slots filled</span>
            </p>
        </div>
    );
}

// ─── 2. StatusPill ────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
    open: '#4DFF91',
    paid: '#4DFF91',
    active: '#4DFF91',
    full: '#6B6860',
    pending: '#F5A623',
    owed: '#F5A623',
    overdue: '#FF4D4D',
    removed: '#FF4D4D',
    closed: '#6B6860',
    cancelled: '#6B6860',
    expired: '#6B6860',
};

interface StatusPillProps {
    status: 'open' | 'full' | 'closed' | 'pending' | 'owed' | 'paid' | 'active' | 'removed' | 'overdue' | 'cancelled' | 'expired';
}

export function StatusPill({ status }: StatusPillProps) {
    const color = STATUS_COLORS[status] ?? '#6B6860';

    return (
        <Badge
            variant="outline"
            className="rounded-full bg-transparent font-mono text-[10px] capitalize px-2 py-0.5"
            style={{ color, borderColor: color }}
        >
            {status}
        </Badge>
    );
}

// ─── 3. PlatformIcon ──────────────────────────────────────────────────────────

const ICON_SIZES = {
    sm: { box: 'w-9 h-9 rounded-lg', fontSize: '18px' },
    md: { box: 'w-11 h-11 rounded-[10px]', fontSize: '22px' },
    lg: { box: 'w-14 h-14 rounded-xl', fontSize: '28px' },
} as const;

interface PlatformIconProps {
    platformId: string;
    size?: 'sm' | 'md' | 'lg';
    glowColor?: string;
    className?: string;
}

export function PlatformIcon({ platformId, size = 'md', glowColor, className }: PlatformIconProps) {
    const platform = getPlatform(platformId);
    const { box, fontSize } = ICON_SIZES[size];

    return (
        <div
            className={cn('flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-110', box, className)}
            style={{ backgroundColor: platform?.bg ?? '#1A1A1A' }}
        >
            <span style={{ fontSize, lineHeight: 1 }} role="img" aria-label={platform?.name ?? 'Platform icon'}>{platform?.icon ?? '📦'}</span>
        </div>
    );
}

// ─── 3b. NumberTicker ─────────────────────────────────────────────────────────

export function NumberTicker({ value, prefix = '', suffix = '' }: { value: number | string; prefix?: string; suffix?: string }) {
    const val = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value;
    
    return (
        <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
            {prefix}
            <motion.span>
                {value}
            </motion.span>
            {suffix}
        </motion.span>
    );
}

// ─── 4. StatCard ──────────────────────────────────────────────────────────────

const SUB_COLORS: Record<string, string> = {
    success: '#4DFF91',
    danger: '#FF4D4D',
};

interface StatCardProps {
    label: string;
    value: string | number;
    sub?: string;
    subVariant?: 'success' | 'danger' | 'default';
    accentTop?: boolean;
    live?: boolean;
    className?: string;
    sparklineData?: { month: string; amount: number }[];
    sparklineColor?: string;
}

export function StatCard({
    label,
    value,
    sub,
    subVariant = 'default',
    accentTop = false,
    live = false,
    className,
    sparklineData,
    sparklineColor,
}: StatCardProps) {
    return (
        <Card
            className={cn(
                'relative overflow-hidden',
                accentTop &&
                "before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-primary before:content-['']",
                className,
            )}
        >
            <CardContent className="p-5">
                {/* Label row */}
                <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {label}
                    </span>
                    {live && (
                        <span className="flex items-center gap-1.5">
                            <span className="relative flex size-2">
                                <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-75" />
                                <span className="relative inline-flex size-2 rounded-full bg-red-500" />
                            </span>
                            <span className="font-mono text-[10px] font-medium text-primary">
                                LIVE
                            </span>
                        </span>
                    )}
                </div>

                {/* Value */}
                <div className="font-display font-black text-3xl tracking-tighter mt-1.5 text-foreground">
                    <NumberTicker value={value} />
                </div>

                {/* Sub text */}
                {sub && (
                    <p
                        className="font-mono text-[11px] mt-1"
                        style={{ color: SUB_COLORS[subVariant] ?? 'hsl(var(--muted-foreground))' }}
                    >
                        {sub}
                    </p>
                )}

                {/* Sparkline */}
                {sparklineData && sparklineData.length > 1 && (
                    <div className="mt-4 h-10 relative">
                        <svg viewBox={`0 0 ${sparklineData.length * 20} 32`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id={`sparkline-gradient-${label.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor={sparklineColor ?? '#C8F135'} stopOpacity="0.2" />
                                    <stop offset="100%" stopColor={sparklineColor ?? '#C8F135'} stopOpacity="1" />
                                </linearGradient>
                            </defs>
                            {(() => {
                                const max = Math.max(...sparklineData.map(d => d.amount));
                                const points = sparklineData.map((d, i) =>
                                    `${i * 20},${32 - (d.amount / max) * 28}`
                                ).join(' ');
                                return (
                                    <>
                                        <motion.polyline 
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 1 }}
                                            transition={{ duration: 1.5, ease: "easeInOut" }}
                                            fill="none" 
                                            stroke={`url(#sparkline-gradient-${label.replace(/\s+/g, '-')})`} 
                                            strokeWidth="2.5" 
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            points={points} 
                                        />
                                        {/* End point glow */}
                                        {(() => {
                                            const lastPoint = sparklineData[sparklineData.length - 1];
                                            const lastX = (sparklineData.length - 1) * 20;
                                            const lastY = 32 - (lastPoint.amount / max) * 28;
                                            return (
                                                <motion.circle 
                                                    initial={{ opacity: 0, scale: 0 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 1.2 }}
                                                    cx={lastX} 
                                                    cy={lastY} 
                                                    r="3" 
                                                    fill={sparklineColor ?? '#C8F135'} 
                                                    className="drop-shadow-[0_0_8px_rgba(200,241,53,0.8)]"
                                                />
                                            );
                                        })()}
                                    </>
                                );
                            })()}
                        </svg>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ─── 5. PoolCard ──────────────────────────────────────────────────────────────

interface PoolCardProps {
    pool: Pool;
    variant?: 'compact' | 'full';
    className?: string;
    onClick?: (pool: Pool) => void;
    animate?: boolean;
}

export function PoolCard({ pool, variant = 'full', className, onClick, animate = false }: PoolCardProps) {
    const platform = getPlatform(pool.platform);
    const { formatPrice } = useCurrency();
    const analysis = analyzePricing({
        platformId: pool.platform,
        planName: pool.plan_name,
        userSlotPrice: pool.price_per_slot / 100,
        totalSlots: pool.total_slots,
        currency: detectUserCurrency(),
        countryCode: 'GLOBAL'
    });

    const [tilt, setTilt] = React.useState({ x: 0, y: 0 });
    const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!animate) return;
        const rect = e.currentTarget.getBoundingClientRect();
        
        // Tilt calc
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        setTilt({ x: dy * -6, y: dx * 6 });

        // Flare calc
        const px = ((e.clientX - rect.left) / rect.width) * 100;
        const py = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePos({ x: px, y: py });
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!animate) return;
        setTilt({ x: 0, y: 0 });
        e.currentTarget.style.willChange = 'auto';
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!animate) return;
        e.currentTarget.style.willChange = 'transform';
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' && onClick) {
            e.preventDefault();
            onClick(pool);
        }
    };

    const ownerName = pool.owner?.display_name ?? pool.owner?.username ?? 'Host';
    const ownerInitial = ownerName.charAt(0).toUpperCase();
    const ownerColor = pool.owner?.avatar_color ?? '#6B6860';
    const ownerRating = pool.owner?.rating ?? 0;
    const ownerTotalHosted = pool.owner?.total_hosted ?? 0;

    // Determine badge type based on rating and total hosted
    const isPro = ownerRating >= 4.5 && ownerTotalHosted >= 5;
    const isTrusted = ownerRating >= 4.0 && ownerTotalHosted >= 2;
    const isNew = ownerTotalHosted === 0;

    let badgeType: 'new' | 'trusted' | 'pro' | null = null;
    if (isPro) badgeType = 'pro';
    else if (isTrusted) badgeType = 'trusted';
    else if (isNew) badgeType = 'new';

    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <motion.div
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        onMouseEnter={handleMouseEnter}
                        onKeyDown={handleKeyDown}
                        tabIndex={onClick ? 0 : -1}
                        role="button"
                        whileHover={animate ? {} : { y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        aria-label={`${platform?.name || 'Platform'} ${pool.plan_name} pool, ${pool.filled_slots} of ${pool.total_slots} slots filled, ${formatPrice(pool.price_per_slot / 100)} per month`}
                        className={cn(
                            'transition-all duration-300 ease-out',
                            'hover:border-primary/40',
                            'hover:shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.05)]',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                            className
                        )}
                        style={animate ? {
                            transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                            transition: 'transform 200ms cubic-bezier(0.03, 0.98, 0.52, 0.99)'
                        } : {}}
                        onClick={() => onClick?.(pool)}
                    >
                        <Card
                            className={cn(
                                'relative overflow-hidden group/card bg-transparent',
                                'before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent before:opacity-0 group-hover/card:before:opacity-100 before:transition-opacity before:duration-500'
                            )}
                        >
                            {/* Dynamic Flare */}
                            {animate && (
                                <div 
                                    className="absolute inset-0 pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 z-10"
                                    style={{
                                        background: `radial-gradient(400px circle at ${mousePos.x}% ${mousePos.y}%, rgba(200, 241, 53, 0.08), transparent 80%)`
                                    }}
                                />
                            )}
                            <CardContent className="p-5">
                                {/* Status pill — absolute top right */}
                                <div className="absolute top-3 right-3">
                                    <StatusPill status={pool.status} />
                                </div>

                                {/* Platform row */}
                                <div className="flex items-center gap-3 mb-4">
                                    <PlatformIcon platformId={pool.platform} size="md" />
                                    <div className="min-w-0">
                                        <p className="font-display font-bold text-[17px] text-foreground truncate">
                                            {platform?.name ?? pool.platform}
                                        </p>
                                        <p className="font-mono text-[11px] text-muted-foreground truncate">
                                            {pool.plan_name}
                                        </p>
                                    </div>
                                </div>

                                {/* Slot bar */}
                                <div className="mb-4">
                                    <SlotBar filled={pool.filled_slots} total={pool.total_slots} size="sm" animate={animate} />
                                </div>

                                {/* Bottom: Price + Owner */}
                                <div className="flex items-end justify-between flex-wrap gap-y-3">
                                    <div className="shrink-0">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <span className="font-display font-bold text-[22px] text-foreground">
                                                    {formatPrice(pool.price_per_slot / 100)}
                                                </span>
                                                <span className="font-mono text-[11px] text-muted-foreground ml-1">
                                                    /mo
                                                </span>
                                            </div>

                                            <div className="flex items-center bg-secondary/50 px-2 py-0.5 rounded-full border border-border/50">
                                                <span
                                                    className="size-1.5 rounded-full inline-block mr-1.5"
                                                    style={{ backgroundColor: analysis.color }}
                                                />
                                                <span className="font-mono text-[10px] uppercase text-muted-foreground font-bold tracking-tight">
                                                    {analysis.label}
                                                </span>
                                            </div>
                                        </div>

                                        {analysis.savingsPct > 0 && (
                                            <p className="font-mono text-[10px] text-[#4DFF91] mt-1 font-bold">
                                                Members save {analysis.savingsPct.toFixed(0)}%
                                            </p>
                                        )}
                                    </div>

                                    {/* Owner chip */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        {/* Trust Score */}
                                        {(ownerRating > 0 || ownerTotalHosted > 0) && (
                                            <div className="flex items-center gap-1">
                                                <TrustScore rating={ownerRating} size="sm" />
                                                {badgeType && <TrustBadge type={badgeType} />}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5 bg-secondary/30 px-2 py-1 rounded-full border border-border/50">
                                            <div
                                                className="size-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                                                style={{
                                                    backgroundColor: ownerColor,
                                                    color: '#0E0E0E',
                                                }}
                                            >
                                                {ownerInitial}
                                            </div>
                                            <span className="font-display text-[11px] text-muted-foreground truncate max-w-[80px]">
                                                {ownerName}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={8} className="bg-card text-foreground border border-[#2A2A2A] shadow-xl p-3 mb-2 font-mono text-[11px] font-bold z-[100] flex gap-2">
                    <span className="text-[#4DFF91]">Members save {analysis.savingsPct.toFixed(0)}%</span>
                    <span className="text-muted-foreground" aria-hidden="true">·</span>
                    <span className="text-primary">Host offsets {analysis.hostOffset.toFixed(0)}% of bill</span>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

// ─── 6. NotificationItem ──────────────────────────────────────────────────────

interface NotificationItemProps {
    notification: Notification;
    onRead?: (id: string) => void;
    onApprove?: (id: string) => void;
    onDecline?: (id: string) => void;
    onDismiss?: (id: string) => void;
}

export function NotificationItem({
    notification,
    onRead,
    onApprove,
    onDecline,
    onDismiss,
}: NotificationItemProps) {
    const isJoinRequest = notification.title.toLowerCase().includes('join request');

    const handleClick = () => {
        if (!notification.read && onRead) {
            onRead(notification.id);
        }
    };

    return (
        <Card
            className={cn(
                'cursor-pointer transition-all duration-150 hover:border-primary/20',
                !notification.read
                    ? 'border-l-[3px] border-l-primary'
                    : 'border-border',
            )}
            onClick={handleClick}
        >
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    {/* Emoji icon */}
                    <span className="text-xl shrink-0 mt-0.5" role="img" aria-label="Notification type">{notification.icon}</span>

                    {/* Title + Body */}
                    <div className="flex-1 min-w-0">
                        <p className={cn(
                            'font-display text-[14px] text-foreground',
                            !notification.read && 'font-semibold',
                        )}>
                            {notification.title}
                        </p>
                        <p className="font-mono text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                            {notification.body}
                        </p>

                        {/* Join request actions */}
                        {isJoinRequest && (
                            <div className="flex gap-2 mt-2.5">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onApprove?.(notification.id); }}
                                    className="h-7 px-3 rounded-md text-[11px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                                    aria-label="Approve join request"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDecline?.(notification.id); }}
                                    className="h-7 px-3 rounded-md text-[11px] font-medium border border-border text-muted-foreground hover:bg-muted/50 transition-colors"
                                    aria-label="Decline join request"
                                >
                                    Decline
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDismiss?.(notification.id); }}
                                    className="h-7 px-3 rounded-md text-[11px] font-medium border border-border text-muted-foreground hover:bg-muted/50 transition-colors"
                                    aria-label="Dismiss notification"
                                >
                                    Dismiss
                                </button>
                            </div>
                        )}

                        {!isJoinRequest && !notification.read && (
                            <div className="mt-2.5">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDismiss?.(notification.id); }}
                                    className="h-7 px-3 rounded-md text-[11px] font-medium border border-border text-muted-foreground hover:bg-muted/50 transition-colors"
                                    aria-label="Dismiss notification"
                                >
                                    Dismiss
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Time */}
                    <span className="font-mono text-[10px] text-muted-foreground shrink-0 mt-1">
                        {timeAgo(notification.created_at)}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
