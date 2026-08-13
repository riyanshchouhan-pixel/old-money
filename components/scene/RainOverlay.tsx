"use client";

/** Animated rain streaks over the scene while the rain sound is on. */
export function RainOverlay({ active }: { active: boolean }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-20 overflow-hidden transition-opacity duration-1000 ${
        active ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="rain-layer rain-layer--far" />
      <div className="rain-layer" />
    </div>
  );
}
