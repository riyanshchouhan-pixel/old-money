import type { Metadata } from "next";
import { PageFrame } from "@/components/chrome/PageFrame";
import { TrackRow } from "@/components/lists/TrackRow";
import { ALL_PLAYABLE } from "@/data/rotations";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `Songs — ${SITE.name}`,
  description: "Every song in rotation.",
};

export default function SongsPage() {
  return (
    <PageFrame
      title="Songs"
      hindi="गाने"
      lede={`${ALL_PLAYABLE.length} songs in rotation. Tap any one to cut to it.`}
    >
      <div className="glass rounded-3xl p-2">
        {ALL_PLAYABLE.map((track, i) => (
          <TrackRow key={track.id} track={track} position={i + 1} />
        ))}
      </div>
    </PageFrame>
  );
}
