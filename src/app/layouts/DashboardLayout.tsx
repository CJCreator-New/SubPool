// ─── SubPool Dashboard Layout ─────────────────────────────────────────────────
// Uses the existing shadcn/ui Sidebar component system — no custom sidebar logic.
// Handles: sidebar navigation, sticky topbar, mobile bottom tabs, page routing.

import React from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
    SidebarProvider,
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarInset,
    SidebarTrigger,
} from '../components/ui/sidebar';
import { useActionSummary } from '../../lib/hooks/useActionSummary';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { cn } from '../components/ui/utils';
import { useNotifications } from '../../lib/supabase/hooks';
import { useAuth } from '../../lib/supabase/auth';
import { isSupabaseConnected } from '../../lib/supabase/client';
import { NAV_ITEMS, NAV_SECTIONS, PAGE_TITLES, BOTTOM_TABS } from '../../lib/constants';
import type { Notification } from '../../lib/types';
import { useDemo } from '../components/demo-mode';
import { Navigate } from 'react-router';
import { CharacterCard } from '../components/character-card';
import { NotificationBell } from '../components/notification-bell';
import { getPricingData } from '../../lib/pricing-service';
import { toast } from 'sonner';
import { GuestEmptyState } from '../components/guest-empty-state';
import { CommandPalette } from '../components/command-palette';
import { PWAInstallPrompt } from '../components/pwa-install-prompt';

