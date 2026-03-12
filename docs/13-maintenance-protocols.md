# SubPool Maintenance Protocols

## 1. Update Procedures (Routine Maintenance)
SubPool aims for zero-downtime deployments. Maintenance primarily involves database schema migrations and dependency updates.

### 1.1 Dependency Updates
* Use Dependabot or `npm outdated` running weekly to identify stale libraries.
* Minor version bumps should be automatically merged if unit tests (`npm run test:run`) pass.
* Major version bumps (e.g., React 18 to 19, or Vite 5 to 6) require manual regression testing via branch preview deployments.

### 1.2 Database Migrations
* Run during low-traffic periods (determined via analytics, typically 2AM - 4AM EST).
* All migrations must be backwards-compatible with the currently active Front-End to ensure active clients do not break.
* E.g., Adding a column -> Deploy DB -> Deploy Frontend. Dropping a column -> Remove Frontend usage -> Deploy Frontend -> Drop column from DB.

## 2. Support Escalation Paths

| Level | Role | Responsibilities | Contact Method |
| :--- | :--- | :--- | :--- |
| **L1 Support** | Community/CS Rep | Handles user inquiries ("I forgot my password", "How do I list a pool?"). Filters out actual bugs. | Helpdesk Platform |
| **L2 Support** | Product Manager | Identifies edge-case bugs, UI glitches, verifies bug reports from L1. Prioritizes bugs into the sprint. | JIRA / Issue Tracker |
| **L3 Escalation** | Engineering Lead | Critical system failures, database corruption, security vulnerabilities. Wakes up at 3AM. | Direct Slack/Phone Ping |

## 3. Disaster Recovery Plans (DRP)

### Scenario A: Vercel Frontend Outage
* **Impact:** Users see 500/502/Browser Offline errors.
* **Recovery:** 
  1. Check Vercel Status page. 
  2. If Vercel is down globally, we must wait or manually re-deploy the bundle to AWS S3/Cloudfront or Cloudflare Pages as an emergency fallback using the GitHub Action artifact.

### Scenario B: Database Accidental DROP or Corruption
* **Impact:** Critical Application Failure / Data Loss.
* **Recovery:**
  1. Trigger "Maintenance Mode" on Frontend via split-tunneling or emergency Vercel environment variable toggle to stop writes.
  2. Open Supabase Dashboard -> Backups.
  3. Initiate Point-In-Time-Recovery (PITR) to precisely 1 minute before the corruption event.
  4. Wait for restore completion (Takes 10-30 mins depending on cluster size).
  5. Verify data integrity manually.
  6. Disable "Maintenance Mode" and monitor logs.
