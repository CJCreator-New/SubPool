# SubPool UI/UX Audit Roadmap and Progress Tracker

Last updated: 2026-03-05  
Source: End-to-end UI/UX audit across acquisition, discovery, conversion, onboarding, and retention flows.

## 1. Objective
Turn audit findings into a sprint-trackable execution plan that improves:
- User satisfaction
- Conversion to join/list/upgrade actions
- Accessibility and cross-device quality
- Perceived performance and trust

## 2. Baseline Snapshot (Pre-Implementation)

| Dimension | Baseline (1-5) | Notes |
| :--- | :---: | :--- |
| Visual consistency and hierarchy | 3.0 | Mixed UI systems across key routed pages create inconsistency. |
| Navigation and IA clarity | 3.2 | Core flows are discoverable, but pathing is dense and duplicated in places. |
| Interaction quality and micro-feedback | 3.1 | Good base interactions, inconsistent confirm/toast/loading patterns. |
| Accessibility and inclusive design | 3.4 | Strong base patterns, but contrast/focus/touch-size gaps remain. |
| Mobile responsiveness | 3.5 | Responsive baseline is good; dense screens need better mobile affordances. |
| Onboarding and first-time activation | 2.9 | Checklist and first-use guidance need behavior-driven progression. |
| Performance UX | 3.0 | Heavy route bundles impact perceived responsiveness on key pages. |

Estimated overall UX maturity: **3.16 / 5**

## 3. Priority Scale
- `P0`: Highest ROI now (high impact on satisfaction/conversion, low-medium effort)
- `P1`: Important next (high impact, medium-high effort)
- `P2`: Follow-up polish or scale

## 4. Journey-Based Implementation Backlog

### Phase A: Awareness and Trust

| ID | Screen / Element | Improvement to implement | Priority | Effort | Status | Target Sprint |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| UX-01 | Landing hero and CTAs | Enforce single primary CTA, secondary host CTA, trust strip (secure payments, social proof). Wireframe: 2-column hero with right-side product visual. | P0 | M | Not Started | Sprint 1 |
| UX-02 | Guest browse -> auth handoff | Preserve browse state and open inline auth sheet only at high-intent actions. | P0 | M | Completed | Sprint 1 |
| UX-03 | Legacy routed pages (Messages, Market, Wishlist, payment pages) | Migrate to unified component system and spacing/typography tokens to remove visual drift. | P0 | L | Completed | Sprint 1-2 |
| UX-04 | Color and typography system | Enforce semantic color tokens and text scale with WCAG AA checks. | P0 | M | In Progress | Sprint 2 |

### Phase B: Discovery and Evaluation

| ID | Screen / Element | Improvement to implement | Priority | Effort | Status | Target Sprint |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| UX-05 | Browse filters and sort controls | Add sticky filter bar with active filter chips, count, and clear-all action. | P0 | M | Completed | Sprint 2 |
| UX-06 | Pool cards | Reorder card hierarchy: identity -> price/slots -> trust signals -> CTA. | P0 | M | Not Started | Sprint 2 |
| UX-07 | Pool detail modal | Redesign into split panel with sticky summary/CTA and resilient fallback error state. | P0 | M | Not Started | Sprint 3 |
| UX-08 | Mobile browse flow | Increase touch targets, add sticky bottom action area, and simplify dense card view. | P0 | M | Not Started | Sprint 3 |
| UX-09 | Compare behavior | Add shortlist/compare drawer for up to 3 pools. | P1 | M | Not Started | Sprint 4 |

### Phase C: Conversion (Join, List, Payment)

| ID | Screen / Element | Improvement to implement | Priority | Effort | Status | Target Sprint |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| UX-10 | List a Pool flow | Convert long form into 3-step wizard with progress stepper and autosave draft. | P0 | M | Not Started | Sprint 3 |
| UX-11 | Conversion pricing summary | Add clear fee and payout breakdown: member pays, you receive, fees, next billing. | P0 | S | Not Started | Sprint 3 |
| UX-12 | Payment setup/confirmation/success | Separate test-mode and live-mode UX; add explicit mode badge and status states. | P0 | M | Not Started | Sprint 4 |
| UX-13 | Error handling (rate limit and server errors) | Map backend errors to actionable copy with cooldown timers and retry guidance. | P0 | S | Completed | Sprint 3 |

### Phase D: Activation and First-Time Experience

| ID | Screen / Element | Improvement to implement | Priority | Effort | Status | Target Sprint |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| UX-14 | Activation checklist | Auto-complete checklist from real events instead of manual mark-complete behavior. | P0 | M | Not Started | Sprint 4 |
| UX-15 | Role-based onboarding | Split first-run flows for `Joiner` vs `Host` intent. | P0 | M | Not Started | Sprint 4 |
| UX-16 | Empty states | Standardize with one primary CTA + one learn-more action per empty page. | P1 | S | Not Started | Sprint 4 |
| UX-17 | Contextual product education | Add lightweight first-time tips for filters, publishing, and renewal management. | P1 | M | Not Started | Sprint 5 |

