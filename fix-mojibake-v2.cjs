const fs = require('fs');
const path = require('path');

const REPLACEMENTS = [
  ['\u00c3\u00a2\u00e2\u201a\u00ac\u00e2\u20ac\u0153', '\u2500'],
  ['\u00e2\u0080\u0093', '\u2013'],
  ['\u00e2\u0080\u0094', '\u2014'],
  ['\u00e2\u0080\u0098', '\u2018'],
  ['\u00e2\u0080\u0099', '\u2019'],
  ['\u00e2\u0080\u009c', '\u201c'],
  ['\u00e2\u0080\u009d', '\u201d'],
  ['\u00e2\u0080\u00a6', '\u2026'],
  ['\u00e2\u0080\u00a2', '\u2022'],
  ['\u00c2\u00b7', '\u00b7'],
  ['\u00c2\u00a9', '\u00a9'],
];

// Mojibake patterns: the bytes of UTF-8 emojis interpreted as latin1 then stored as UTF-8
// These are the actual byte patterns we see in the files
const BYTE_PATTERNS = [
  // Box drawing
  [Buffer.from([0xc3, 0xa2, 0xc2, 0x80, 0xc2, 0x94]).toString('utf8'), '\u2500'], // ─
  [Buffer.from([0xc3, 0xa2, 0xc2, 0x80, 0xc2, 0x93]).toString('utf8'), '\u2013'], // –
];

function walkDir(dir, exts) {
  let results = [];
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (['node_modules', '.git', 'dist', '.next'].includes(entry.name)) continue;
        results = results.concat(walkDir(fullPath, exts));
      } else if (exts.some(e => entry.name.endsWith(e))) {
        results.push(fullPath);
      }
    }
  } catch (e) { /* skip unreadable dirs */ }
  return results;
}

const srcDir = path.join(__dirname, 'src');
const files = walkDir(srcDir, ['.tsx', '.ts', '.css']);
let totalFixed = 0;

// Simple string-based mojibake fixes
const simpleFixes = {
  '\u00c3\u00a2\u00e2\u201a\u00ac\u201c': '\u2500',
  '\u00e2\u0080\u0094': '\u2014',
  '\u00e2\u0080\u0093': '\u2013',
};

for (const file of files) {
  const buf = fs.readFileSync(file);
  let content = buf.toString('utf8');
  let changed = false;

  // Fix double-encoded emoji: look for \xC3\xB0 pattern (double-encoded \xF0)
  // The pattern is: f0 9f XX XX double-encoded as c3 b0 c2 9f c2 XX c2 XX
  const doubleEncodedRegex = /\u00c3\u00b0\u00c2\u009f[\u00c2\u00c3][\x80-\xbf][\u00c2\u00c3][\x80-\xbf]/g;
  
  // Specific known mojibake emoji patterns  
  const emojiMap = {
    '\u00f0\u009f\u0094\u0092': '\ud83d\udd12',  // lock  
    '\u00f0\u009f\u0094\u008d': '\ud83d\udd0d',  // magnifying glass
    '\u00f0\u009f\u0093\u008a': '\ud83d\udcca',  // bar chart
    '\u00f0\u009f\u009a\u00ab': '\ud83d\udeab',  // prohibited
    '\u00f0\u009f\u008f\u008a': '\ud83c\udfca',  // swimmer
    '\u00f0\u009f\u009a\u0080': '\ud83d\ude80',  // rocket
  };

  // Handle the garbled patterns we see: e.g. "ðŸ"Š" (which are UTF-8 bytes of the emoji, decoded as latin1, then re-encoded as UTF-8)
  // We'll use a simpler approach: just do literal string replacements of the garbled text  
  const textReplacements = [
    ['ðŸš€', '\ud83d\ude80'],
    ['ðŸ"'', '\ud83d\udd12'],
    ['ðŸ"Š', '\ud83d\udcca'],
    ['ðŸŠ', '\ud83c\udfca'],
    ['ðŸ"', '\ud83d\udd0d'],
    ['ðŸš«', '\ud83d\udeab'],
    ['ðŸ'', '\ud83d\udc4b'],
    ['ðŸ'¡', '\ud83d\udca1'],
    ['ðŸ"®', '\ud83d\udd2e'],
    ['ðŸ'°', '\ud83d\udcb0'],
    ['ðŸ"¥', '\ud83d\udd25'],
    ['ðŸ"ˆ', '\ud83d\udcc8'],
    ['ðŸ'Ž', '\ud83d\udc8e'],
    ['ðŸŽ‰', '\ud83c\udf89'],
    ['ðŸ''', '\ud83d\udc51'],
    ['ðŸ"±', '\ud83d\udcf1'],
    ['ðŸ†', '\ud83c\udfc6'],
    ['ðŸŽ¯', '\ud83c\udfaf'],
    ['ðŸ"—', '\ud83d\udd17'],
    ['ðŸ'³', '\ud83d\udcb3'],
    ['ðŸ'ª', '\ud83d\udcaa'],
    ['ðŸ"¬', '\ud83d\udd2c'],
    ['ðŸ'', '\ud83d\udc4d'],
    ['ðŸ"', '\ud83d\udcdd'],
    ['ðŸ"…', '\ud83d\udcc5'],
    ['ðŸ"£', '\ud83d\udce3'],
    ['ðŸ"¢', '\ud83d\udce2'],
    ['ðŸ"¦', '\ud83d\udce6'],
    ['ðŸ"', '\ud83d\udccd'],
    ['ðŸ"', '\ud83d\udd11'],
    ['ðŸ'¸', '\ud83d\udcb8'],
    ['ðŸ›¡', '\ud83d\udee1'],
    ['â†'', '\u2192'],
    ['â†', '\u2190'],  
    ['â†'', '\u2191'],
    ['â†"', '\u2193'],
    ['â"€', '\u2500'],
    ['â"‚', '\u2502'],
    ['â"Œ', '\u250c'],
    ['â"', '\u2510'],
    ['â""', '\u2514'],
    ['â"˜', '\u2518'],
    ['â"¬', '\u252c'],
    ['â"´', '\u2534'],
    ['â"¼', '\u253c'],
    ['âœ"', '\u2714'],
    ['âœ•', '\u2715'],
    ['âœ—', '\u2717'],
    ['âœ¨', '\u2728'],
    ['â­', '\u2b50'],
    ['â–²', '\u25b2'],
    ['â–¼', '\u25bc'],
    ['â—', '\u25cf'],
    ['â—‹', '\u25cb'],
    ['â€"', '\u2014'],
    ['â€"', '\u2013'],
    ['â€˜', '\u2018'],
    ['â€™', '\u2019'],
    ['â€œ', '\u201c'],
    ['â€¦', '\u2026'],
    ['â€¢', '\u2022'],
  ];

  for (const [bad, good] of textReplacements) {
    if (content.includes(bad)) {
      content = content.split(bad).join(good);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    totalFixed++;
    console.log('Fixed:', path.relative(__dirname, file));
  }
}

console.log('\nDone. Fixed ' + totalFixed + ' files.');
