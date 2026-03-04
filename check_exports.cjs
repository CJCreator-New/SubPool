const fs = require('fs');
const path = require('path');

const checkExport = (file, exps) => {
    if (!fs.existsSync(file)) return console.log('File missing: ' + file);
    const content = fs.readFileSync(file, 'utf8');
    exps.forEach(exp => {
        // Basic heuristics: 
        if (content.includes(`export const ${exp}`) || content.includes(`export function ${exp}`) || content.includes(`export { ${exp}`) || content.includes(`export {${exp}`) || content.includes(`export default function ${exp}`) || content.includes(`export default ${exp}`) || content.match(new RegExp(`export\\s+type\\s+${exp}\\b`))) {
            console.log('[EXPORT FOUND] ' + exp + ' in ' + file);
        } else {
            console.log('[EXPORT MISSING] ' + exp + ' in ' + file);
        }
    });
};

checkExport('src/lib/pricing-service.ts', ['analyzePricing', 'getSuggestion']);
checkExport('src/app/components/subpool-components.tsx', ['SlotBar', 'StatusPill', 'PlatformIcon', 'StatCard', 'PoolCard', 'NotificationItem']);
checkExport('src/lib/supabase/auth.ts', ['useAuth']);
checkExport('src/lib/supabase/hooks.ts', ['usePools', 'useNotifications', 'useLedger']);
checkExport('src/lib/analytics.ts', ['track']);
checkExport('src/lib/pricing-seed.ts', ['PLATFORM_PRICING_SEED']);
checkExport('src/lib/constants.ts', ['PLATFORMS', 'NAV_ITEMS', 'getPlatform', 'formatPrice', 'timeAgo', 'calcSavings']);
