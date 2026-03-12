# SubPool Quality Assurance (QA) Documentation

## 1. Test Strategy Overview
Quality Assurance is executed across three major test layers:
1. **Static Analysis & Linting:** TypeScript compiler checks and Biome/ESLint checks prevent basic syntax errors.
2. **Unit & Integration Testing:** Conducted primarily with Vitest and Testing Library. Focuses on individual component logic, hooks, and utility functions.
3. **End-to-End (E2E) Testing:** Automated using Playwright to handle full user flows, navigating through the browser, executing Supabase requests, and validating UI DOM element states. Accessibility tests (A11y) are folded into this layer.

## 2. Test Execution Plans

### 2.1 Developer Workflow Testing
Developers are expected to run:
* `npm run test:run` (Runs Vitest suite to ensure pure logic and components are functional)
* `npm run test:coverage` (Ensures test coverage remains above threshold)

### 2.2 CI Pipeline Testing
GitHub Actions runs the equivalent of:
* `npm i`
* `npm run build` (Ensures Vite bundles the project without errors)
* `npm run test:run` (Unit tests)
* `npm run test:e2e` (Playwright headless suite on chromium/firefox/webkit)

## 3. Key E2E Test Cases (Playwright)

| ID | Test Name | Objective | Pre-condition | Steps | Expected Result |
|----|-----------|-----------|---------------|-------|-----------------|
| E2E-001 | User Sign In | Verify existing user can authenticate | User exists in DB | Navigate `/login` -> Enter valid credentials -> Click Submit | Redirected to `/browse`, Navbar shows authenticated state. |
| E2E-002 | Pool Browse | Verify search and filtering of pools | Pools exist in DB | Navigate `/browse` -> Type "Netflix" in search | UI only shows Netflix pool cards. |
| E2E-003 | List a Pool Flow | Verify a host can successfully create a new pool | User is authenticated | Click "List a Pool" -> Fill form with valid slot/price -> Submit | Success toast, redirected to newly created Pool modal. |
| E2E-004 | View My Memberships | Verify user sees correct membership status | User joined a pool | Navigate `/me/pools` -> Click "Joined" Tab | Table shows pools user has joined with accurate 'active' or 'pending' pill. |

## 4. Bug Reporting Template
When submitting a bug from either automated failure or manual QA, use this template:
```markdown
**Title:** [Component/Page] Brief description of issue
**Environment:** Produciton/Staging/Local, OS, Browser
**Priority/Severity:** P0(Blocker), P1(High), P2(Medium), P3(Low)

**Steps to Reproduce:**
1. Navigate to '...'
2. Click on '...'
3. Enter '...'

**Expected Behavior:**
The system should...

**Actual Behavior:**
The system currently...

**Attachments:** 
(Screenshots, Playwright trace files, network HAR, console logs)
```
