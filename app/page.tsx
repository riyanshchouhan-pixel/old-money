import { Hero } from "@/components/home/Hero";
import { Rotations } from "@/components/home/Rotations";
import { Banners } from "@/components/chrome/Banners";
import { SITE } from "@/lib/site";

export default function Home() {
  return (
    <div className="flex h-full flex-col items-center px-4 pb-40 pt-20 sm:pb-44 sm:pt-24">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-7">
        <Hero />
        <Rotations />
      </div>

      <div className="w-full space-y-3">
        <Banners />
        <p className="text-center text-[11px] text-cream/35">
          contact:{" "}
          <a
            className="underline decoration-cream/25 underline-offset-2 transition hover:text-cream/70"
            href={`mailto:${SITE.contactEmail}`}
          >
            {SITE.contactEmail}
          </a>
        </p>
      </div>
    </div>
  );
}
