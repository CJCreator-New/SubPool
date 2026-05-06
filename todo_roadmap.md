# SubPool — Production Readiness TODO List

This document tracks the progress of the SubPool platform towards production readiness, based on the audit report.

## ✅ PHASE 1 — Fix What's Broken (100% Resolved)

### 1.1 Backend / Data Layer
- [x] **Connect real data source**: Browse, My Pools, Wishlist, Ledger, Payouts, Billing, Subscriptions, Messages, Notifications, and Profile are now stable with Supabase connectivity and high-fidelity mock fallbacks.
- [x] **Add proper error boundaries**: Implemented `ErrorBoundary` wrappers in `routes.tsx` and `DashboardLayout.tsx` to prevent cascading crashes.
- [x] **Fix infinite loading states**: Optimized hooks with timeouts and standardized `EmptyState` fallbacks.
- [x] **Fix emoji/Unicode encoding**: Sanitized garbled UTF-8 artifacts across the data layer and UI.

### 1.2 Routing Fixes
- [x] **Consolidate "List a Pool"**: Unified all routes (`/list`, `/list-pool`, `/create`) to a single stable configuration.
- [x] **Fix /savings-hub crash**: Resolved import errors and path matching in `SavingsPage.tsx`.
- [x] **Sidebar Mapping**: Verified and tested all sidebar navigation links for consistency.

***

## 🛠️ PHASE 2 — Core Feature Completeness (In Progress)

### 2.1 Authentication & User Identity
- [x] **Proper Auth flow**: Implemented multi-mode "Cyber-Industrial" LoginPage with Password (Node Key) and Magic Link support.
- [x] **Email verification**: Integrated Supabase signup flow with verification states.
- [x] **Session persistence**: Finalized JWT refresh token logic and route-level guards.
- [x] **Role-based access**: Implemented explicit Host, Member, Guest, and Admin roles.
- [x] **Profile completion flow**: Build a guided onboarding stepper for avatar, bio, and identity sync. (Phase 2.1 Complete)

### 2.2 Pool Management (Core Product)
- [x] **List a Pool wizard**: Create a multi-step form (Platform → Plan → Slots → Pricing → Rules). (Phase 2.2 Complete)
- [x] **Pool detail page**: Build the comprehensive public view for individual pools. (Phase 2.2 Complete)
- [x] **Join request flow**: Finalize the Host Approve/Reject → Payment lifecycle. (Phase 2.2 Complete)
- [x] **Pool editing**: Allow hosts to update pricing and slot availability dynamically. (Phase 2.2 Complete)
- [x] **Pool lifecycle management**: Implement Active, Expiring, and Expired state transitions. (Phase 2.2 Complete)
- [x] **Slot occupancy tracker**: Real-time display of filled vs. available slots. (Phase 2.2 Complete)

### 2.3 Payments & Financial Infrastructure
- [x] **Payment gateway integration**: Connect Razorpay (India) and Stripe (International). (Simulated Settlement Complete)
- [ ] **Automated billing**: Implement recurring collection logic.
- [x] **Host payout system**: Settlement requests and withdrawal portal. (Phase 2.3 Complete)
- [x] **Ledger integration**: Connect UI to real transaction history data. (Integrated with Payments)
- [ ] **Billing management**: Invoices and payment method retry logic.
- [x] **Refund handling**: Implement pro-rated refunds for mid-cycle departures. (Phase 2.3 Complete)
- [x] **Currency toggle (INR/USD)**: UI connected to currency context (Standardized).

### 2.4 Messaging
- [x] **In-app chat**: Real-time 1:1 messaging via Supabase Realtime. (Phase 2.4 Complete)
- [x] **Pool group chat**: Shared threads for pool members. (Phase 2.4 Complete)
- [x] **System messages**: Automated status updates in chat threads. (Phase 2.4 Complete)
- [x] **Message status**: Read receipts and delivery indicators. (Phase 2.4 Complete)

***

## 🛡️ PHASE 3 — Trust & Safety Layer
- [x] **Trust Score system**: Reputation engine based on payment history and ratings. (Phase 3 Complete)
- [x] **Ratings & Reviews**: Post-cycle feedback loops. (Phase 3 Complete)
- [x] **KYC/Identity verification**: Phone/Aadhaar verification for high-value nodes. (Phase 3 Complete)
- [x] **Dispute resolution**: Admin mediation workflow. (Phase 3 Complete)
- [x] **Fraud detection**: Anomaly detection for payment reversals and slot hopping. (Phase 3 Complete)
- [x] **Legal framework**: Terms of Service and Privacy Policy integrated. (Phase 3 Complete)

***

## 📈 PHASE 4 — Discovery & Growth
- [x] **Full-text search**: Search by platform, category, or host using `search_vector` and GIN indexing.
- [x] **Advanced filters**: Integrated Price range, rating, and status filters in `BrowsePools`.
- [x] **Wishlist Alerts**: Real-time notifications for slot availability via "Watch Platform" feature.
- [x] **Referral Dashboard**: Ambassador tracking links, earnings, and reward claiming. (Phase 4 Complete)

***

## 💰 PHASE 5 — Monetization & Plans
- [x] **Freemium Gating**: Enforce limits for Free tier (e.g., max 3 pools).
- [x] **Pro Subscription**: Connect Razorpay/Stripe for ₹399/mo subscription.
- [x] **Host Plus Tools**: Enable Market Intelligence and Reseller tools for premium hosts.
- [x] **Featured Listings**: Allow hosts to pay for priority placement in Browse feed.
- [x] **Platform Fees**: Automated 5% fee calculation and display in Ledger.

***

## ⚙️ PHASE 6 — Operational Features
- [ ] **Push Notifications**: PWA/Mobile push notifications.
- [x] **Admin Dashboard**: Fixed access denied screen (Escape Hatch) and initial metrics views.
- [x] **Market Intelligence**: Implement dynamic suggested pricing logic. (Alpha Integrated into List Wizard)

***

## 🏗️ PHASE 7 — Production Hardening
- [x] **RLS Policies**: Finalized comprehensive security hardening. (Phase 7 Complete)
- [x] **Sentry Integration**: Integrated centralized crash tracking and performance monitoring.
- [x] **SEO Optimization**: Integrated dynamic metadata and Open Graph tags.
- [x] **Testing Suite**: Implemented Playwright E2E tests for Referral & Payout cycles.
