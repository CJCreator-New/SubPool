// ─── SubPool — Routes ──────────────────────────────────────────────────────────
// All dashboard children are lazy-loaded with Suspense fallback.
// DashboardLayout wraps all authenticated pages with sidebar + topbar.

import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router';
import { DashboardLayout, ProtectedRoute } from './layouts/DashboardLayout';
import { useAuth } from '../lib/supabase/auth';
import { DemoModeProvider } from './components/demo-mode';
import { ErrorBoundary } from './components/error-boundary';
import { PageLoadSkeleton } from './components/skeletons';

// ─── Suspense wrapper ─────────────────────────────────────────────────────────

function PageSuspense({ children }: { children: React.ReactNode }) {
    return (
        <ErrorBoundary>
            <Suspense fallback={<div className="p-8"><PageLoadSkeleton /></div>}>
                {children}
            </Suspense>
        </ErrorBoundary>
    );
}

// ─── Suspense fallback ────────────────────────────────────────────────────────

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
const SavingsPage = lazy(() => import('./pages/Savings').then(m => ({ default: m.Savings })));
const BillingPage = lazy(() => import('./pages/Billing').then(m => ({ default: m.Billing })));
const PayoutPage = lazy(() => import('./pages/PayoutDashboard').then(m => ({ default: m.PayoutDashboard })));
const DesignSystemPage = lazy(() => import('./pages/DesignSystem').then(m => ({ default: m.DesignSystem })));
const EmptyStatesPage = lazy(() => import('./pages/EmptyStatesShowcase').then(m => ({ default: m.EmptyStatesShowcase })));
const NotFoundPage = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));
const OnboardingPage = lazy(() => import('./pages/Onboarding').then(m => ({ default: m.Onboarding })));

// Payment pages
const PaymentMethodPage = lazy(() => import('./pages/payment/PaymentMethodSetup').then(m => ({ default: m.PaymentMethodSetup })));
const PaymentConfirmPage = lazy(() => import('./pages/payment/PaymentConfirmation').then(m => ({ default: m.PaymentConfirmation })));
const PaymentSuccessPage = lazy(() => import('./pages/payment/PaymentSuccess').then(m => ({ default: m.PaymentSuccess })));

// Mobile pages
const MobileBrowsePage = lazy(() => import('./pages/MobileBrowse').then(m => ({ default: m.MobileBrowse })));
const MobilePoolDetailPage = lazy(() => import('./pages/MobilePoolDetail').then(m => ({ default: m.MobilePoolDetail })));
const MobileMyPoolsPage = lazy(() => import('./pages/MobileMyPools').then(m => ({ default: m.MobileMyPools })));
const MobileLedgerPage = lazy(() => import('./pages/MobileLedger').then(m => ({ default: m.MobileLedger })));
const MobileNotificationsPage = lazy(() => import('./pages/MobileNotifications').then(m => ({ default: m.MobileNotifications })));
const MobileCreatePoolPage = lazy(() => import('./pages/MobileCreatePool').then(m => ({ default: m.MobileCreatePool })));

// Investor demo pages
const InvestorDemoPage = lazy(() => import('./pages/InvestorDemo').then(m => ({ default: m.InvestorDemo })));
const InvestorDemoEnhancedPage = lazy(() => import('./pages/InvestorDemoEnhanced').then(m => ({ default: m.InvestorDemoEnhanced })));

// ─── Suspense wrapper ─────────────────────────────────────────────────────────

function Lazy({ children }: { children: React.ReactNode }) {
    return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>;
}

// ─── Auth Redirect (for /login) ──────────────────────────────────────────────

function AuthRedirect({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) return <LoadingFallback />;
    if (user) return <Navigate to="/browse" replace />;

    return <>{children}</>;
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const router = createBrowserRouter([
    {
        element: (
            <DemoModeProvider>
                <Outlet />
            </DemoModeProvider>
        ),
        children: [
            // Root path is now the Landing Page
            {
                path: '/',
                element: <Lazy><LandingPage /></Lazy>,
            },

            // Login / landing (outside dashboard)
            {
                path: '/login',
                element: (
                    <AuthRedirect>
                        <Lazy><LoginPage /></Lazy>
                    </AuthRedirect>
                ),
            },
            {
                path: '/landing',
                element: <Navigate to="/" replace />,
            },
            {
                path: '/onboarding',
                element: <Lazy><OnboardingPage /></Lazy>,
            },

            // Investor demos (outside dashboard)
            {
                path: '/demo',
                element: <Lazy><InvestorDemoEnhancedPage /></Lazy>,
            },
            {
                path: '/demo-original',
                element: <Lazy><InvestorDemoPage /></Lazy>,
            },

            // Mobile standalone pages
            {
                path: '/mobile',
                element: <Lazy><MobileBrowsePage /></Lazy>,
            },
            {
                path: '/mobile/pool-detail',
                element: <Lazy><MobilePoolDetailPage /></Lazy>,
            },
            {
                path: '/mobile/my-pools',
                element: <Lazy><MobileMyPoolsPage /></Lazy>,
            },
            {
                path: '/mobile/ledger',
                element: <Lazy><MobileLedgerPage /></Lazy>,
            },
            {
                path: '/mobile/notifications',
                element: <Lazy><MobileNotificationsPage /></Lazy>,
            },
            {
                path: '/mobile/create-pool',
                element: <Lazy><MobileCreatePoolPage /></Lazy>,
            },

            // Payment success (outside dashboard)
            {
                path: '/payment/success',
                element: <Lazy><PaymentSuccessPage /></Lazy>,
            },

            // ─── Dashboard layout wrapping all authenticated pages ──────
            {
                element: (
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                ),
                children: [
                    { path: '/browse', element: <Lazy><BrowsePage /></Lazy> },
                    { path: '/my-pools', element: <Lazy><MyPoolsPage /></Lazy> },
                    { path: '/list', element: <Lazy><CreatePoolPage /></Lazy> },
                    { path: '/create', element: <Lazy><CreatePoolPage /></Lazy> },
                    { path: '/ledger', element: <Lazy><LedgerPage /></Lazy> },
                    { path: '/notifications', element: <Lazy><NotificationsPage /></Lazy> },
                    { path: '/profile', element: <Lazy><ProfilePage /></Lazy> },
                    { path: '/market', element: <Lazy><MarketPage /></Lazy> },
                    { path: '/messages', element: <Lazy><MessagesPage /></Lazy> },
                    { path: '/wishlist', element: <Lazy><WishlistPage /></Lazy> },
                    { path: '/savings', element: <Lazy><SavingsPage /></Lazy> },
                    { path: '/billing', element: <Lazy><BillingPage /></Lazy> },
                    { path: '/payouts', element: <Lazy><PayoutPage /></Lazy> },
                    { path: '/design-system', element: <Lazy><DesignSystemPage /></Lazy> },
                    { path: '/empty-states', element: <Lazy><EmptyStatesPage /></Lazy> },
                    { path: '/payment/method', element: <Lazy><PaymentMethodPage /></Lazy> },
                    { path: '/payment/confirm', element: <Lazy><PaymentConfirmPage /></Lazy> },
                    { path: '*', element: <Lazy><NotFoundPage /></Lazy> },
                ],
            },

            {
                path: '*',
                element: <Lazy><NotFoundPage /></Lazy>,
            },
        ],
    },
]);
