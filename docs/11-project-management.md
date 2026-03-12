# SubPool Project Management Artifacts

## 1. Work Breakdown Structure (WBS)
SubPool was developed in three major phases.

* **Phase 1: Minimum Viable Product (MVP)**
    * 1.1 Infrastructure Setup (Vite, Tailwind, Supabase schema v1)
    * 1.2 Authentication & Profiles
    * 1.3 Basic Pool CRUD (Create, Read, Update, Delete)
    * 1.4 Frontend Routing & Authentication Guards
* **Phase 2: Polish & Financials (P2)**
    * 2.1 Complex Modal UI (PoolDetailModal)
    * 2.2 The Ledger System (Financial state tracking)
    * 2.3 Real-time Messaging
    * 2.4 Wishlists (Reverse Pool requests)
* **Phase 3: Automated Intelligence & Performance (P3)**
    * 3.1 GIN Indexing & Full-Text Search
    * 3.2 Automated Market Pricing Triggers
    * 3.3 Database Rate Limiting
    * 3.4 Push Notification Token infrastructure

## 2. Risk Management Register

| Risk ID | Risk Title | Probability | Impact | Mitigation Plan | Owner |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **R-01** | **Supabase API Downtime** | Low | Critical | Implement graceful degradation on frontend; show cached data where possible; display friendly maintenance banner. | Infra Lead |
| **R-02** | **Stripe/Ledger Sync Failure** | Medium | High | Implement webhook retry logic and `ledger_audit` tables to manually reconcile discrepancies. | Backend Engineer |
| **R-03** | **Spam Pool Listings** | High | Medium | Implement Rate Limiting (Phase P3-39) and user reporting tools. Require `is_verified` flag for hosting. | Mod Team |
| **R-04** | **Platform Terms of Service Changes** | High | Critical | If Netflix/Spotify aggressively blocks sharing technically (IP gating), SubPool must pivot supported platforms instantly and notify users. | Legal/Product |

## 3. Resource Allocation Matrix (RACI)

| Task / Feature | PM | UI/UX Designer | Frontend Eng. | Backend/DB Eng. | QA Tester |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Architecture Design** | A | C | C | R | I |
| **UI Components (Tailwind)** | I | R | R/A | I | C |
| **Database Migrations** | I | I | C | R/A | C |
| **E2E Testing Scripts** | I | I | C | I | R/A |
| **Feature Release** | R/A | I | I | I | C |

*(R=Responsible, A=Accountable, C=Consulted, I=Informed)*

## 4. Overall Progress Snapshot (Updated 2026-03-05)

This snapshot combines feature delivery status and UX hardening status so execution can be tracked in one place.

| Workstream | Current State | Estimated Progress | Tracking Source |
| :--- | :--- | :---: | :--- |
| Core Product Delivery (MVP + P2 + P3) | Major features delivered and integrated; hardening continues. | 85% | `docs/01-technical-architecture.md`, `docs/02-product-requirements.md` |
| Database and Security Controls | RLS, messaging policies, market metrics, and rate limiting are implemented. | 90% | `supabase/migrations/20260305_consolidated_p2_p3.sql` |
| QA and Test Foundation | Unit/integration/e2e setup exists; scenario alignment still ongoing in specific flows. | 80% | `docs/07-qa-documentation.md` |
| UI/UX Standardization and Journey Optimization | Execution started: guest auth handoff shipped, crash-hardening in progress, filter UX improvements in progress. | 4% | `docs/14-ui-ux-audit-roadmap.md` |

### Overall Program Progress

Weighted overall progress (delivery + hardening + UX roadmap): **65%**

### Next Control Points

1. Complete Sprint 1 and Sprint 2 items from `docs/14-ui-ux-audit-roadmap.md`.
2. Update phase-level completion and KPI movement weekly in the UX roadmap doc.
3. Re-baseline overall program progress after each sprint review.
