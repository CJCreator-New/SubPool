# SubPool Security Documentation

## 1. Threat Model & Mitigations

| Threat | Description | Mitigation Strategy |
| :--- | :--- | :--- |
| **Data Leakage (P0)** | Unauthorized access to user emails, messaging histories, or unverified pools. | **Supabase RLS.** Strict Row Level Security ensures users can only execute SELECT queries on rows they own or are actively participating in (e.g., `messages` table policy requires `auth.uid() = sender_id OR active_membership`). |
| **API Abuse / DDoS** | Bots rapidly creating fake pools or spamming chat messages. | **Database Rate Limiting Triggers.** Custom PostgreSQL function `check_rate_limit(p_user_id, 'pool_mutation', 10)` enforces strict mutation counts per minute per user. |
| **Cross-Site Scripting (XSS)** | Injection of malicious JS payloads through Pool Descriptions or Chat messages. | **React Sanitization.** React implicitly sanitizes all strings rendered in JSX. No use of `dangerouslySetInnerHTML`. |
| **Financial/Ledger Manipulation** | Changing ledger balances directly via API tampering to avoid payment. | **Strict Ledger Auditing & RLS.** The `ledger` table does not allow updates from normal roles. An audit trigger `ledger_audit` logs *all* column changes immutably. |

## 2. Authentication Protocol
SubPool relies entirely on Supabase GoTrue to handle authentication state.
* **Tokens:** JWT access tokens expire every hour. Refresh tokens are stored securely in HTTP-only cookies (or local storage on non-critical native wrappers).
* **Passwords:** Passwords are never stored or transmitted by the application layer. Supabase handles salting/hashing directly.

## 3. Data Protection (GDPR / CCPA)
* **PII Minimization:** The application requires minimal PII. Only an email address is strictly required. Display names are arbitrary.
* **Right to be Forgotten:** Deleting a user from the Supabase Auth system triggers a cascade deletion across the `profiles` table and all owned `pools`, `messages`, and `memberships` due to PostgreSQL `ON DELETE CASCADE` foreign keys.

## 4. Compliance & Routine Assessments
* **Dependency Auditing:** Developer dependencies are audited weekly via `npm audit` and Dependabot PRs.
* **RLS Regression Testing:** DB policies are unit tested in the initial test suite using mocked Auth contexts to ensure policies haven't degraded.
