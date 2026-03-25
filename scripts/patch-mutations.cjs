const fs = require('fs');
const f = 'c:/Users/HP/OneDrive/Desktop/Projects/AntiGravity - Google - Projects/SubPool/src/lib/supabase/mutations.ts';
let c = fs.readFileSync(f, 'utf8');

// Find the createPool try block and patch it to invoke match-wishlist
// Look for the pattern: return ok({ poolId: (data as { id: string }).id });
const oldSnippet = "return ok({ poolId: (data as { id: string }).id });";
const newSnippet = [
    "const poolId = (data as { id: string }).id;",
    "",
    "            // Fire-and-forget: notify wishlist users who match this new pool",
    "            void db.functions.invoke('match-wishlist', {",
    "                body: { pool_id: poolId }",
    "            }).catch(() => { /* non-critical */ });",
    "",
    "            return ok({ poolId });",
].join('\r\n            ');

if (c.includes(oldSnippet)) {
    c = c.replace(oldSnippet, newSnippet);
    fs.writeFileSync(f, c, 'utf8');
    console.log('mutations.ts patched successfully');
} else {
    console.error('Pattern not found in mutations.ts');
    // Show context
    const lines = c.split('\n');
    lines.slice(198, 220).forEach((l, i) => console.log(199 + i + ':', l));
}
