"use client";

import { useState } from "react";
import { Download, MessageCircle, X } from "lucide-react";
import { SITE } from "@/lib/site";
import { useInstallPrompt } from "@/lib/use-install-prompt";

export function Banners() {
  const { canInstall, install } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-2">
      {SITE.whatsappUrl ? (
        <a
          href={SITE.whatsappUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`Join ${SITE.name} on WhatsApp`}
          className="glass-strong animate-rise group flex items-center gap-3 rounded-2xl p-3 transition hover:bg-ink/85"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#25d366]">
            <MessageCircle className="h-5 w-5 text-white" aria-hidden />
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className="block truncate text-sm font-semibold text-cream">
              Get new songs before everyone else 🔥
            </span>
            <span className="block truncate text-xs text-cream-dim">
              Daily fresh drops, playlists &amp; BTS updates.
            </span>
          </span>
          <span className="shrink-0 rounded-full bg-[#25d366] px-4 py-2 text-[13px] font-semibold text-white transition group-hover:brightness-110">
            Join Free
          </span>
        </a>
      ) : null}

      {canInstall && !dismissed ? (
        <div className="glass-strong animate-rise flex items-center gap-3 rounded-2xl p-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-oxblood font-display text-lg font-bold text-cream">
            ओ
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-cream">
              Install {SITE.name}
            </span>
            <span className="block truncate text-xs text-cream-dim">
              Full-screen app, no app store.
            </span>
          </span>
          <button
            type="button"
            onClick={() => void install()}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-cream/20 px-4 py-2 text-[13px] font-medium text-cream transition hover:bg-cream/12"
          >
            <Download className="h-4 w-4" aria-hidden />
            Install
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss install banner"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-cream/55 transition hover:bg-cream/12 hover:text-cream"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
}
