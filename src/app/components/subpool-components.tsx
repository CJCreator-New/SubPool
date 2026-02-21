// ─── SubPool Component Library ─────────────────────────────────────────────────
// Built on top of shadcn/ui primitives — never recreates what already exists.

import React from 'react';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { cn } from './ui/utils';
import { getPlatform, formatPrice, timeAgo } from '../../lib/constants';
import type { Pool, Notification } from '../../lib/types';

// ─── 1. SlotBar ───────────────────────────────────────────────────────────────

interface SlotBarProps {
    filled: number;
    total: number;
    size?: 'sm' | 'md';
}

export function SlotBar({ filled, total, size = 'md' }: SlotBarProps) {
    const h = size === 'sm' ? 'h-1' : 'h-1.5';

    return (
        <div>
            <div className="flex gap-1">
                {Array.from({ length: total }, (_, i) => (
                    <div
                        key={i}
                        className={cn(
                            'flex-1 rounded-full transition-colors',
                            h,
                            i < filled ? 'bg-primary' : 'bg-muted',
                        )}
                    />
                ))}
            </div>
            <p className="font-mono text-[11px] text-muted-foreground mt-1.5">
                {filled}/{total} slots filled
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
}

export function PlatformIcon({ platformId, size = 'md' }: PlatformIconProps) {
    const platform = getPlatform(platformId);
    const { box, fontSize } = ICON_SIZES[size];

    return (
        <div
            className={cn('flex items-center justify-center shrink-0', box)}
            style={{ backgroundColor: platform?.bg ?? '#1A1A1A' }}
        >
            <span style={{ fontSize, lineHeight: 1 }}>{platform?.icon ?? '📦'}</span>
        </div>
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
}

export function StatCard({
    label,
    value,
    sub,
    subVariant = 'default',
    accentTop = false,
    live = false,
    className,
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
                <p className="font-display font-bold text-3xl tracking-tight mt-1.5 text-foreground">
                    {value}
                </p>

                {/* Sub text */}
                {sub && (
                    <p
                        className="font-mono text-[11px] mt-1"
                        style={{ color: SUB_COLORS[subVariant] ?? 'hsl(var(--muted-foreground))' }}
                    >
                        {sub}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

// ─── 5. PoolCard ──────────────────────────────────────────────────────────────

interface PoolCardProps {
    pool: Pool;
    onClick?: (pool: Pool) => void;
}

export function PoolCard({ pool, onClick }: PoolCardProps) {
    const platform = getPlatform(pool.platform_id);

    return (
        <Card
            className={cn(
                'relative cursor-pointer transition-all duration-200',
                'hover:-translate-y-0.5 hover:border-primary/30',
                'hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
            )}
            onClick={() => onClick?.(pool)}
        >
            <CardContent className="p-5">
                {/* Status pill — absolute top right */}
                <div className="absolute top-3 right-3">
                    <StatusPill status={pool.status} />
                </div>

                {/* Platform row */}
                <div className="flex items-center gap-3 mb-4">
                    <PlatformIcon platformId={pool.platform_id} size="md" />
                    <div className="min-w-0">
                        <p className="font-display font-bold text-[17px] text-foreground truncate">
                            {platform?.name ?? pool.platform_id}
                        </p>
                        <p className="font-mono text-[11px] text-muted-foreground truncate">
                            {pool.plan_name}
                        </p>
                    </div>
                </div>

                {/* Slot bar */}
                <div className="mb-4">
                    <SlotBar filled={pool.slots_filled} total={pool.slots_total} size="sm" />
                </div>

                {/* Bottom: Price + Owner */}
                <div className="flex items-end justify-between flex-wrap gap-y-3">
                    <div className="shrink-0">
                        <span className="font-display font-bold text-[22px] text-foreground">
                            {formatPrice(pool.price_per_slot)}
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground ml-1">
                            /mo per slot
                        </span>
                    </div>

                    {/* Owner chip */}
                    <div className="flex items-center gap-1.5 shrink-0 bg-secondary/30 px-2 py-1 rounded-full border border-border/50">
                        <div
                            className="size-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                            style={{
                                backgroundColor: pool.owner.avatar_color,
                                color: '#0E0E0E',
                            }}
                        >
                            {pool.owner.display_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-display text-[11px] text-muted-foreground truncate max-w-[80px]">
                            {pool.owner.display_name}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── 6. NotificationItem ──────────────────────────────────────────────────────

interface NotificationItemProps {
    notification: Notification;
    onRead?: (id: string) => void;
    onApprove?: (id: string) => void;
    onDecline?: (id: string) => void;
}

export function NotificationItem({
    notification,
    onRead,
    onApprove,
    onDecline,
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
                    <span className="text-xl shrink-0 mt-0.5">{notification.icon}</span>

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
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDecline?.(notification.id); }}
                                    className="h-7 px-3 rounded-md text-[11px] font-medium border border-border text-muted-foreground hover:bg-muted/50 transition-colors"
                                >
                                    Decline
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
