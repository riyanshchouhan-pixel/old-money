// Rebuilds data/rotations.ts from a public Spotify playlist.
// Reads the embed page's __NEXT_DATA__ payload — no Spotify API key needed.
//   node scripts/import-spotify.mjs <playlist-url-or-id>
// youtubeId is left empty; run scripts/resolve-ids.mjs --write afterwards.

import { writeFile } from "node:fs/promises";

const DATA = new URL("../data/rotations.ts", import.meta.url);
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36";

const input = process.argv[2];
if (!input) {
  console.error("usage: node scripts/import-spotify.mjs <playlist-url-or-id>");
  process.exit(1);
}
const playlistId = input.match(/playlist\/([A-Za-z0-9]+)/)?.[1] ?? input;

// Which rotation a track lands in, decided by the artists on it.
// First matching rule wins; anything unmatched falls through to the last.
const RULES = [
  {
    slug: "sarhad-paar",
    name: "Sarhad Paar",
    hindi: "सरहद पार",
    tagline: "Lahore and Karachi, on a good radio, late.",
    artists: [
      "mehdi hassan", "noor jehan", "ghulam ali", "nayyara noor", "kaavish",
      "shahnaz begum", "naseem begum", "saleem raza", "shameem azad",
      "zeeshan ali", "schumaila", "farida khanum",
    ],
  },
  {
    slug: "ranjish",
    name: "Ranjish",
    hindi: "रंजिश",
    tagline: "Ghazals for the hour when the ice has melted.",
    artists: [
      "jagjit singh", "chitra singh", "talat aziz", "talat mahmood",
      "pankaj udhas", "chandan dass", "bhupinder singh", "shujaat khan",
    ],
  },
  {
    slug: "naya-andaaz",
    name: "Naya Andaaz",
    hindi: "नया अंदाज़",
    tagline: "The old poetry, sung by people born much later.",
    artists: [
      "ali sethi", "kavita seth", "rekha bhardwaj", "anurag saikia",
      "niladri kumar",
    ],
  },
  {
    slug: "purani-filmein",
    name: "Purani Filmein",
    hindi: "पुरानी फ़िल्में",
    tagline: "Black-and-white songs that outlived their films.",
    artists: [],
  },
];

const slugify = (s) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

/** Pulls `- From "Film"` / `(From "Film")` out of a Spotify track title. */
function splitTitle(raw) {
  const film = raw.match(/[-(]\s*From\s+"([^"]+)"/i)?.[1];
  let title = raw
    .replace(/[-(]\s*From\s+"[^"]+"\)?/i, "")
    .replace(/\s*-\s*(Live|Studio Version|Original|Solo By .*|Male Version|Ghazal Version|Ahista Ahista \/ Soundtrack Version)\s*$/i, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s*-\s*$/, "")
    .trim();
  if (!title) title = raw.trim();
  return { title, film };
}

const res = await fetch(
  `https://open.spotify.com/embed/playlist/${playlistId}`,
  { headers: { "user-agent": UA } },
);
if (!res.ok) {
  console.error(`Spotify returned ${res.status}`);
  process.exit(1);
}

const html = await res.text();
const raw = html.match(
  /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
)?.[1];
if (!raw) {
  console.error("Could not find playlist data in the embed page.");
  process.exit(1);
}

const entity = JSON.parse(raw).props?.pageProps?.state?.data?.entity;
if (!entity?.trackList?.length) {
  console.error("Playlist has no readable tracks (is it public?).");
  process.exit(1);
}

console.log(`Playlist: ${entity.name} — ${entity.trackList.length} tracks`);

const seen = new Set();
const tracks = [];
for (const item of entity.trackList) {
  const artist = (item.subtitle ?? "").trim();
  const { title, film } = splitTitle(item.title ?? "");
  if (!title || !artist) continue;

  // Different renditions of one ghazal are worth keeping; exact repeats are not.
  const key = `${slugify(title)}|${slugify(artist.split(",")[0])}`;
  if (seen.has(key)) continue;
  seen.add(key);

  let id = slugify(`${title}-${artist.split(",")[0]}`);
  while (tracks.some((t) => t.id === id)) id += "-x";

  tracks.push({ id, title, artist, film });
}

console.log(`Kept ${tracks.length} after removing exact repeats.`);

const bucket = (track) => {
  const artists = track.artist.toLowerCase();
  for (const rule of RULES) {
    if (rule.artists.some((a) => artists.includes(a))) return rule.slug;
  }
  return RULES[RULES.length - 1].slug;
};

const grouped = new Map(RULES.map((r) => [r.slug, []]));
for (const track of tracks) grouped.get(bucket(track)).push(track.id);

for (const rule of RULES) {
  console.log(`  ${rule.name.padEnd(16)} ${grouped.get(rule.slug).length}`);
}

const q = (s) => JSON.stringify(s);
const trackLines = tracks
  .map(
    (t) =>
      `  { id: ${q(t.id)}, title: ${q(t.title)}, artist: ${q(t.artist)}` +
      (t.film ? `, film: ${q(t.film)}` : "") +
      `, youtubeId: "" },`,
  )
  .join("\n");

const rotationBlocks = RULES.map((rule) => {
  const ids = grouped.get(rule.slug);
  return `  {
    slug: ${q(rule.slug)},
    name: ${q(rule.name)},
    hindi: ${q(rule.hindi)},
    tagline: ${q(rule.tagline)},
    trackIds: [
${ids.map((id) => `      ${q(id)},`).join("\n")}
    ],
  },`;
}).join("\n");

const file = `import type { Rotation, Track } from "@/lib/types";

// Generated by scripts/import-spotify.mjs from the "${entity.name}" playlist.
// youtubeId values are resolved and verified by scripts/resolve-ids.mjs;
// an empty id means the track is not playable yet and is filtered out of queues.
export const TRACKS: Track[] = [
${trackLines}
];

export const ROTATIONS: Rotation[] = [
${rotationBlocks}
];

const BY_ID = new Map(TRACKS.map((t) => [t.id, t]));

export function getTrack(id: string): Track | undefined {
  return BY_ID.get(id);
}

export function playableTracks(ids: string[]): Track[] {
  return ids
    .map((id) => BY_ID.get(id))
    .filter((t): t is Track => Boolean(t?.youtubeId));
}

export function getRotation(slug: string): Rotation | undefined {
  return ROTATIONS.find((r) => r.slug === slug);
}

export const ALL_PLAYABLE = TRACKS.filter((t) => t.youtubeId);
`;

await writeFile(DATA, file);
console.log("data/rotations.ts written.");
