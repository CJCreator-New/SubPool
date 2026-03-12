# SubPool Post-Deployment Monitoring Specifications

## 1. Overview
Monitoring the health of SubPool involves tracking Front-End client errors, Supabase Database performance, and Edge Function invocation success rates. 

## 2. Logging Standards
* **Client-side Exceptions:** Sentry SDK (`@sentry/react`) is included in the package.json. It must be initialized in `src/main.tsx` to automatically capture unhandled React errors, promise rejections, and slow resource loads on client devices.
* **Database Logs:** Supabase natively captures Postgres logs. Any queries taking longer than 1000ms (`log_min_duration_statement = 1000`) are flagged as slow queries.

## 3. Performance Metrics (Key Performance Indicators)
Metrics are tracked using Vercel Analytics (Frontend) and Supabase Dashboard (Backend).

### Frontend Metrics
* **Core Web Vitals:** 
    * LCP (Largest Contentful Paint): Target < 2.5s
    * FID (First Input Delay): Target < 100ms
    * CLS (Cumulative Layout Shift): Target < 0.1

### Backend Metrics
* **API Ingress/Egress Volume:** Track spikes in bandwidth.
* **Query Latency:** Target P95 latency < 150ms.
* **Realtime Connections:** Monitor concurrent active websocket connections to ensure we do not hit Supabase project limits.

## 4. Alerting Thresholds
Alert mechanisms (via PagerDuty or Slack webhooks) are triggered on the following:

| Metric | Threshold Alert Level | Action Required |
| :--- | :--- | :--- |
| **Client Error Rate** | > 1% of total requests over 5 min | Investigate Sentry immediately. Assess recent frontend deployment for rollback. |
| **Auth Request Failures** | > 5% failure rate / min | Verify Supabase GoTrue service status. Check third-party OAuth providers. |
| **DB Connection Pool Usage**| > 80% capacity | Requires immediate manual inspection of long-running queries; consider scaling DB instance. |
| **Rate Limit Trigger Hits** | > 100/minute globally | Indicate potential bot attack. Adjust `check_rate_limit` parameters dynamically if needed. |
