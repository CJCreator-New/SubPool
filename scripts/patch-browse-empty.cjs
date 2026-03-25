const fs = require('fs');
const f = 'c:/Users/HP/OneDrive/Desktop/Projects/AntiGravity - Google - Projects/SubPool/src/app/pages/BrowsePools.tsx';
let c = fs.readFileSync(f, 'utf8');
const lines = c.split('\n');

// Remove lines 514..523 (0-indexed), which is the ) : ( ... } empty state block
const before = lines.slice(0, 514);
const after  = lines.slice(524);

const newBlock = [
  "        ) : (\r",
  "          <div className=\"flex flex-col items-center gap-5 py-8\">\r",
  "            <EmptyState\r",
  "              icon=\"\uD83D\uDD2D\"\r",
  "              title=\"No pools found\"\r",
  "              description=\"Try a different filter or search term to find what you're looking for.\"\r",
  "              action={clearFilters}\r",
  "              actionLabel=\"Clear filters\"\r",
  "            />\r",
  "            {hasSearchFilter && (\r",
  "              <div className=\"max-w-sm w-full rounded-xl border border-dashed border-primary/30 bg-primary/5 p-5 text-center\">\r",
  "                <p className=\"font-display font-semibold text-sm text-foreground mb-1\">\r",
  "                  Don't see what you need?\r",
  "                </p>\r",
  "                <p className=\"font-mono text-[11px] text-muted-foreground mb-4\">\r",
  "                  Post a wishlist request and get notified when a host offers a slot.\r",
  "                </p>\r",
  "                <Button\r",
  "                  size=\"sm\"\r",
  "                  variant=\"outline\"\r",
  "                  className=\"border-primary/40 text-primary hover:bg-primary/10 font-mono text-[11px] uppercase tracking-wider\"\r",
  "                  onClick={() => navigate('/wishlist')}\r",
  "                >\r",
  "                  \u2728 Add to Wishlist\r",
  "                </Button>\r",
  "              </div>\r",
  "            )}\r",
  "          </div>\r",
  "        )\r",
  "      }\r"
];

const result = [...before, ...newBlock, ...after].join('\n');
fs.writeFileSync(f, result, 'utf8');
console.log('Done. Lines:', result.split('\n').length);
