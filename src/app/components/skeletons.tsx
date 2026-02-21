import React from 'react';
import { cn } from './ui/utils';

export function Skeleton({ className }: { className?: string }) {
    return (
        <div className={cn("animate-pulse rounded bg-muted/50", className)} />
    );
}

export function PoolCardSkeleton() {
    return (
        <div className="bg-card border border-border rounded-[6px] p-5 animate-pulse space-y-4">
            <div className="flex gap-3">
                <div className="size-11 rounded-[10px] bg-muted" />
                <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 w-24 bg-muted rounded" />
                    <div className="h-3 w-16 bg-muted rounded" />
                </div>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full" />
            <div className="flex justify-between items-center pt-2">
                <div className="h-7 w-20 bg-muted rounded" />
                <div className="h-6 w-24 bg-muted rounded-full" />
            </div>
        </div>
    );
}

export function StatCardSkeleton() {
    return (
        <div className="bg-card border border-border rounded-[6px] p-5 animate-pulse space-y-3">
            <div className="h-3 w-20 bg-muted rounded" />
            <div className="h-8 w-28 bg-muted rounded" />
            <div className="h-3 w-16 bg-muted rounded" />
        </div>
    );
}

export function TableRowSkeleton({ cells = 5 }: { cells?: number }) {
    return (
        <div className="flex items-center space-x-4 px-5 py-4 border-b border-border animate-pulse">
            {Array.from({ length: cells }).map((_, i) => (
                <div key={i} className={cn("h-4 bg-muted rounded", i === 0 ? "w-32" : "flex-1")} />
            ))}
        </div>
    );
}

export function PageLoadSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <PoolCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
