// ─── SubPool — Routes ──────────────────────────────────────────────────────────
// All dashboard children are lazy-loaded with Suspense fallback.
// DashboardLayout wraps all authenticated pages with sidebar + topbar.

import * as React from 'react';
import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router';
import { DashboardLayout, ProtectedRoute } from './layouts/DashboardLayout';
import { AuthProvider, useAuth } from '../lib/supabase/auth';
import { DemoModeProvider } from './components/demo-mode';
import { CurrencyProvider } from '../lib/currency-context';
import { ErrorBoundary } from './components/error-boundary';
import { PageLoadSkeleton } from './components/skeletons';
import { GuestEmptyState } from './components/guest-empty-state';
import { RootErrorPage } from './components/root-error-page';

// ─── Suspense wrapper ─────────────────────────────────────────────────────────

function LoadingFallback() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-[#0E0E0E]">
            <span className="animate-pulse font-display font-black text-2xl">
                <span className="text-foreground">Sub</span>
                <span className="text-primary">Pool</span>
            </span>
        </div>
    );
}

// ─── Lazy page imports ────────────────────────────────────────────────────────

const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const BrowsePage = lazy(() => import('./pages/BrowsePools').then(m => ({ default: m.BrowsePools })));
const MyPoolsPage = lazy(() => import('./pages/MyPools').then(m => ({ default: m.MyPools })));
const CreatePoolPage = lazy(() => import('./pages/ListAPool').then(m => ({ default: m.ListAPool })));
const LedgerPage = lazy(() => import('./pages/Ledger').then(m => ({ default: m.Ledger })));
const NotificationsPage = lazy(() => import('./pages/Notifications').then(m => ({ default: m.Notifications })));
const ProfilePage = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const MarketPage = lazy(() => import('./pages/MarketIntelligence').then(m => ({ default: m.MarketIntelligence })));
const MessagesPage = lazy(() => import('./pages/Messages').then(m => ({ default: m.Messages })));
const WishlistPage = lazy(() => import('./pages/Wishlist').then(m => ({ default: m.Wishlist })));
const SavingsPage = lazy(() => import('./pages/SavingsPage').then(m => ({ default: m.SavingsPage })));
const BillingPage = lazy(() => import('./pages/Billing').then(m => ({ default: m.Billing })));
const PayoutPage = lazy(() => import('./pages/PayoutDashboard').then(m => ({ default: m.PayoutDashboard })));
const NotFoundPage = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));
const OnboardingPage = lazy(() => import('./pages/Onboarding').then(m => ({ default: m.Onboarding })));
const PlansPage = lazy(() => import('./pages/PlansPage').then(m => ({ default: m.PlansPage })));
const SubscriptionDetailsPage = lazy(() => import('./pages/SubscriptionDetails').then(m => ({ default: m.SubscriptionDetails })));
const AdminPage = lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })));
const WaitlistPage = lazy(() => import('./pages/WaitlistPage').then(m => ({ default: m.WaitlistPage })));
const ReferralPage = lazy(() => import('./pages/ReferralPage').then(m => ({ default: m.ReferralPage })));
const ActionCenterPage = lazy(() => import('./pages/ActionCenter').then(m => ({ default: m.ActionCenter })));
const EnterpriseHubPage = lazy(() => import('./pages/EnterpriseHub').then(m => ({ default: m.EnterpriseHub })));

// Payment pages
const PaymentMethodPage = lazy(() => import('./pages/payment/PaymentMethodSetup').then(m => ({ default: m.PaymentMethodSetup })));
const PaymentConfirmPage = lazy(() => import('./pages/payment/PaymentConfirmation').then(m => ({ default: m.PaymentConfirmation })));
const PaymentSuccessPage = lazy(() => import('./pages/payment/PaymentSuccess').then(m => ({ default: m.PaymentSuccess })));

// Dev-only pages
const isDev = (import.meta as any).env?.DEV;
const DesignSystemPage = isDev
    ? lazy(() => import('./pages/DesignSystem').then(m => ({ default: m.DesignSystem })))
    : lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));
