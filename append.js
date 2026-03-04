const fs = require('fs');

const sql = `
-- ADDED RLS POLICIES FOR SUBSCRIPTION AUDIT
alter table platform_pricing enable row level security;
create policy "platform_pricing_read" on platform_pricing for select using (true);
alter table pool_market_metrics enable row level security;
create policy "metrics_read" on pool_market_metrics for select using (true);
alter table pricing_refresh_log enable row level security;
create policy "refresh_log_read" on pricing_refresh_log for select using (true);
alter table subpool_plans enable row level security;
create policy "subpool_plans_read" on subpool_plans for select using (true);
`;

fs.appendFileSync('supabase/schema.sql', sql);
console.log('Appended securely.');
