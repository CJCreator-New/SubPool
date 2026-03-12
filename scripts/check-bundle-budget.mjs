import fs from 'node:fs';
import path from 'node:path';

const distAssetsDir = path.resolve('dist/assets');

if (!fs.existsSync(distAssetsDir)) {
  console.error('[bundle-budget] dist/assets not found. Run build first.');
  process.exit(1);
}

const files = fs.readdirSync(distAssetsDir).filter((file) => file.endsWith('.js'));
const sizes = files.map((file) => ({
  file,
  sizeKb: fs.statSync(path.join(distAssetsDir, file)).size / 1024,
  mtimeMs: fs.statSync(path.join(distAssetsDir, file)).mtimeMs,
}));

const entryCandidates = sizes.filter((item) => /^index-.*\.js$/.test(item.file));
const entryChunk = entryCandidates.sort((a, b) => b.mtimeMs - a.mtimeMs)[0];
const maxEntryKb = 760;
const maxRouteChunkKb = 420;

if (!entryChunk) {
  console.error('[bundle-budget] Could not find entry chunk (index-*.js).');
  process.exit(1);
}

const routeChunks = sizes.filter(
  (item) => item.file !== entryChunk.file && !/^index-.*\.js$/.test(item.file),
);
const offenders = [];

if (entryChunk.sizeKb > maxEntryKb) {
  offenders.push(
    `Entry chunk ${entryChunk.file} is ${entryChunk.sizeKb.toFixed(2)}kB (limit ${maxEntryKb}kB)`,
  );
}

for (const chunk of routeChunks) {
  if (chunk.sizeKb > maxRouteChunkKb) {
    offenders.push(
      `Route chunk ${chunk.file} is ${chunk.sizeKb.toFixed(2)}kB (limit ${maxRouteChunkKb}kB)`,
    );
  }
}

if (offenders.length > 0) {
  console.error('[bundle-budget] Budget check failed:');
  for (const offender of offenders) {
    console.error(` - ${offender}`);
  }
  process.exit(1);
}

console.log('[bundle-budget] All chunk sizes are within configured limits.');
