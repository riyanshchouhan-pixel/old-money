"use client";

import Image from "next/image";
import {
  CloudRain,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import { usePlayer } from "@/lib/player";
import { useRain } from "@/lib/use-rain";
import { formatTime, thumbnail } from "@/lib/format";
import { RainOverlay } from "@/components/scene/RainOverlay";

export function PlayerBar() {
  const {
    track,
    isPlaying,
    isBuffering,
    position,
    duration,
    volume,
    muted,
    awaitingGesture,
    toggle,
    next,
    prev,
    seek,
    setVolume,
    toggleMute,
  } = usePlayer();
  const { raining, toggleRain } = useRain();

  if (!track) return null;

  const progress = duration ? (position / duration) * 100 : 0;
  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  return (
    <>
    <RainOverlay active={raining} />
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-4 sm:pb-6">
      <div className="glass-strong pointer-events-auto animate-rise relative flex w-full max-w-2xl items-center gap-3 rounded-3xl p-3 shadow-[0_24px_70px_rgba(0,0,0,0.55)] sm:gap-4 sm:rounded-[32px] sm:p-4">
        <Image
          src={thumbnail(track.youtubeId)}
          alt=""
          width={56}
          height={56}
          unoptimized
          className="h-12 w-12 shrink-0 rounded-2xl object-cover shadow-lg sm:h-14 sm:w-14"
        />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-cream sm:text-[15px]">
            {track.title}
          </p>
          <p className="truncate text-xs text-cream-dim sm:text-[13px]">
            {track.film ? `${track.film} · ${track.artist}` : track.artist}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={1}
              value={Math.min(position, duration || 0)}
              onChange={(e) => seek(Number(e.target.value))}
              style={{ "--fill": `${progress}%` } as React.CSSProperties}
              className="h-1 w-full"
              aria-label="Seek"
              disabled={!duration}
            />
            <span className="hidden shrink-0 font-mono text-[11px] tabular-nums text-cream/55 sm:block">
              {formatTime(position)} / {formatTime(duration)}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <IconButton onClick={prev} label="Previous track">
            <SkipBack className="h-5 w-5" fill="currentColor" />
          </IconButton>

          <button
            type="button"
            onClick={toggle}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-cream text-ink shadow-[0_6px_20px_rgba(0,0,0,0.4)] transition hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream sm:h-12 sm:w-12"
          >
            {isBuffering && !isPlaying ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/25 border-t-ink" />
            ) : isPlaying ? (
              <Pause className="h-5 w-5" fill="currentColor" />
            ) : (
              <Play className="ml-0.5 h-5 w-5" fill="currentColor" />
            )}
          </button>

          <IconButton onClick={next} label="Next track">
            <SkipForward className="h-5 w-5" fill="currentColor" />
          </IconButton>
        </div>

        <button
          type="button"
          onClick={toggleRain}
          aria-label={raining ? "Stop the rain" : "Add rain over the song"}
          aria-pressed={raining}
          title={raining ? "Stop the rain" : "Let it rain"}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream/60 ${
            raining
              ? "bg-cream/18 text-cream shadow-[0_0_16px_rgba(239,230,212,0.25)]"
              : "text-cream/60 hover:bg-cream/12 hover:text-cream"
          }`}
        >
          <CloudRain className="h-5 w-5" />
        </button>

        <div className="hidden shrink-0 items-center gap-2 pl-1 sm:flex">
          <IconButton onClick={toggleMute} label={muted ? "Unmute" : "Mute"}>
            <VolumeIcon className="h-5 w-5" />
          </IconButton>
          <input
            type="range"
            min={0}
            max={100}
            value={muted ? 0 : volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            style={{ "--fill": `${muted ? 0 : volume}%` } as React.CSSProperties}
            className="h-1 w-20"
            aria-label="Volume"
          />
        </div>

        {awaitingGesture ? (
          <span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink/70 px-3 py-1 text-[11px] tracking-wide text-cream/70 backdrop-blur">
            tap anywhere to start
          </span>
        ) : null}
      </div>
    </div>
    </>
  );
}

function IconButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full text-cream/80 transition hover:bg-cream/12 hover:text-cream active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream/60"
    >
      {children}
    </button>
  );
}
