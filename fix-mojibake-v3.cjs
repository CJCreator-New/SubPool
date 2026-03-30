// fix-mojibake-v3.cjs
// Fixes double-encoded UTF-8 mojibake in source files
const fs = require('fs');
const path = require('path');

function walkDir(dir, exts) {
  let results = [];
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fp = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (['node_modules', '.git', 'dist', '.next'].includes(entry.name)) continue;
        results = results.concat(walkDir(fp, exts));
      } else if (exts.some(e => entry.name.endsWith(e))) {
        results.push(fp);
      }
    }
  } catch (_) {}
  return results;
}

// Build replacement map from hex patterns
// Each entry: [garbled hex bytes, correct UTF-8 hex bytes]
const HEX_REPLACEMENTS = [
  // Emojis (double-encoded: original 4-byte UTF-8 emoji -> garbled multi-byte)
  // Pattern: F0 9F XX XX -> c3 b0 c2 9f c2 XX c2 XX (standard double-encode)
  //   or the Windows-1252 flavour which produces longer sequences

  // Box drawing ─ (U+2500): UTF-8 e2 94 80 -> garbled as c3 a2 c2 94 c2 80
  // But what we see is more complex multi-byte garble through Windows-1252

  // Strategy: read file as buffer, look for c3 b0 (double-encoded 0xF0),
  // try to decode the double-encoding, and replace with correct bytes.
];

const srcDir = path.join(__dirname, 'src');
const files = walkDir(srcDir, ['.tsx', '.ts', '.css']);
let totalFixed = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Fix known multi-byte garbled sequences by replacing the garbled
  // UTF-8 text with the correct Unicode characters.
  // We need to match the exact garbled string as it appears in the file.

  // The garbled text appears as valid (but wrong) UTF-8 characters.
  // For example, the emoji 📊 (F0 9F 93 8A) double-encoded through latin1:
  //   F0 -> C3 B0, 9F -> C2 9F, 93 -> C2 93, 8A -> C2 8A
  // But then Windows-1252 recoding can produce different results.

  // Let's just do character-by-character fixing using the actual garbled text from Node's perspective.
  // The garbled text "ðŸ"Š" is actually the raw bytes of the UTF-8 encoding of 📊
  // interpreted as latin1 characters. Let's detect and fix this pattern.

  // Detect double-encoded UTF-8: any occurrence of \u00F0\u009F means a double-encoded emoji
  // Actually in the file the bytes are c3 b0 ... which decode to U+00F0 in UTF-8

  // Approach: Find sequences starting with \u00F0\u009F (which is double-encoded F0 9F)
  // and try to recover the original emoji

  const doubleEncodedPattern = /[\u00c0-\u00c3][\u0080-\u00bf](?:[\u00c0-\u00c3][\u0080-\u00bf]){1,3}/g;

  // Simpler approach: look for \u00f0\u009f which means double-encoded emoji start
  // But these will have been triple-garbled in some cases through Windows-1252

  // Actually, let's use a completely different approach.
  // Read the file as a Buffer, search for the byte pattern c3 b0 (double-encoded F0),
  // and do byte-level replacement.

  const buf = fs.readFileSync(file);
  const newBuf = fixDoubleEncoding(buf);
  if (!buf.equals(newBuf)) {
    fs.writeFileSync(file, newBuf);
    changed = true;
    totalFixed++;
    console.log('Fixed:', path.relative(__dirname, file));
  }
}

function fixDoubleEncoding(buf) {
  // Strategy: Find c3 b0 c5 b8 which seems to be the garbled prefix pattern
  // Actually let's do it properly:
  // Convert buf to string, try to detect double-encoding, fix it

  let str = buf.toString('utf8');
  let result = '';
  let i = 0;
  let changed = false;

  while (i < str.length) {
    const code = str.charCodeAt(i);

    // Check for common mojibake patterns
    // Arrow → : garbled as â†' (c3 a2 c2 86 c2 92 -> e2 86 92)
    if (code === 0xe2) {
      // Could be the start of a 3-byte UTF-8 sequence that's actually correct
      // But if followed by certain patterns, it's garbled

      // Check: â (U+00E2) followed by garbled sequences
      // â†' = U+00E2 U+0086 U+2019 which in bytes is e2 followed by garbage
      // In the actual file: c3 a2 e2 80 93 c2 bc = â–¼

      // This is getting complex. Let's just do targeted string replacements.
      result += str[i];
      i++;
      continue;
    }

    // ð (U+00F0) - start of double-encoded 4-byte emoji
    if (code === 0xf0 && i + 3 < str.length) {
      const b1 = str.charCodeAt(i + 1);
      const b2 = str.charCodeAt(i + 2);
      const b3 = str.charCodeAt(i + 3);

      // If the next bytes look like double-encoded emoji bytes
      if (b1 === 0x9f && b2 < 0x100 && b3 < 0x100) {
        // This is a double-encoded emoji! The original bytes are F0 9F b2 b3
        const emojiBytes = Buffer.from([0xf0, 0x9f, b2, b3]);
        try {
          const emoji = emojiBytes.toString('utf8');
          if (emoji.length === 2) { // Valid emoji is 2 JS chars (surrogate pair)
            result += emoji;
            i += 4;
            changed = true;
            continue;
          }
        } catch (_) {}
      }
    }

    result += str[i];
    i++;
  }

  if (changed) {
    return Buffer.from(result, 'utf8');
  }
  return buf;
}

console.log('\nDone. Fixed ' + totalFixed + ' files.');
