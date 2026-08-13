"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ALL_PLAYABLE, ROTATIONS, playableTracks } from "@/data/rotations";
import type { Track } from "@/lib/types";
import { YT_STATE, loadYouTubeApi, type YTPlayer } from "@/lib/yt";

type PlayerValue = {
  ready: boolean;
  track: Track | null;
  queue: Track[];
  index: number;
  rotationSlug: string;
  isPlaying: boolean;
  isBuffering: boolean;
  position: number;
  duration: number;
  volume: number;
  muted: boolean;
  /** True until the browser has let us start audio — the first tap clears it. */
  awaitingGesture: boolean;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
  playRotation: (slug: string) => void;
  playTrack: (trackId: string) => void;
};

const PlayerContext = createContext<PlayerValue | null>(null);

const DEFAULT_ROTATION = ROTATIONS[0];

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);

  const [queue, setQueue] = useState<Track[]>(() =>
    playableTracks(DEFAULT_ROTATION.trackIds),
  );
  const [index, setIndex] = useState(0);
  const [rotationSlug, setRotationSlug] = useState(DEFAULT_ROTATION.slug);
  const [ready, setReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(75);
  const [muted, setMuted] = useState(false);
  const [awaitingGesture, setAwaitingGesture] = useState(true);

  const track = queue[index] ?? null;

  // Event handlers below run inside the YouTube iframe callbacks, which capture
  // their closure once — refs keep them reading current values.
  const queueRef = useRef(queue);
  const indexRef = useRef(index);
  queueRef.current = queue;
  indexRef.current = index;

  const advance = useCallback((delta: number) => {
    const size = queueRef.current.length;
    if (!size) return;
    setIndex((i) => (i + delta + size) % size);
  }, []);

  const next = useCallback(() => advance(1), [advance]);
  const prev = useCallback(() => {
    // Match the usual convention: restart the track unless we're near the top.
    const player = playerRef.current;
    if (player && player.getCurrentTime() > 3) {
      player.seekTo(0, true);
      setPosition(0);
      return;
    }
    advance(-1);
  }, [advance]);

  const nextRef = useRef(next);
  nextRef.current = next;

  useEffect(() => {
    let cancelled = false;
    let mount: HTMLDivElement | null = null;

    loadYouTubeApi().then((YT) => {
      if (cancelled || !hostRef.current) return;

      // YouTube replaces this node with its iframe, so it is created outside
      // React's tree to keep reconciliation away from it.
      mount = document.createElement("div");
      hostRef.current.appendChild(mount);

      const first = queueRef.current[0];
      playerRef.current = new YT.Player(mount, {
        videoId: first?.youtubeId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: { target: YTPlayer }) => {
            if (cancelled) return;
            event.target.setVolume(75);
            setReady(true);
            setDuration(event.target.getDuration() || 0);
          },
          onStateChange: (event: { data: number }) => {
            if (cancelled) return;
            setIsBuffering(event.data === YT_STATE.BUFFERING);
            if (event.data === YT_STATE.PLAYING) {
              setIsPlaying(true);
              setAwaitingGesture(false);
              setDuration(playerRef.current?.getDuration() || 0);
            } else if (event.data === YT_STATE.PAUSED) {
              setIsPlaying(false);
            } else if (event.data === YT_STATE.ENDED) {
              setIsPlaying(false);
              nextRef.current();
            }
          },
          onError: () => {
            if (cancelled) return;
            // Region blocks and disabled embeds are common; skip rather than stall.
            nextRef.current();
          },
        },
      });
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
      mount?.remove();
    };
  }, []);

  // Load whichever track the queue is pointing at.
  const loadedRef = useRef<string | null>(null);
  useEffect(() => {
    const player = playerRef.current;
    if (!ready || !player || !track) return;
    if (loadedRef.current === track.youtubeId) return;

    loadedRef.current = track.youtubeId;
    setPosition(0);
    setDuration(0);
    if (isPlaying || !awaitingGesture) {
      player.loadVideoById(track.youtubeId);
    } else {
      player.cueVideoById(track.youtubeId);
    }
  }, [ready, track, isPlaying, awaitingGesture]);

  // Progress ticker.
  useEffect(() => {
    if (!isPlaying) return;
    const id = window.setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      setPosition(player.getCurrentTime() || 0);
      const total = player.getDuration() || 0;
      if (total) setDuration(total);
    }, 250);
    return () => window.clearInterval(id);
  }, [isPlaying]);

  const toggle = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (player.getPlayerState() === YT_STATE.PLAYING) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  }, []);

  const seek = useCallback((seconds: number) => {
    playerRef.current?.seekTo(seconds, true);
    setPosition(seconds);
  }, []);

  const setVolume = useCallback((value: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(value)));
    setVolumeState(clamped);
    const player = playerRef.current;
    if (!player) return;
    player.setVolume(clamped);
    if (clamped > 0 && player.isMuted()) {
      player.unMute();
      setMuted(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (player.isMuted()) {
      player.unMute();
      setMuted(false);
    } else {
      player.mute();
      setMuted(true);
    }
  }, []);

  // Loading inside the click handler keeps the browser's user-gesture grant,
  // so the very first cut is allowed to autoplay. The queue effect only
  // observes loadedRef afterwards and does nothing more.
  const cutTo = useCallback((videoId: string) => {
    const player = playerRef.current;
    if (!player) return;
    loadedRef.current = videoId;
    setPosition(0);
    setDuration(0);
    player.loadVideoById(videoId);
  }, []);

  const playRotation = useCallback(
    (slug: string) => {
      const rotation = ROTATIONS.find((r) => r.slug === slug);
      const tracks = rotation
        ? playableTracks(rotation.trackIds)
        : ALL_PLAYABLE;
      if (!tracks.length) return;

      setRotationSlug(slug);
      setQueue(tracks);
      setIndex(0);
      setAwaitingGesture(false);
      cutTo(tracks[0].youtubeId);
    },
    [cutTo],
  );

  const playTrack = useCallback(
    (trackId: string) => {
      let target: Track | undefined;
      const position = queueRef.current.findIndex((t) => t.id === trackId);
      if (position >= 0) {
        target = queueRef.current[position];
        setIndex(position);
      } else {
        const found = ALL_PLAYABLE.findIndex((t) => t.id === trackId);
        if (found < 0) return;
        target = ALL_PLAYABLE[found];
        setQueue(ALL_PLAYABLE);
        setIndex(found);
        setRotationSlug("all");
      }
      setAwaitingGesture(false);
      cutTo(target.youtubeId);
    },
    [cutTo],
  );

  // Autoplay is blocked until the visitor interacts, so the first tap anywhere
  // on the page starts the radio — the way walking past a shop would.
  useEffect(() => {
    if (!ready || !awaitingGesture) return;
    const start = () => playerRef.current?.playVideo();
    document.addEventListener("pointerdown", start, { once: true });
    document.addEventListener("keydown", start, { once: true });
    return () => {
      document.removeEventListener("pointerdown", start);
      document.removeEventListener("keydown", start);
    };
  }, [ready, awaitingGesture]);

  const value = useMemo<PlayerValue>(
    () => ({
      ready,
      track,
      queue,
      index,
      rotationSlug,
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
      playRotation,
      playTrack,
    }),
    [
      ready,
      track,
      queue,
      index,
      rotationSlug,
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
      playRotation,
      playTrack,
    ],
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <div
        ref={hostRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 h-px w-px overflow-hidden opacity-0"
      />
    </PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
}
