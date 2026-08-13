"use client";

import { Play } from "lucide-react";
import { usePlayer } from "@/lib/player";
import { playableTracks } from "@/data/rotations";
import type { Rotation } from "@/lib/types";

export function RotationCard({ rotation }: { rotation: Rotation }) {
  const { rotationSlug, isPlaying, playRotation } = usePlayer();
  const tracks = playableTracks(rotation.trackIds);
  const live = rotationSlug === rotation.slug && isPlaying;

  return (
    <article className="glass rounded-3xl p-5">
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          {rotation.hindi ? (
            <p className="font-display text-xl font-bold text-cream/85">
              {rotation.hindi}
            </p>
          ) : null}
          <h2 className="text-lg font-semibold text-cream">{rotation.name}</h2>
          <p className="mt-1 text-sm text-cream-dim">{rotation.tagline}</p>
          <p className="mt-2 font-mono text-[11px] tracking-wide text-cream/35">
            {tracks.length} SONGS
            {live ? " · NOW PLAYING" : ""}
          </p>
        </div>

        <button
          type="button"
          onClick={() => playRotation(rotation.slug)}
          aria-label={`Play ${rotation.name}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cream text-ink transition hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
        >
          <Play className="ml-0.5 h-5 w-5" fill="currentColor" />
        </button>
      </div>

      <ol className="mt-4 space-y-0.5 border-t border-cream/10 pt-3">
        {tracks.slice(0, 4).map((track) => (
          <li
            key={track.id}
            className="flex items-baseline gap-2 truncate text-[13px] text-cream/60"
          >
            <span className="truncate">{track.title}</span>
            {track.film ? (
              <span className="truncate text-cream/30">· {track.film}</span>
            ) : null}
          </li>
        ))}
        {tracks.length > 4 ? (
          <li className="pt-1 text-[13px] text-cream/30">
            + {tracks.length - 4} more
          </li>
        ) : null}
      </ol>
    </article>
  );
}
