// Builds src/content/tracks.generated.json from src/content/catalog.json.
//
// For every work listed in the catalog this pulls the tracklist and 30-second
// preview URLs from Apple's public lookup API, then decodes each preview with
// ffmpeg to compute the waveform peaks the player draws.
//
// Catalog entry options:
//   "appleCollectionId": 123        Apple Music album/single id (required)
//   "only": [1, 4, 7]               keep just these track numbers (optional)
//
// Usage: npm run sync-tracks

import { execFile } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const root = fileURLToPath(new URL('..', import.meta.url));
const catalogPath = `${root}src/content/catalog.json`;
const outPath = `${root}src/content/tracks.generated.json`;

const PEAK_COUNT = 140;
const SAMPLE_RATE = 8000;

const stripQuery = (url) => (url ? url.split('?uo=')[0].replace(/&uo=\d+$/, '') : undefined);

async function analyse(url) {
  const { stdout } = await exec(
    'ffmpeg',
    ['-v', 'error', '-i', url, '-ac', '1', '-ar', String(SAMPLE_RATE), '-f', 's16le', '-'],
    { encoding: 'buffer', maxBuffer: 128 * 1024 * 1024 },
  );
  const sampleCount = Math.floor(stdout.byteLength / 2);
  const bucketSize = Math.max(1, Math.floor(sampleCount / PEAK_COUNT));
  const rms = [];
  for (let bucket = 0; bucket < PEAK_COUNT; bucket++) {
    let sum = 0;
    const start = bucket * bucketSize;
    const end = Math.min(sampleCount, start + bucketSize);
    for (let i = start; i < end; i++) {
      const sample = stdout.readInt16LE(i * 2) / 32768;
      sum += sample * sample;
    }
    rms.push(Math.sqrt(sum / Math.max(1, end - start)));
  }
  const max = Math.max(...rms, 1e-6);
  return {
    previewSeconds: Math.round((sampleCount / SAMPLE_RATE) * 100) / 100,
    // Slight gamma so loud, heavily limited masters still show their shape.
    peaks: rms.map((value) => Math.round(Math.pow(value / max, 1.6) * 100) / 100),
  };
}

async function syncWork(id, entry) {
  const response = await fetch(
    `https://itunes.apple.com/lookup?id=${entry.appleCollectionId}&entity=song&limit=200`,
  );
  if (!response.ok) throw new Error(`${id}: lookup failed (${response.status})`);
  const { results } = await response.json();
  const collection = results.find((item) => item.wrapperType === 'collection');
  if (!collection) throw new Error(`${id}: no collection for id ${entry.appleCollectionId}`);

  const songs = results
    .filter((item) => item.wrapperType === 'track' && item.previewUrl)
    .filter((item) => !entry.only || entry.only.includes(item.trackNumber))
    .sort((a, b) => a.discNumber - b.discNumber || a.trackNumber - b.trackNumber);

  const tracks = [];
  for (const song of songs) {
    let analysis = { previewSeconds: 30, peaks: [] };
    try {
      analysis = await analyse(song.previewUrl);
    } catch (error) {
      console.warn(`  ! could not analyse "${song.trackName}": ${error.message.split('\n')[0]}`);
    }
    tracks.push({
      number: song.trackNumber,
      title: song.trackName,
      durationMs: song.trackTimeMillis,
      src: song.previewUrl,
      appleUrl: stripQuery(song.trackViewUrl),
      ...analysis,
    });
    console.log(`  ${String(song.trackNumber).padStart(2, '0')} ${song.trackName}`);
  }

  return {
    artist: collection.artistName,
    collection: collection.collectionName,
    releaseDate: collection.releaseDate.slice(0, 10),
    appleUrl: stripQuery(collection.collectionViewUrl),
    tracks,
  };
}

const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
const output = {};
for (const [id, entry] of Object.entries(catalog)) {
  console.log(`${id}`);
  output[id] = await syncWork(id, entry);
}
await writeFile(outPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(`\nWrote ${outPath.replace(root, '')}`);
