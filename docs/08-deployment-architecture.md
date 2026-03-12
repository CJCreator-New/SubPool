# SubPool Deployment Architecture & Infrastructure

## 1. Overview
SubPool utilizes a modern, serverless hosting strategy to ensure high availability, automatic scaling, and low operational overhead.
* **Frontend Hosting:** Vercel. Chosen for its native optimizations with Vite and global Edge CDN.
* **Backend Platform:** Supabase Cloud (Managed PostgreSQL, Auth, Realtime APIs, Storage).

## 2. Infrastructure Requirements
* No persistent EC2 servers or containers to manage.
* **Supabase Project:** Configured with proper instance sizing based on DAU (Daily Active Users). Connection pooling via PgBouncer or Supavisor is enforced on high-volume traffic.
* **Environment Variables (Vercel):**
  * `VITE_SUPABASE_URL`
  * `VITE_SUPABASE_ANON_KEY`
  * (Optional) Analytics IDs, Stripe Publishable Keys for payment processing integrations.

## 3. CI/CD Pipeline Configuration (GitHub Actions -> Vercel)
### 3.1 Push to Branch (PRs)
1. GitHub webhook triggers GitHub Actions.
2. Runs code validation (`npm run test:run`, `npm run test:e2e:ci`).
3. Vercel automatically deploys a "Preview Branch" instance.
4. Bot comments PR with the generated Preview URL.

### 3.2 Merge to `main` (Production)
1. Code merges to `main`.
2. Vercel detects `main` update -> runs `npm run build`.
3. Vercel deploys the `dist/` bundle to the production domain.
4. Supabase DB Migrations: Database schemas (located in `supabase/migrations/`) must be run against the production database using GitHub Actions utilizing the `supabase cli`.
   *Action:* `supabase db push` against the linked production Supabase project ID.

## 4. Rollback Procedures
### 4.1 Frontend Rollbacks
If a critical UI bug escapes to production:
1. Navigate to the Vercel Dashboard for SubPool.
2. Go to the "Deployments" tab.
3. Select the immediately preceding successful deployment.
4. Click "... -> Promote to Production" or "Rollback".
5. Rollback executes instantly via Vercel's edge network routing.

### 4.2 Database Rollbacks
Database rollbacks are significantly more complex due to state.
* **Non-destructive:** If a migration added a table or column, a subsequent hotfix migration should be deployed deleting it.
* **Destructive:** If records were corrupted, the procedure is to restore from Supabase PITR (Point in Time Recovery). 
  * Go to Supabase > Database > Backups.
  * Select the exact minute prior to the failed migration.
  * Restore database (Requires downtime).
