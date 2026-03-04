const fs = require('fs');
const f = 'src/app/components/subpool-components.tsx';
let c = fs.readFileSync(f, 'utf8');

c = c.replace(
    'backgroundColor: pool.owner.avatar_color,',
    "backgroundColor: pool.owner?.avatar_color ?? '#6B6860',"
);

c = c.replace(
    'pool.owner.display_name.charAt(0).toUpperCase()',
    "(pool.owner?.display_name ?? pool.owner?.username ?? '?').charAt(0).toUpperCase()"
);

c = c.replace(
    '{pool.owner.display_name}',
    "{pool.owner?.display_name ?? pool.owner?.username ?? 'Host'}"
);

fs.writeFileSync(f, c);
console.log('Done - patched PoolCard owner references');
