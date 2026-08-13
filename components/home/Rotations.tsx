"use client";

import { ROTATIONS } from "@/data/rotations";
import { usePlayer } from "@/lib/player";

export function Rotations() {
  const { rotationSlug, playRotation, isPlaying } = usePlayer();

  return (
    <section className="animate-rise text-center" aria-label="Rotations">
      <h2 className="text-carved text-[10px] font-semibold tracking-[0.4em] text-cream/55">
        ROTATIONS
      </h2>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {ROTATIONS.map((rotation) => {
          const active = rotation.slug === rotationSlug;
          return (
            <button
              key={rotation.slug}
              type="button"
              onClick={() => playRotation(rotation.slug)}
              title={rotation.tagline}
              aria-pressed={active}
              className={`glass rounded-full px-4 py-2 text-[13px] font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream/60 ${
                active
                  ? "border-cream/35 bg-cream/18 text-cream"
                  : "text-cream/75 hover:bg-cream/12 hover:text-cream"
              }`}
            >
              <span className="flex items-center gap-2">
                {active && isPlaying ? <Bars /> : null}
                {rotation.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/** Three little dancing bars, so the live rotation is obvious at a glance. */
function Bars() {
  return (
    <span className="flex h-3 items-end gap-[2px]" aria-hidden>
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="w-[2px] animate-[saloon-pulse_1s_ease-in-out_infinite] rounded-full bg-cream"
          style={{ height: "100%", animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}