const EmptyStatesPage = isDev
    ? lazy(() => import('./pages/EmptyStatesShowcase').then(m => ({ default: m.EmptyStatesShowcase })))
    : lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

function Lazy({ children }: { children: React.ReactNode }) {
    return <Suspense fallback={<PageLoadSkeleton />}>{children}</Suspense>;
}

function resolveNextPath(search: string, fallback = '/dashboard') {
    const params = new URLSearchParams(search);
    const next = params.get('next')?.trim() ?? '';
    if (!next.startsWith('/')) return fallback;
    if (next.startsWith('//')) return fallback;
    if (next === '/login') return fallback;
    return next;
}

function AuthRedirect({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const location = useLocation();
    if (loading) return <LoadingFallback />;
    if (user) return <Navigate to={resolveNextPath(location.search)} replace />;
    return <>{children}</>;
}

export const router = createBrowserRouter([
    {
        element: (
            <AuthProvider>
                <CurrencyProvider>
                    <DemoModeProvider>
                        <Outlet />
                    </DemoModeProvider>
                </CurrencyProvider>
            </AuthProvider>
        ),
        errorElement: <RootErrorPage />,
        children: [
            { path: '/', element: <Lazy><LandingPage /></Lazy> },
            {
                path: '/login',
                element: (
                    <AuthRedirect>
                        <Lazy><LoginPage /></Lazy>
                    </AuthRedirect>
                ),
            },
            { path: '/onboarding', element: <Lazy><OnboardingPage /></Lazy> },

            // Dashboard Layout (Semi-Public)
            {
                element: <ErrorBoundary><DashboardLayout /></ErrorBoundary>,
                children: [
                    { path: '/dashboard', element: <Lazy><ActionCenterPage /></Lazy> },
                    { path: '/browse', element: <Lazy><BrowsePage /></Lazy> },
                    { path: '/market', element: <Lazy><MarketPage /></Lazy> },
                    { path: '/my-pools', element: <Lazy><MyPoolsPage /></Lazy> },
                    { path: '/list', element: <Lazy><CreatePoolPage /></Lazy> },
                    { path: '/create', element: <Lazy><CreatePoolPage /></Lazy> },
                    { path: '/savings', element: <Lazy><SavingsPage /></Lazy> },
                    { path: '/wishlist', element: <Lazy><WishlistPage /></Lazy> },
                    { path: '/plans', element: <Lazy><PlansPage /></Lazy> },
                    { path: '/waitlist', element: <Lazy><WaitlistPage /></Lazy> },
                    { path: '/referrals', element: <Lazy><ReferralPage /></Lazy> },
                    { path: '/enterprise', element: <Lazy><EnterpriseHubPage /></Lazy> },
                    { path: '/design-system', element: <Lazy><DesignSystemPage /></Lazy> },
                    { path: '/empty-states', element: <Lazy><EmptyStatesPage /></Lazy> },
                    { path: '*', element: <Lazy><NotFoundPage /></Lazy> },
                ],
            },

            // Protected Routes
            {
                element: (
                    <ProtectedRoute>
                        <ErrorBoundary><DashboardLayout /></ErrorBoundary>
                    </ProtectedRoute>
                ),
                children: [
                    { path: '/ledger', element: <Lazy><LedgerPage /></Lazy> },
                    { path: '/notifications', element: <Lazy><NotificationsPage /></Lazy> },
                    { path: '/profile', element: <Lazy><ProfilePage /></Lazy> },
                    { path: '/messages', element: <Lazy><MessagesPage /></Lazy> },
                    { path: '/billing', element: <Lazy><BillingPage /></Lazy> },
                    { path: '/subscriptions', element: <Lazy><SubscriptionDetailsPage /></Lazy> },
                    { path: '/payouts', element: <Lazy><PayoutPage /></Lazy> },
                    { path: '/admin', element: <Lazy><AdminPage /></Lazy> },
                    { path: '/payment/method', element: <Lazy><PaymentMethodPage /></Lazy> },
                    { path: '/payment/confirm', element: <Lazy><PaymentConfirmPage /></Lazy> },
                ],
            },
        ],
    },
]);
