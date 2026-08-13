"use client";

import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { usePlayer } from "@/lib/player";
import { thumbnail } from "@/lib/format";
import type { Track } from "@/lib/types";

export function TrackRow({ track, position }: { track: Track; position: number }) {
  const { track: current, isPlaying, playTrack, toggle } = usePlayer();
  const active = current?.id === track.id;

  return (
    <button
      type="button"
      onClick={() => (active ? toggle() : playTrack(track.id))}
      aria-label={`${active && isPlaying ? "Pause" : "Play"} ${track.title}`}
      className={`group flex w-full items-center gap-3 rounded-2xl p-2 text-left transition hover:bg-cream/8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream/60 ${
        active ? "bg-cream/10" : ""
      }`}
    >
      <span className="w-6 shrink-0 text-center font-mono text-xs text-cream/35 group-hover:hidden">
        {position}
      </span>
      <span className="hidden w-6 shrink-0 justify-center text-cream group-hover:flex">
        {active && isPlaying ? (
          <Pause className="h-4 w-4" fill="currentColor" />
        ) : (
          <Play className="h-4 w-4" fill="currentColor" />
        )}
      </span>

      <Image
        src={thumbnail(track.youtubeId)}
        alt=""
        width={44}
        height={44}
        unoptimized
        className="h-11 w-11 shrink-0 rounded-xl object-cover"
      />

      <span className="min-w-0 flex-1">
        <span
          className={`block truncate text-sm font-medium ${active ? "text-cream" : "text-cream/90"}`}
        >
          {track.title}
        </span>
        <span className="block truncate text-xs text-cream-dim">
          {track.film ? `${track.film} · ${track.artist}` : track.artist}
        </span>
      </span>

      {track.year ? (
        <span className="shrink-0 font-mono text-xs text-cream/30">{track.year}</span>
      ) : null}
    </button>
  );
}
