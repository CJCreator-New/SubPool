// fix-mojibake-win1252.cjs
// Fixes UTF-8 text that was corrupted by being decoded as Windows-1252 then re-encoded as UTF-8.
// This is the exact corruption path: UTF-8 bytes -> interpret as Win-1252 chars -> encode those chars as UTF-8.
// We reverse: read the garbled UTF-8 string, map each char back to its Win-1252 byte value, 
// then decode those bytes as UTF-8.

const fs = require('fs');
const path = require('path');

// Windows-1252 to Unicode mapping for bytes 0x80-0x9F
// (these differ from Latin-1 / ISO-8859-1)
const WIN1252_MAP = {
  0x80: 0x20AC, 0x81: 0x81,   0x82: 0x201A, 0x83: 0x0192,
  0x84: 0x201E, 0x85: 0x2026, 0x86: 0x2020, 0x87: 0x2021,
  0x88: 0x02C6, 0x89: 0x2030, 0x8A: 0x0160, 0x8B: 0x2039,
  0x8C: 0x0152, 0x8D: 0x8D,   0x8E: 0x017D, 0x8F: 0x8F,
  0x90: 0x90,   0x91: 0x2018, 0x92: 0x2019, 0x93: 0x201C,
  0x94: 0x201D, 0x95: 0x2022, 0x96: 0x2013, 0x97: 0x2014,
  0x98: 0x02DC, 0x99: 0x2122, 0x9A: 0x0161, 0x9B: 0x203A,
  0x9C: 0x0153, 0x9D: 0x9D,   0x9E: 0x017E, 0x9F: 0x0178,
};

// Build reverse map: Unicode codepoint -> Win-1252 byte
const UNICODE_TO_WIN1252 = {};
for (const [byte, unicode] of Object.entries(WIN1252_MAP)) {
  UNICODE_TO_WIN1252[unicode] = Number(byte);
}
// Also add straight-through mappings for 0x00-0x7F and 0xA0-0xFF
for (let i = 0; i < 0x80; i++) UNICODE_TO_WIN1252[i] = i;
for (let i = 0xA0; i <= 0xFF; i++) UNICODE_TO_WIN1252[i] = i;

function charToWin1252Byte(ch) {
  const cp = ch.codePointAt(0);
  if (cp in UNICODE_TO_WIN1252) return UNICODE_TO_WIN1252[cp];
  if (UNICODE_TO_WIN1252[cp] !== undefined) return UNICODE_TO_WIN1252[cp];
  return -1; // Not a Win-1252 character
}

function tryDecodeGarbledSequence(str, startIdx) {
  // Try to interpret a sequence of characters as Win-1252 bytes and decode as UTF-8
  // We need to figure out how many chars to consume.
  
  // First char should map to a UTF-8 lead byte (0xC0-0xF7)
  const firstByte = charToWin1252Byte(str[startIdx]);
  if (firstByte < 0) return null;
  
  let expectedBytes;
  if (firstByte >= 0xF0 && firstByte <= 0xF7) expectedBytes = 4;
  else if (firstByte >= 0xE0 && firstByte <= 0xEF) expectedBytes = 3;
  else if (firstByte >= 0xC0 && firstByte <= 0xDF) expectedBytes = 2;
  else return null;
  
  // Now collect `expectedBytes` worth of Win-1252 byte values
  let bytes = [firstByte];
  let pos = startIdx + 1;
  
  for (let b = 1; b < expectedBytes; b++) {
    if (pos >= str.length) return null;
    const byteVal = charToWin1252Byte(str[pos]);
    if (byteVal < 0) return null;
    // Continuation bytes should be 0x80-0xBF
    if (byteVal < 0x80 || byteVal > 0xBF) return null;
    bytes.push(byteVal);
    pos++;
  }
  
  // Try to decode these bytes as UTF-8
  try {
    const buf = Buffer.from(bytes);
    const decoded = buf.toString('utf8');
    
    // Validate the result
    if (decoded.length === 0 || decoded.includes('\uFFFD')) return null;
    
    const cp = decoded.codePointAt(0);
    // Should be a non-ASCII character
    if (cp <= 0x7F) return null;
    // Should not be the same as what we started with
    if (decoded === str.substring(startIdx, pos)) return null;
    
    // The decoded character should be "higher" than any of the input characters
    // (since we're decoding from multi-byte to single codepoint)
    return {
      consumed: pos - startIdx,
      replacement: decoded,
    };
  } catch (_) {
    return null;
  }
}

function fixFile(content) {
  let result = '';
  let i = 0;
  let changed = false;
  
  while (i < content.length) {
    const cp = content.codePointAt(i);
    const byteVal = charToWin1252Byte(content[i]);
    
    // Check if this character could be the start of a garbled sequence
    // It needs to map to a UTF-8 lead byte (0xC0-0xF7)
    if (byteVal >= 0xC0 && byteVal <= 0xF7) {
      const fix = tryDecodeGarbledSequence(content, i);
      if (fix) {
        result += fix.replacement;
        i += fix.consumed;
        changed = true;
        continue;
      }
    }
    
    // Handle surrogate pairs
    if (cp > 0xFFFF) {
      result += content[i] + content[i + 1];
      i += 2;
    } else {
      result += content[i];
      i++;
    }
  }
  
  return changed ? result : null;
}

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

// First, undo the damage from the previous (incorrect) fix script
// That script may have partially decoded some sequences

const srcDir = path.join(__dirname, 'src');
const files = walkDir(srcDir, ['.tsx', '.ts', '.css']);
let totalFixed = 0;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const fixed = fixFile(content);
  if (fixed !== null) {
    fs.writeFileSync(file, fixed, 'utf8');
    totalFixed++;
    console.log('Fixed:', path.relative(__dirname, file));
  }
}

console.log('\nDone. Fixed ' + totalFixed + ' files.');
