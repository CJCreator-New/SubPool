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
import { CommandPalette } from '../components/command-palette';

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
        <SidebarProvider className="noise-overlay">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:font-bold focus:shadow-xl"
            >
                Skip to content
            </a>
            {/* ─── Sidebar ───────────────────────────────────────────────── */}
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
                        <div className="relative group">
                            <Avatar className="size-9 border border-white/10 shadow-sm group-hover:border-primary/50 transition-colors">
                                <AvatarFallback className="bg-primary text-primary-foreground font-black text-xs">
                                    {(profile?.username?.[0] ?? 'Y').toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-0.5 -right-0.5 size-3 bg-[#4DFF91] border-2 border-[#121212] rounded-full" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-display text-[13px] font-black text-foreground truncate tracking-tight">
                                {profile?.username ?? 'You'}
                            </p>
                            <p className="font-mono text-[9px] text-muted-foreground/60 truncate uppercase tracking-tighter">
                                {profile ? '@' + profile.username : '@yourusername'}
                            </p>
                        </div>
                        <div className="flex flex-col items-end shrink-0 ml-1">
                            <span className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground/60 mr-0.5">Saved</span>
                            <span className="font-mono text-[10px] font-black text-[#4DFF91] bg-[#4DFF91]/10 px-1.5 py-0.5 rounded border border-[#4DFF91]/20">
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
                <header className={cn(
                    "sticky top-0 z-30 flex items-center h-[64px] border-b transition-all duration-300 px-4 md:px-8 gap-3",
                    isScrolled 
                        ? "bg-background/80 backdrop-blur-xl border-white/5 shadow-premium" 
                        : "bg-background border-border"
                )}>
                    {/* Sidebar toggle */}
                    <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />

                    <div className="flex-1 flex items-center gap-2">
                        <h1 className="font-display font-black text-[16px] text-foreground tracking-tight">
                            {pageTitle}
                        </h1>
                        {!user && (
                            <span className="font-mono text-[9px] text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 uppercase tracking-widest font-bold">
                                GUEST
                            </span>
                        )}
                        {!isSupabaseConnected && (
                            <span className="font-mono text-[9px] text-warning bg-warning/10 px-2 py-0.5 rounded-full border border-warning/20 animate-pulse font-bold tracking-widest uppercase">
                                OFFLINE
                            </span>
                        )}
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center gap-4">
                        <CommandPalette />
                        <NotificationBell />

                        {/* List a Pool — shown on browse */}
                        {(activePath === '/' || activePath === '/browse') && (
                            <Button
                                size="sm"
                                className="font-display font-bold text-[11px] uppercase tracking-wider h-8 px-4 rounded-full shadow-glow-primary"
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
                    {guestFallbackMessage ? (
                        <GuestEmptyState message={guestFallbackMessage} />
                    ) : (
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                            transition={{ 
                                duration: 0.6, 
                                ease: [0.16, 1, 0.3, 1],
                                opacity: { duration: 0.4 }
                            }}
                        >
                            <Outlet />
                        </motion.div>
                    )}
                </main>

                {/* ─── Mobile Bottom Tab Bar ─────────────────────────────── */}
                <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden h-[calc(64px+env(safe-area-inset-bottom))] bg-card/60 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                    {BOTTOM_TABS.map((tab) => {
                        const isActive =
                            activePath === tab.path ||
                            (tab.path === '/' && activePath === '/browse');

                        return (
                            <Link
                                key={tab.path}
                                to={tab.path}
                                className={cn(
                                    'flex flex-col items-center gap-1 p-2 flex-1 rounded-2xl transition-all duration-300',
                                    isActive 
                                        ? 'text-primary scale-110' 
                                        : 'text-muted-foreground/60 hover:text-foreground hover:bg-white/5',
                                )}
                            >
                                <span className={cn(
                                    "text-xl transition-transform",
                                    isActive && "drop-shadow-[0_0_8px_rgba(200,241,53,0.5)]"
                                )}>{tab.icon}</span>
                                <span className="font-mono text-[9px] uppercase tracking-widest font-black">
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
