import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SITE } from "@/lib/site";

/** Shared shell for the sub-pages: back link, heading, content, rights notice. */
export function PageFrame({
  title,
  hindi,
  lede,
  children,
}: {
  title: string;
  hindi?: string;
  lede?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-52 pt-20 sm:pt-24">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-[13px] text-cream/55 transition hover:text-cream"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to the lake
      </Link>

      <header className="animate-rise mt-6">
        {hindi ? (
          <p className="font-display text-3xl font-bold text-cream/85">{hindi}</p>
        ) : null}
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-cream sm:text-3xl">
          {title}
        </h1>
        {lede ? <p className="mt-2 text-sm text-cream-dim">{lede}</p> : null}
      </header>

      <div className="mt-8">{children}</div>

      <footer className="mt-14 space-y-3 border-t border-cream/10 pt-6 text-[11px] leading-relaxed text-cream/35">
        <p>
          Audio plays through YouTube&rsquo;s embedded player. Nothing is hosted on
          this site, and all rights stay with the labels, composers and performers.
          Song credits are put together from film soundtrack listings.
        </p>
        <p>
          If you hold rights to anything here and want it taken off, email{" "}
          <a
            className="underline decoration-cream/25 underline-offset-2 hover:text-cream/70"
            href={`mailto:${SITE.contactEmail}`}
          >
            {SITE.contactEmail}
          </a>{" "}
          and it comes down.
        </p>
        <p className="pt-2 tracking-[0.2em] text-cream/25">
          © {new Date().getFullYear()} {SITE.name.toUpperCase()}
        </p>
      </footer>
    </div>
  );
}