### Phase E: Core Daily Use and Retention

| ID | Screen / Element | Improvement to implement | Priority | Effort | Status | Target Sprint |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| UX-18 | Messages | Adopt modern thread layout, composer states, and read/delivery cues. | P0 | M | Not Started | Sprint 5 |
| UX-19 | Notifications | Group by urgency/time and add quick actions (approve, dismiss, mark all read). | P1 | M | In Progress | Sprint 5 |
| UX-20 | My Pools dashboard | Add "Today" command center cards (renewals due, unpaid members, pending requests). | P0 | M | In Progress | Sprint 5 |
| UX-21 | Ledger | Improve readability with sticky headers, semantic chips, and mobile card mode. | P1 | M | Not Started | Sprint 6 |
| UX-22 | Confirmations and undo patterns | Replace ad-hoc confirms with standardized dialog + undo snackbar interactions. | P1 | M | In Progress | Sprint 6 |

### Phase F: Monetization and Growth

| ID | Screen / Element | Improvement to implement | Priority | Effort | Status | Target Sprint |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| UX-23 | Billing and renewals | Add renewal timeline card with amount, date, payment method, and one-click update. | P0 | S | Not Started | Sprint 6 |
| UX-24 | Paywall and plans | Make upsell contextual to user intent and blocked action; include concrete value copy. | P1 | M | Not Started | Sprint 6 |
| UX-25 | Savings and market intelligence | Add data freshness/source/confidence labels for trust. | P1 | S | Not Started | Sprint 6 |
| UX-26 | Wishlist conversion loop | Trigger "matching pool found" alerts with one-tap conversion to join flow. | P1 | M | Not Started | Sprint 7 |

### Cross-Cutting Foundations

| ID | Stream | Improvement to implement | Priority | Effort | Status | Target Sprint |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| UX-27 | Accessibility | Complete keyboard order, visible focus, aria-live, touch-target, and reduced-motion pass. | P0 | M | In Progress | Sprint 2-7 |
| UX-28 | Performance UX | Route-level code splitting, defer heavy charts, list virtualization, and interaction timing budget. | P0 | M/L | Not Started | Sprint 3-7 |

## 5. KPI Targets and Measurement

| KPI | Baseline | Target | Measurement Window |
| :--- | :---: | :---: | :--- |
| Join conversion from browse view | TBD | +15% | 30 days post-release |
| List-a-pool completion rate | TBD | +20% | 30 days post-release |
| First-session activation completion | TBD | +25% | 30 days post-release |
| Mobile task success (join/list) | TBD | +15% | 30 days post-release |
| Critical a11y issues (WCAG AA) | TBD | 0 open | Continuous QA |
| P75 interaction delay on heavy pages | TBD | -30% | 14 days post-release |

## 6. Progress Dashboard

### Item-level progress
- Total roadmap items: **28**
- Completed: **4**
- In progress: **5**
- Blocked: **0**
- Not started: **19**
- Completion: **14%**

### Phase-level progress

| Phase | Total Items | Completed | In Progress | Completion |
| :--- | :---: | :---: | :---: | :---: |
| A. Awareness and Trust | 4 | 2 | 1 | 50% |
| B. Discovery and Evaluation | 5 | 1 | 0 | 20% |
| C. Conversion | 4 | 1 | 0 | 25% |
| D. Activation | 4 | 0 | 0 | 0% |
| E. Daily Use and Retention | 5 | 0 | 3 | 0% |
| F. Monetization and Growth | 4 | 0 | 0 | 0% |
| Cross-Cutting | 2 | 0 | 1 | 0% |

## 7. Weekly Update Template

Use this block to update progress every week:

```md
### Weekly Update - YYYY-MM-DD
- Completed IDs:
- In-progress IDs:
- Blocked IDs + reason:
- KPI movement:
- Scope changes:
- Next sprint focus:
```

## 8. Latest Update

### Weekly Update - 2026-03-05
- Completed IDs: UX-02, UX-03, UX-05, UX-13
- In-progress IDs: UX-04, UX-19, UX-20, UX-22, UX-27
- Blocked IDs + reason: None
- KPI movement: Pending baseline instrumentation
- Scope changes: Completed reusable backend error mapping coverage for list, wishlist, profile, join-request actions, and billing/subscriptions; added async crash guards; fixed strict Pool typing mismatches in shared components; fully migrated Market, Messages, Wishlist, and payment routes to the unified UI system; replaced ad-hoc `window.confirm` membership cancellation prompts with accessible dialog + undo snackbar flow; aligned global toast styling to semantic theme tokens; added a My Pools "Today Command Center" (renewals due soon, overdue payments, pending requests); grouped notifications into actionable time-based sections and preserved quick-action controls; extended standardized confirm + undo flow to wishlist request cancellations
- Next sprint focus: Complete UX-04 token enforcement across remaining high-traffic pages, finish UX-22 confirm/undo coverage for additional destructive actions, and continue UX-27 accessibility pass on remaining loading/error states
