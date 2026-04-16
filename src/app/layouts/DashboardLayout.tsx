// ─── SubPool Dashboard Layout ─────────────────────────────────────────────────
// Uses the existing shadcn/ui Sidebar component system — no custom sidebar logic.
// Handles: sidebar navigation, sticky topbar, mobile bottom tabs, page routing.

import React from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router';
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
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { cn } from '../components/ui/utils';
import { useNotifications } from '../../lib/supabase/hooks';
import { useAuth } from '../../lib/supabase/auth';
import { isSupabaseConnected } from '../../lib/supabase/client';
import { NAV_ITEMS, NAV_SECTIONS, PAGE_TITLES, BOTTOM_TABS } from '../../lib/constants';
import { useDemo } from '../components/demo-mode';
import { Navigate } from 'react-router';
import { CharacterCard } from '../components/character-card';
import { NotificationBell } from '../components/notification-bell';
import { getPricingData } from '../../lib/pricing-service';
import { toast } from 'sonner';
import { GuestEmptyState } from '../components/guest-empty-state';

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

    // P2-23: Prefetch pricing data
    React.useEffect(() => {
        void getPricingData().catch(() => {
            // Non-blocking prefetch; ignore failures to keep layout resilient.
        });
    }, []);

    const { data: notifications } = useNotifications();
    const notificationsList = Array.isArray(notifications) ? notifications : [];
    const unreadCount = notificationsList.filter((n: Notification) => !n.read).length;

    // Group NAV_ITEMS by section
    const grouped = NAV_SECTIONS.map((section) => ({
        section,
        items: NAV_ITEMS.filter((item) => { if (item.section !== section) return false; return !!user || !item.requiresAuth; }),
    }));

    return (
        <SidebarProvider>
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:font-bold focus:shadow-xl"
            >
                Skip to content
            </a>
            {/* ─── Sidebar ───────────────────────────────────────────────── */}
            <Sidebar
                className={cn(
                    "hidden md:flex border-r bg-card transition-shadow duration-300",
                    isScrolled ? "border-transparent shadow-[4px_0_24px_rgba(0,0,0,0.4)]" : "border-[#2A2A2A]"
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
                                                    'font-display font-semibold text-sm px-5 h-10',
                                                    'rounded-none border-l-[3px] border-transparent',
                                                    'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
                                                    isActive && 'border-l-primary text-primary bg-primary/5',
                                                )}
                                            >
                                                <Link to={item.path}>
                                                    <span className="text-base mr-1">{item.icon}</span>
                                                    <span>{item.label}</span>
                                                    {itemBadge && (
                                                        <span className="ml-auto font-mono text-[10px] bg-primary text-primary-foreground px-1.5 rounded-full leading-5 inline-flex items-center justify-center min-w-[20px] h-5">
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
                <SidebarFooter className="border-t border-border p-4 gap-4">
                    <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                            <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">
                                {(profile?.username?.[0] ?? 'Y').toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <p className="font-display text-sm font-semibold text-foreground truncate">
                                {profile?.username ?? 'You'}
                            </p>
                            <p className="font-mono text-[10px] text-muted-foreground truncate">
                                {profile ? '@' + profile.username : '@yourusername'}
                            </p>
                        </div>
                        <div className="flex flex-col items-end shrink-0 ml-1">
                            <span className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground mr-0.5">Saved</span>
                            <span className="font-mono text-[10px] font-bold text-[#4DFF91] bg-[#4DFF91]/10 px-1 py-0.5 rounded border border-[#4DFF91]/20">
                                $341
                            </span>
                        </div>
                    </div>
                    {/* Sign out button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs font-mono uppercase tracking-widest text-muted-foreground h-8 hover:text-foreground hover:bg-secondary/50"
                        onClick={async () => {
                            if (!user) {
                                navigate('/login');
                                return;
                            }
                            try {
                                await signOut();
                            } catch {
                                toast.error('Could not sign out. Please try again.');
                            }
                        }}
                    >
                        {user ? 'Sign out' : 'Sign in'}
                    </Button>
                </SidebarFooter>
            </Sidebar>

            {/* ─── Main Content Area (SidebarInset) ──────────────────── */}
            <SidebarInset className="flex flex-col flex-1 md:ml-0 min-w-0 w-full">
                {/* Sticky Topbar */}
                <header className="sticky top-0 z-30 flex items-center h-[60px] bg-background/90 backdrop-blur-md border-b border-border px-4 md:px-8 gap-3">
                    {/* Sidebar toggle */}
                    <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

                    <div className="flex-1 flex items-center gap-2">
                        <h1 className="font-display font-bold text-[15px] text-foreground">
                            {pageTitle}
                        </h1>
                        {!user && (
                            <span className="font-mono text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 uppercase tracking-wider">
                                GUEST MODE
                            </span>
                        )}
                        {!isSupabaseConnected && (
                            <span className="font-mono text-[10px] text-warning bg-warning/10 px-1.5 py-0.5 rounded border border-warning/20 animate-pulse">
                                Using offline data
                            </span>
                        )}
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center gap-3">
                        <NotificationBell />

                        {/* List a Pool — shown on browse */}
                        {(activePath === '/' || activePath === '/browse') && (
                            <Button
                                size="sm"
                                className="font-display font-semibold text-xs"
                                onClick={() => {
                                    if (!user) {
                                        navigate('/login?next=/list');
                                        return;
                                    }
                                    navigate('/list');
                                }}
                            >
                                List a Pool
                            </Button>
                        )}
                    </div>
                </header>

                {/* Page Content */}
                <main id="main-content" className="flex-1 p-4 md:p-8 pb-16 md:pb-0 outline-none" tabIndex={-1}>
                    {guestFallbackMessage ? <GuestEmptyState message={guestFallbackMessage} /> : <Outlet />}
                </main>

                {/* ─── Mobile Bottom Tab Bar ─────────────────────────────── */}
                <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden h-[calc(60px+env(safe-area-inset-bottom))] bg-card/90 backdrop-blur-md border-t border-border flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
                    {BOTTOM_TABS.map((tab) => {
                        const isActive =
                            activePath === tab.path ||
                            (tab.path === '/' && activePath === '/browse');

                        return (
                            <Link
                                key={tab.path}
                                to={tab.path}
                                className={cn(
                                    'flex flex-col items-center gap-0.5 p-2 flex-1 rounded-lg transition-colors',
                                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40',
                                )}
                            >
                                <span className="text-xl">{tab.icon}</span>
                                <span className="font-mono text-[9px] uppercase tracking-widest font-bold">
                                    {tab.label === 'Browse' ? 'Browse' : tab.label.replace('My Pools', 'Pools')}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
                <div className="h-16 md:hidden" /> {/* Spacer for bottom tab bar */}
            </SidebarInset>

            {/* ─── Demo Character Cards ────────────────────────────────────── */}
            {demoCharacter && (
                <CharacterCard
                    character={demoCharacter!}
                    visible={characterVisible}
                />
            )}
        </SidebarProvider>
    );
}
