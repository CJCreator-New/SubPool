import React from 'react';
import { cn } from './ui/utils';
import { Card, CardContent } from './ui/card';
import { SidebarProvider } from './ui/sidebar';

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
        <SidebarProvider>
            <div className="flex w-full min-h-screen">

                {/* ─── Sidebar Skeleton (Hidden on Mobile) ──────────────────────── */}
                <aside className="hidden md:flex flex-col w-[220px] border-r border-border bg-card p-4 gap-6 shrink-0 h-screen sticky top-0">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-8 h-8 rounded-lg bg-secondary/50 animate-pulse" />
                        <div className="w-24 h-5 rounded bg-secondary/50 animate-pulse" />
                    </div>

                    <div className="space-y-4 mt-4">
                        <div className="w-16 h-3 rounded bg-secondary/30 mb-2 px-2" />
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 px-2 h-10 w-full">
                                <div className="w-5 h-5 rounded bg-secondary/50 animate-pulse shrink-0" />
                                <div className="w-20 h-4 rounded bg-secondary/50 animate-pulse w-full max-w-[120px]" />
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4 mt-4">
                        <div className="w-16 h-3 rounded bg-secondary/30 mb-2 px-2" />
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 px-2 h-10 w-full">
                                <div className="w-5 h-5 rounded bg-secondary/50 animate-pulse shrink-0" />
                                <div className="w-20 h-4 rounded bg-secondary/50 animate-pulse w-full max-w-[120px]" />
                            </div>
                        ))}
                    </div>
                </aside>

                {/* ─── Main Content Area ────────────────────────────────────────── */}
                <main className="flex-1 flex flex-col min-w-0">

                    {/* Topbar Skeleton */}
                    <header className="h-[60px] border-b border-border bg-background flex items-center justify-between px-6 shrink-0 sticky top-0 z-10 w-full">
                        <div className="w-32 h-6 rounded bg-secondary/50 animate-pulse" />
                        <div className="flex items-center gap-4">
                            <div className="hidden md:block w-8 h-8 rounded-full bg-secondary/50 animate-pulse" />
                            <div className="w-8 h-8 rounded-full bg-secondary/50 animate-pulse" />
                        </div>
                    </header>

                    {/* Content Skeleton */}
                    <div className="p-6 md:p-8 space-y-8 w-full max-w-7xl mx-auto flex-1 h-full overflow-y-auto w-full">

                        {/* Stats Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Card key={i} className="border-border bg-card">
                                    <CardContent className="p-5 space-y-3">
                                        <div className="w-16 h-3 rounded bg-secondary/30 animate-pulse" />
                                        <div className="w-20 h-8 rounded bg-secondary/50 animate-pulse" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Search / Filter Row */}
                        <div className="flex flex-col sm:flex-row gap-4 h-11 w-full mt-4">
                            <div className="flex-1 w-full max-w-md h-full rounded-md bg-secondary/30 animate-pulse border border-border" />
                            <div className="w-full sm:w-32 h-full rounded-md bg-secondary/30 animate-pulse border border-border" />
                        </div>

                        {/* Grid Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <Card key={i} className="border-border bg-card h-[220px] p-5 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <div className="w-12 h-12 rounded-lg bg-secondary/50 animate-pulse" />
                                            <div className="w-16 h-5 rounded-full bg-secondary/30 animate-pulse" />
                                        </div>
                                        <div className="w-3/4 h-5 mt-4 rounded bg-secondary/50 animate-pulse" />
                                        <div className="w-1/2 h-3 mt-2 rounded bg-secondary/30 animate-pulse" />
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div className="w-1/3 h-6 rounded bg-secondary/50 animate-pulse" />
                                        <div className="w-10 h-10 rounded-full bg-secondary/30 animate-pulse" />
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}
