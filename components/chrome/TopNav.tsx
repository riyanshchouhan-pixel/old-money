"use client";

import Link from "next/link";
import { Download, ListMusic, Music2 } from "lucide-react";
import { SITE } from "@/lib/site";
import { useInstallPrompt } from "@/lib/use-install-prompt";

const pill =
  "glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium text-cream/90 transition hover:bg-cream/12 hover:text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream/60";

export function TopNav() {
  const { canInstall, install } = useInstallPrompt();

  return (
    <nav className="fixed right-4 top-4 z-30 flex max-w-[calc(100vw-2rem)] flex-wrap justify-end gap-2 sm:right-7 sm:top-6">
      {SITE.spotifyUrl ? (
        <a
          className={pill}
          href={SITE.spotifyUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Open the playlist on Spotify"
        >
          <span className="h-4 w-4 rounded-full bg-[#1db954]" aria-hidden />
          Spotify
        </a>
      ) : null}

      {SITE.ytMusicUrl ? (
        <a
          className={pill}
          href={SITE.ytMusicUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Open the playlist on YouTube Music"
        >
          <span className="h-4 w-4 rounded-full bg-[#ff0000]" aria-hidden />
          YT Music
        </a>
      ) : null}

      <Link className={pill} href="/playlists">
        <ListMusic className="h-4 w-4" aria-hidden />
        Playlists
      </Link>

      <Link className={pill} href="/songs">
        <Music2 className="h-4 w-4" aria-hidden />
        Songs
      </Link>

      {canInstall ? (
        <button
          type="button"
          className={pill}
          onClick={() => void install()}
          aria-label={`Install the ${SITE.name} app`}
        >
          <Download className="h-4 w-4" aria-hidden />
          Install
        </button>
      ) : null}
    </nav>
  );
}
