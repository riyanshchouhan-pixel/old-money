"use client";

import { useEffect, useState } from "react";
import { formatClock } from "@/lib/format";

export function Clock() {
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setNow(formatClock(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="pointer-events-none fixed left-5 top-5 z-30 select-none font-mono text-[13px] tracking-[0.32em] text-cream/75 mix-blend-screen sm:left-8 sm:top-7 sm:text-sm">
      {/* Rendered only after mount so server and client clocks can't disagree. */}
      {now ?? " "}
    </div>
  );
}
