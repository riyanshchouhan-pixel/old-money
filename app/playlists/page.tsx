import type { Metadata } from "next";
import { PageFrame } from "@/components/chrome/PageFrame";
import { RotationCard } from "@/components/lists/RotationCard";
import { ROTATIONS } from "@/data/rotations";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `Playlists — ${SITE.name}`,
  description: "Rotations playing round the clock.",
};

export default function PlaylistsPage() {
  return (
    <PageFrame
      title="Playlists"
      hindi="महफ़िलें"
      lede="Four sittings. Pick one and it plays until you say otherwise."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {ROTATIONS.map((rotation) => (
          <RotationCard key={rotation.slug} rotation={rotation} />
        ))}
      </div>
    </PageFrame>
  );
}
