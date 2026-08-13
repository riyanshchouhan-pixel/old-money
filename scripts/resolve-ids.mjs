// Resolves empty youtubeId fields in data/rotations.ts.
// Searches YouTube, then confirms each candidate through the public oEmbed
// endpoint so nothing lands in the data file unverified.
//   node scripts/resolve-ids.mjs           # report only
//   node scripts/resolve-ids.mjs --write   # patch data/rotations.ts

import { readFile, writeFile } from "node:fs/promises";

const DATA = new URL("../data/rotations.ts", import.meta.url);
const WRITE = process.argv.includes("--write");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// YouTube throttles bursts of search requests, so every fetch backs off and retries.
async function fetchWithRetry(url, attempts = 4) {
  let wait = 1500;
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(url, {
        headers: { "user-agent": UA, "accept-language": "en-US,en;q=0.9" },
      });
      if (res.ok) return res;
      if (res.status !== 429 && res.status < 500) return null;
    } catch {
      // network hiccup — fall through to the backoff below
    }
    await sleep(wait);
    wait *= 2;
  }
  return null;
}

const norm = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const STOP = new Set(["the", "to", "hai", "ke", "ka", "ki", "se", "na", "ko", "hi", "te"]);

async function searchIds(query) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  const res = await fetchWithRetry(url);
  if (!res) return [];
  const html = await res.text();
  const ids = [];
  for (const m of html.matchAll(/"videoId":"([\w-]{11})"/g)) {
    if (!ids.includes(m[1])) ids.push(m[1]);
    if (ids.length >= 8) break;
  }
  return ids;
}

async function oembed(id) {
  const res = await fetchWithRetry(
    `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`,
  );
  if (!res) return null;
  return res.json().catch(() => null);
}

// This catalogue is full of the same ghazal in five different voices, so the
// performer matters as much as the title. Both are scored.
function scoreMatch(track, meta) {
  const haystack = norm(`${meta.title} ${meta.author_name ?? ""}`);

  const titleWords = norm(track.title)
    .split(" ")
    .filter((w) => w.length > 2 && !STOP.has(w));
  if (!titleWords.length) return 0;
  const titleHit =
    titleWords.filter((w) => haystack.includes(w)).length / titleWords.length;

  // Only the lead performer — the trailing composer/lyricist credits are noise.
  const artistWords = norm(track.artist.split(",")[0])
    .split(" ")
    .filter((w) => w.length > 3);
  const artistHit = artistWords.length
    ? artistWords.filter((w) => haystack.includes(w)).length / artistWords.length
    : 0.5;

  const filmBonus =
    track.film && haystack.includes(norm(track.film).split(" ")[0]) ? 0.1 : 0;
  const shortsPenalty = /shorts|whatsapp status|ringtone/.test(haystack) ? 0.25 : 0;

  return 0.58 * titleHit + 0.42 * artistHit + filmBonus - shortsPenalty;
}

async function resolve(track, taken) {
  const lead = track.artist.split(",")[0];
  const queries = [
    `${track.title} ${lead}`,
    `${track.title} ${lead} ${track.film ?? ""} full song`,
    `${track.title} ${track.film ?? ""} full song`,
  ];
  let best = null;
  for (const q of queries) {
    for (const id of await searchIds(q)) {
      // Two entries must never land on the same video — different renditions
      // of one ghazal are the whole point of this playlist.
      if (taken.has(id)) continue;
      const meta = await oembed(id);
      if (!meta) continue;
      const score = scoreMatch(track, meta);
      if (!best || score > best.score) best = { id, meta, score };
      if (score >= 0.85) return best;
    }
    if (best && best.score >= 0.7) return best;
  }
  return best;
}

const source = await readFile(DATA, "utf8");
const pending = [
  ...source.matchAll(
    /\{ id: "([^"]+)", title: "([^"]+)", artist: "([^"]+)"(?:, film: "([^"]+)")?(?:, year: (\d+))?, youtubeId: "" \}/g,
  ),
].map((m) => ({ id: m[1], title: m[2], artist: m[3], film: m[4], year: m[5] }));

if (!pending.length) {
  console.log("Nothing to resolve — every track already has an id.");
  process.exit(0);
}

// Video ids already committed to the file are off the table for new matches.
const taken = new Set(
  [...source.matchAll(/youtubeId: "([\w-]{11})"/g)].map((m) => m[1]),
);

console.log(`Resolving ${pending.length} tracks…\n`);
let patched = source;
let ok = 0;

for (const [i, track] of pending.entries()) {
  if (i) await sleep(2000);
  let result = null;
  try {
    result = await resolve(track, taken);
  } catch (err) {
    console.log(`  ✗ ${track.title} — ${err.message}`);
    continue;
  }

  if (!result || result.score < 0.6) {
    console.log(`  ✗ ${track.title} — ${track.artist} — no confident match${result ? ` (best ${result.score.toFixed(2)}: ${result.meta.title})` : ""}`);
    continue;
  }

  ok += 1;
  taken.add(result.id);
  const flag = result.score >= 0.85 ? "✓" : "~";
  console.log(`  ${flag} ${track.title} — ${track.artist} → ${result.id}  [${result.meta.title}]`);
  patched = patched.replace(
    new RegExp(`(\\{ id: "${track.id}",[^}]*youtubeId: )""`),
    `$1"${result.id}"`,
  );
}

console.log(`\n${ok}/${pending.length} resolved.`);

if (WRITE && ok) {
  await writeFile(DATA, patched);
  console.log("data/rotations.ts updated.");
} else if (!WRITE) {
  console.log("Dry run — pass --write to patch the data file.");
}
