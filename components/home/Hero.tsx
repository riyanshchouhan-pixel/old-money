import { SITE } from "@/lib/site";

export function Hero() {
  return (
    <div className="animate-rise select-none text-center">
      <h1 className="font-display text-[clamp(2.75rem,min(14vw,19vh),11rem)] font-extrabold leading-[0.85] tracking-tight text-cream text-carved">
        {SITE.hindi.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </h1>
      <p className="text-carved mt-4 text-[11px] font-medium tracking-[0.42em] text-cream/70 sm:text-xs">
        {SITE.tagline}
      </p>
    </div>
  );
}