// ─── Protected Route Component ──────────────────────────────────────────────

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0E0E0E]">
                <span className="animate-pulse font-display font-black text-2xl">
                    <span className="text-foreground">Sub</span>
                    <span className="text-primary">Pool</span>
                </span>
            </div>
        );
    }

    if (!user) {
        return <DashboardLayout guestFallbackMessage="Sign in to access this feature" />;
    }

    return <>{children}</>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardLayout({ guestFallbackMessage }: { guestFallbackMessage?: string }) {
    const location = useLocation();
    const navigate = useNavigate();
    const activePath = location.pathname;
    const pageTitle = PAGE_TITLES[activePath] ?? 'SubPool';
    const { user, profile, signOut } = useAuth();
    const { monthlySavingsCents } = useActionSummary();
    const { isDemo } = useDemo();
    const [isScrolled, setIsScrolled] = React.useState(false);

    let demoCharacter: 'sarah' | 'marcus' | null = null;
    let characterVisible = false;

    if (isDemo) {
        if (activePath === '/browse' || activePath === '/' || activePath === '/create' || activePath.startsWith('/ledger')) {
            demoCharacter = 'sarah';
            characterVisible = true;
        } else if (activePath === '/my-pools') {
            demoCharacter = 'marcus';
            characterVisible = true;
        }
    }

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 40);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    React.useEffect(() => {
        void getPricingData().catch(() => {
            // Non-blocking prefetch
        });
    }, []);

    const { data: notifications } = useNotifications();
    const notificationsList = Array.isArray(notifications) ? notifications : [];
    const unreadCount = (notificationsList as unknown as Notification[]).filter((n: Notification) => !n.read).length;

    // Group NAV_ITEMS by section
    const grouped = NAV_SECTIONS.map((section) => ({
        section,
        items: NAV_ITEMS.filter((item) => { if (item.section !== section) return false; return !!user || !item.requiresAuth; }),
    }));

    const hapticTap = () => {
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    };

    return (
        <SidebarProvider className="noise-overlay overflow-hidden">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:font-bold focus:shadow-xl"
            >
                Skip to content
            </a>
            {/* ─── Sidebar (Desktop) ───────────────────────────────────────────────── */}
            <Sidebar
                className={cn(
                    "hidden md:flex border-r bg-card/50 backdrop-blur-xl transition-all duration-500",
                    isScrolled ? "border-transparent shadow-premium" : "border-border"
                )}
                style={{ '--sidebar-width': '220px' } as React.CSSProperties}
            >
                {/* Logo */}
                <SidebarHeader className="border-b border-border px-5 py-6">
                    <Link to="/" className="inline-flex items-center gap-0">
                        <span className="font-display font-black text-xl text-foreground">
                            Sub
                        </span>
                        <span className="font-display font-black text-xl text-primary">
                            Pool
                        </span>
                    </Link>
                </SidebarHeader>

                {/* Nav Groups */}
                <SidebarContent className="py-3 overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable]">
                    {grouped.map(({ section, items }) => (
                        <SidebarGroup key={section}>
                            <SidebarGroupLabel className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground px-5">
                                {section}
                            </SidebarGroupLabel>
                            <SidebarMenu>
                                {items.map((item) => {
                                    const isActive =
                                        activePath === item.path ||
                                        (item.path === '/' && activePath === '/browse');

                                    const itemBadge = item.label === 'Notifications' ? (unreadCount > 0 ? unreadCount : null) : item.badge;

                                    return (
                                        <SidebarMenuItem key={item.path}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isActive}
                                                tooltip={item.label}
                                                className={cn(
                                                    'font-display font-semibold text-[13px] px-5 h-11 transition-all duration-300 relative group/nav',
                                                    'rounded-xl border-l-[3px] border-transparent mx-2',
                                                    'text-muted-foreground/60 hover:text-foreground hover:bg-white/5',
                                                    isActive && 'border-l-primary text-primary bg-primary/10 shadow-[inner_20px_0_40px_-20px_rgba(200,241,53,0.15)] bg-white/[0.02]',
                                                )}
                                            >
                                                <Link to={item.path} className="flex items-center w-full">
                                                    <span className={cn(
                                                        "text-lg mr-2 transition-all duration-300",
                                                        isActive && "drop-shadow-[0_0_8px_rgba(200,241,53,0.6)] scale-110"
                                                    )}>{item.icon}</span>
                                                    <span className={cn(
                                                        "transition-all duration-500",
                                                        isActive ? "font-black tracking-tight translate-x-1" : "font-semibold group-hover/nav:translate-x-1"
                                                    )}>{item.label}</span>
                                                    {itemBadge && (
                                                        <span className="ml-auto font-mono text-[10px] bg-primary text-primary-foreground px-1.5 rounded-full leading-5 inline-flex items-center justify-center min-w-[20px] h-5 shadow-[0_2px_8px_rgba(200,241,53,0.3)]">
                                                            {itemBadge}
                                                        </span>
                                                    )}
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroup>
                    ))}
                </SidebarContent>

                {/* Footer — user info */}
                <SidebarFooter className="border-t border-white/5 p-4 gap-4 bg-muted/20">
                    <div className="flex items-center gap-3">
                        <Avatar className="size-9 border border-white/10 shadow-sm">
                            <AvatarFallback className="bg-primary text-primary-foreground font-black text-xs">
                                {(profile?.username?.[0] ?? 'Y').toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <p className="font-display text-[13px] font-black text-foreground truncate tracking-tight">
                                {profile?.username ?? 'You'}
                            </p>
                            <p className="font-mono text-[9px] text-muted-foreground/60 truncate uppercase tracking-tighter">
                                {profile ? '@' + profile.username : '@yourusername'}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs font-mono uppercase tracking-widest text-muted-foreground h-8 hover:text-foreground hover:bg-secondary/50"
                        onClick={async () => {
                            if (!user) { navigate('/login'); return; }
                            try { await signOut(); } catch { toast.error('Could not sign out.'); }
                        }}
                    >
                        {user ? 'Sign out' : 'Sign in'}
                    </Button>
                </SidebarFooter>
            </Sidebar>

            {/* ─── Main Content Area ──────────────────── */}
            <SidebarInset className="flex flex-col flex-1 min-w-0 w-full relative">
                <header className={cn(
                    "sticky top-0 z-30 flex items-center h-[64px] border-b transition-all duration-300 px-4 md:px-8 gap-3",
                    isScrolled ? "bg-background/80 backdrop-blur-xl border-white/5 shadow-premium" : "bg-background border-border"
                )}>
                    <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
                    <div className="flex-1 flex items-center gap-3">
                        <h1 className="font-display font-black text-[14px] text-foreground tracking-tight uppercase">
                            {pageTitle}
                        </h1>
                        {!user && <span className="font-mono text-[9px] text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 uppercase tracking-widest font-bold">GUEST</span>}
                    </div>
                    <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-2xl p-1 backdrop-blur-md">
                        <CommandPalette />
                        <NotificationBell />
                    </div>
                </header>

                <main id="main-content" className="flex-1 p-4 md:p-8 pb-24 md:pb-8 outline-none" tabIndex={-1}>
                    {guestFallbackMessage ? (
                        <GuestEmptyState message={guestFallbackMessage} />
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, y: -10, filter: 'blur(8px)' }}
                                transition={{ 
                                    duration: 0.4, 
                                    ease: [0.22, 1, 0.36, 1]
                                }}
                                className="w-full h-full"
                            >
                                <Outlet />
                            </motion.div>
                        </AnimatePresence>
                    )}
                </main>

                {/* ─── Mobile Bottom Tab Bar (Optimized) ─────────────────────────────── */}
                <nav className="fixed bottom-0 left-0 right-0 z-[60] md:hidden px-4 pb-[calc(env(safe-area-inset-bottom)+8px)]">
                    <div className="max-w-lg mx-auto bg-[#1A1A1A]/80 backdrop-blur-2xl border border-white/10 h-16 rounded-[24px] flex items-center justify-around px-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        {BOTTOM_TABS.map((tab) => {
                            const isActive = activePath === tab.path || (tab.path === '/' && activePath === '/browse');
                            return (
                                <Link
                                    key={tab.path}
                                    to={tab.path}
                                    onClick={hapticTap}
                                    className={cn(
                                        'relative flex flex-col items-center justify-center flex-1 h-full rounded-2xl transition-all duration-500 touch-none active:scale-90',
                                        isActive ? 'text-primary' : 'text-muted-foreground/40'
                                    )}
                                >
                                    <span className={cn(
                                        "text-xl transition-all duration-500 relative z-10",
                                        isActive && "scale-110 drop-shadow-[0_0_10px_rgba(200,241,53,0.5)]"
                                    )}>
                                        {tab.icon}
                                    </span>
                                    <span className="font-mono text-[8px] uppercase tracking-widest font-black mt-1 opacity-80 z-10">
                                        {tab.label === 'Browse' ? 'Browse' : tab.label.replace('My Pools', 'Pools')}
                                    </span>
                                    {isActive && (
                                        <motion.div 
                                            layoutId="activeTab"
                                            className="absolute inset-x-2 inset-y-1 bg-primary/10 rounded-xl border border-primary/20 -z-0"
                                            transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            </SidebarInset>

            {/* ─── TECHNICAL HUD (Fixed Bottom Right) ────────────────────────── */}
            <div className="fixed bottom-6 right-6 z-[60] hidden lg:block">
                <div className="bg-card/40 backdrop-blur-xl border-l-2 border-l-primary px-4 py-2.5 rounded-l-md flex flex-col gap-1 min-w-[180px] shadow-2xl border border-white/5">
                    <div className="flex items-center justify-between gap-8">
                        <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">Savings / MO</span>
                        <span className="font-display font-black text-primary text-sm">${(monthlySavingsCents / 100).toFixed(0)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-8">
                        <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">Node Status</span>
                        <div className="flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                            <span className="font-mono text-[8px] text-primary uppercase font-bold tracking-tighter">Optimized</span>
                        </div>
                    </div>
                </div>
            </div>

            {demoCharacter && <CharacterCard character={demoCharacter!} visible={characterVisible} />}
            <PWAInstallPrompt />
        </SidebarProvider>
    );
}
