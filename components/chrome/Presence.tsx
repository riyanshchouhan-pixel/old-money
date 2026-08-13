"use client";

import { useEffect, useState } from "react";

/**
 * A simulated listener count — there is no presence backend behind this.
 * It drifts around a time-of-day curve so it reads as alive rather than fixed.
 * Swap in a real websocket/analytics count when you have one.
 */
function estimate(date: Date): number {
  const hour = date.getHours() + date.getMinutes() / 60;
  // Quiet at dawn, busiest mid-evening.
  const curve = 0.45 + 0.55 * Math.sin(((hour - 4) / 24) * Math.PI * 2 - Math.PI / 2);
  const base = 120 + curve * 900;
  const wobble = Math.sin(date.getMinutes() * 1.7) * 18;
  return Math.max(24, Math.round(base + wobble));
}

export function Presence() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setCount(estimate(new Date()));
    tick();
    const id = window.setInterval(tick, 20_000);
    return () => window.clearInterval(id);
  }, []);

  if (count === null) return null;

  return (
    <div className="pointer-events-none fixed left-5 top-12 z-30 flex select-none items-center gap-2 text-[13px] text-cream/80 lg:left-1/2 lg:top-7 lg:-translate-x-1/2 lg:transform">
      <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.6)]" />
      <span className="font-semibold tabular-nums text-cream">{count}</span>
      <span className="text-cream/55">online</span>
    </div>
  );
}
