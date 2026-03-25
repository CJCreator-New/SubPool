# SubPool Remaining Delivery Checklist

Use this file as the active execution backlog. Items here are limited to work that is still `Partial` or `Pending` in [docs/11-project-management.md](c:/Users/HP/OneDrive/Desktop/Projects/AntiGravity%20-%20Google%20-%20Projects/SubPool/docs/11-project-management.md).

Checked items below were verified in the current repo state on March 14, 2026. Unchecked items still need implementation or stronger end-to-end verification.

## Phase 1 Follow-up

- [x] Standardize pagination parameters across list fetches using `.range()` or `.limit()`.
- [x] Add or finish a shared infinite scrolling pagination hook.
- [x] Audit list views to ensure they use the shared pagination pattern consistently.

## Phase 2 Remaining Work

### Trust Score System

- [x] Verify the database schema includes all trust score source fields needed for production.
- [x] Implement or verify `calculate_trust_score()` in the database.
- [x] Add trigger-based automation so trust score updates when source metrics change.
- [x] Confirm badge thresholds and map them to UI labels such as `New Host`, `Trusted`, and `Verified Pro`.
- [x] Wire trust score outputs into the main profile and host surfaces.

Evidence: `supabase/migrations/20260309173000_trust_score.sql`, `src/app/components/trust-score.tsx`, `src/app/components/subpool/PoolCard.tsx`, `src/app/components/subpool-components.tsx`

## Phase 3 Remaining Work

### Wishlist Auto-Matching

- [x] Create the `match-wishlist` Supabase Edge Function.
- [x] Trigger wishlist matching from new pool creation events.
- [x] Insert notifications when a new pool matches a wishlist request.
- [ ] Add verification coverage for wishlist matching behavior.

Evidence: `supabase/functions/match-wishlist/index.ts`, `supabase/migrations/20260313_wishlist_matching.sql`

### Waitlist System

- [x] Create a dedicated waitlist table/schema.
- [x] Add RLS policies for waitlist reads and writes.
- [x] Add queue position indexing and constraints.
- [x] Implement `get_next_waitlist_position()` or equivalent DB automation.
- [x] Update pool CTA from `0 slots` to `Join Waitlist` when full.
- [x] Show `You're #X on the waitlist` in relevant user views.
- [ ] Add owner visibility into current waitlist members and positions.

Evidence: `supabase/migrations/20260313_waitlist_system.sql`, `src/app/components/pool-detail-modal.tsx`, `src/lib/types.ts`

### Pool Templates and Creation Wizard

- [ ] Create the `pool_templates` table and link it to platform categories.
- [ ] Add seed/template data for common platforms.
- [ ] Replace the current pool creation flow with a multi-step wizard.
- [ ] Add dynamic pricing suggestions into the wizard flow.
- [ ] Verify mobile behavior for the full creation flow.

## Phase 4 Remaining Work

### Advanced Search and Filters

- [x] Build a dedicated `FilterPanel` component.
- [x] Add URL search param syncing for active filters.
- [x] Debounce text inputs for search and filtering.
- [x] Add inline comparison or sorting controls where planned.
- [ ] Standardize filter state between browse views and query hooks.

Evidence: `src/app/components/filter-panel.tsx`, `src/app/pages/BrowsePools.tsx`

### Chat Enhancements

- [ ] Add `message_type` to the messages schema.
- [ ] Add `reply_to_id` to the messages schema.
- [ ] Create the `message_reactions` table and policies.
- [ ] Render threaded replies in chat UI.
- [ ] Render emoji reactions in chat UI.
- [ ] Add system announcement message styling.
- [ ] Verify real-time behavior for reactions and replies.

### Onboarding and Empty States

- [ ] Audit all major screens for incomplete or generic empty states.
- [ ] Replace plain fallback states with intentional CTA-based empty states.
- [ ] Persist onboarding progress robustly across refresh/session restore.
- [ ] Verify onboarding routing for both host and joiner paths.

## Phase 5 Remaining Work

### Type Safety

- [ ] Convert shared Supabase queries to generated database types.
- [ ] Remove remaining untyped or loosely typed database access paths.
- [ ] Create typed domain query wrappers such as `getPools()` and `sendMessage()`.
- [x] Enable or verify `strict: true` TypeScript settings repo-wide.
- [ ] Add Zod validation coverage to high-risk forms and payloads.

Evidence: `tsconfig.json`

### Error Handling and Loading States

- [ ] Audit screens still using plain loading text.
- [ ] Replace remaining basic loading states with skeletons.
- [ ] Standardize success and failure toast behavior for mutations.
- [ ] Ensure domain errors map cleanly to user-facing messages.
- [ ] Verify monitoring coverage for high-risk flows.

### Testing

- [ ] Audit current Vitest coverage against active features.
- [ ] Add missing integration tests for RLS-sensitive flows.
- [ ] Add end-to-end coverage for onboarding, membership approval, messaging, wishlist, and waitlist.
- [ ] Ensure CI runs the intended unit, integration, and e2e suites.

### PWA and Mobile Optimization

- [ ] Add `vite-plugin-pwa` and manifest configuration if PWA support remains in scope.
- [ ] Configure service worker caching rules.
- [ ] Audit interactive controls for minimum 44x44 touch targets.
- [ ] Add mobile interaction polish such as swipe-to-dismiss where planned.

## Phase 6 Remaining Work

### Admin Analytics

- [ ] Verify admin role storage and access control.
- [ ] Add any missing admin-scoped database views.
- [ ] Audit `/admin` page against the intended moderation and analytics requirements.
- [ ] Add missing guard rails for bans, user review, and admin-only actions.

### Referral and Gamification

- [ ] Add `referred_by` tracking from signup or invite flows.
- [ ] Store referral attribution in the database.
- [ ] Implement reward logic for successful referrals.
- [ ] Surface referral progress and rewards in the product UI.
- [ ] Add analytics events for referral funnel behavior.

Partial evidence already present: `supabase/migrations/20260312173000_phase4_onboarding_referrals.sql`, `src/app/pages/Profile.tsx`

## Cleanup and Reconciliation

- [ ] Remove the duplicate notification control in `src/app/layouts/DashboardLayout.tsx` if still present.
- [x] Re-run `npx tsc --noEmit` after each major implementation batch.
- [x] Re-audit [docs/11-project-management.md](c:/Users/HP/OneDrive/Desktop/Projects/AntiGravity%20-%20Google%20-%20Projects/SubPool/docs/11-project-management.md) after each completed batch.
- [x] Mark completed items here as work lands so this file stays current.

Open cleanup note: the duplicate notification control is still present in `src/app/layouts/DashboardLayout.tsx` alongside `NotificationBell`.
