// fix-mojibake-final.cjs  
// Fixes double-encoded UTF-8 in all source files.
// The garbled text is produced when UTF-8 bytes are decoded as Latin-1/Windows-1252
// and then re-encoded as UTF-8. We reverse this by:
// 1. Reading the file as UTF-8 (getting the garbled string)
// 2. Converting to a Latin-1 buffer (reversing the second encoding layer)
// 3. Decoding that buffer as UTF-8 (recovering the original text)
// But we only apply this to individual sequences that look double-encoded.

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

// Try to fix a single character sequence that might be double-encoded
function tryFixSequence(str, startIdx) {
  // Look for characters in the range U+00C0..U+00FF which indicate double-encoded UTF-8
  // A double-encoded 3-byte sequence (like box drawing, arrows) looks like:
  //   3 chars: U+00C3 U+00A2 ... (was e2 -> c3 a2 in double encoding)
  // A double-encoded 4-byte sequence (like emojis) starts with:
  //   U+00C3 U+00B0 (was f0 -> c3 b0)

  const c = str.charCodeAt(startIdx);
  
  // Check if this looks like the start of a double-encoded sequence
  if (c < 0xc0 || c > 0xff) return null;
  
  // Try to extract enough characters and decode them
  let len = 0;
  // Determine expected original byte count from first byte
  if (c >= 0xc0 && c <= 0xdf) len = 2;  // 2-byte UTF-8
  else if (c >= 0xe0 && c <= 0xef) len = 3; // 3-byte UTF-8
  else if (c >= 0xf0 && c <= 0xf7) len = 4; // 4-byte UTF-8
  else return null;
  
  // Each original byte, when double-encoded, becomes 1 or 2 UTF-8 bytes
  // So we need to collect `len` bytes worth of data from the double-encoded string
  // Bytes 0x00-0x7F stay as 1 char, bytes 0x80-0xFF become 2 chars (c2/c3 + XX)
  
  let bytes = [];
  let pos = startIdx;
  
  for (let b = 0; b < len; b++) {
    if (pos >= str.length) return null;
    const ch = str.charCodeAt(pos);
    
    if (ch <= 0x7f) {
      // Single byte - but in validity UTF-8 continuation bytes are 0x80-0xBF, 
      // so if we need a continuation byte and get < 0x80, this isn't double-encoded
      if (b > 0) return null; // continuation bytes should be >= 0x80
      bytes.push(ch);
      pos++;
    } else if (ch <= 0xff) {
      // This is a Latin-1 char that represents one original byte
      bytes.push(ch);
      pos++;
    } else {
      return null; // Not a double-encoded sequence
    }
  }
  
  // Try to decode the collected bytes as UTF-8
  try {
    const buf = Buffer.from(bytes);
    const decoded = buf.toString('utf8');
    
    // Validate: the decoded result should be a single character (or surrogate pair for emoji)
    if (decoded.length >= 1 && decoded.length <= 2 && decoded !== str.substring(startIdx, pos)) {
      // Check the decoded char is a "reasonable" Unicode char (not a control char, not ASCII)
      const cp = decoded.codePointAt(0);
      if (cp > 0x7f && cp !== 0xfffd) { // Not ASCII and not replacement char
        return { original: str.substring(startIdx, pos), replacement: decoded, endIdx: pos };
      }
    }
  } catch (_) {}
  
  return null;
}

const srcDir = path.join(__dirname, 'src');
const files = walkDir(srcDir, ['.tsx', '.ts', '.css']);
let totalFixed = 0;
let totalReplacements = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = '';
  let i = 0;
  let fileChanged = false;
  
  while (i < content.length) {
    const code = content.charCodeAt(i);
    
    // Check if this could be start of double-encoded sequence
    if (code >= 0xc0 && code <= 0xf7) {
      const fix = tryFixSequence(content, i);
      if (fix) {
        newContent += fix.replacement;
        i = fix.endIdx;
        fileChanged = true;
        totalReplacements++;
        continue;
      }
    }
    
    newContent += content[i];
    i++;
  }
  
  if (fileChanged) {
    fs.writeFileSync(file, newContent, 'utf8');
    totalFixed++;
    console.log('Fixed:', path.relative(__dirname, file), '(' + totalReplacements + ' replacements so far)');
  }
}

console.log('\nDone. Fixed ' + totalFixed + ' files with ' + totalReplacements + ' total replacements.');
