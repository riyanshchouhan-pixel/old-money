# Old Money 🎙️

An ambient web radio for ghazals and old Hindi film songs — one scene, one player, playing round the clock.

Built as a re-take on [deluxesalon.in](https://deluxesalon.in), pointed at a different catalogue: Mehdi Hassan, Ghulam Ali, Jagjit Singh, Noor Jehan, Farida Khanum, and the black-and-white film songs that outlived their films.

---

## How it works

Audio is played by a hidden **YouTube IFrame player**. Nothing is hosted here, and no API key is needed — which keeps the whole thing a static Next.js app with zero backend and zero running cost.

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Audio | YouTube IFrame API (hidden 1×1 player) |
| Catalogue | Imported from a public Spotify playlist |
| Install | PWA — manifest + service worker |

## Running it

```bash
npm install && npm run dev
```

## The catalogue

Songs come from a public Spotify playlist, matched to YouTube videos. Two scripts do this, and neither needs credentials:

```bash
node scripts/import-spotify.mjs <playlist-url>
```

Reads the playlist off Spotify's embed payload, removes exact repeats, and buckets tracks into rotations by artist. Writes `data/rotations.ts` with empty `youtubeId` fields.

```bash
node scripts/resolve-ids.mjs --write
```

Searches YouTube for each track and confirms every candidate through the public oEmbed endpoint before accepting it, so no unverified video ID reaches the data file. Run without `--write` for a dry run. Rows it can't match confidently keep an empty `youtubeId` and are filtered out of every queue rather than failing at playback.

Rotation buckets are the `RULES` array at the top of `scripts/import-spotify.mjs` — edit the artist lists there and re-import.

## Swapping the backdrop

The scene is the one thing meant to be replaced. Drop artwork into `public/scene/` and point `lib/scene.ts` at it:

```ts
export const SCENE = {
  src: "/scene/baithak.jpg",
  alt: "…",
  focus: "center 45%",
};
```

Until `src` is set, a CSS-painted room stands in. The legibility washes in `components/scene/Scene.tsx` sit on top of whatever you supply, so text stays readable.

A prompt that suits this catalogue, for whichever image model you like:

> A dimly lit North Indian baithak after midnight — low teak seating, deep red velvet bolsters, a harmonium and tabla resting on a white sheet, brass lamp casting warm amber light, faint cigarette smoke, patterned rug, aged plaster wall. Wide cinematic composition, painterly, muted warm palette, 16:9, no people in the centre.

## Making it yours

Everything renameable lives in `lib/site.ts` — name, Devanagari title, tagline, contact email, and the Spotify / YT Music / WhatsApp links. The links are hidden until you fill them in.

## Credits

All rights stay with the labels, composers and performers. Playback is YouTube's embedded player; this site hosts no audio.
