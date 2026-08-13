import Image from "next/image";
import { SCENE } from "@/lib/scene";

/**
 * Fixed, full-bleed backdrop. Everything else in the app floats above this.
 * Falls back to a painted-in-CSS shopfront until real artwork is supplied.
 */
export function Scene() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-ink">
      {SCENE.src ? (
        <Image
          src={SCENE.src}
          alt={SCENE.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: SCENE.focus }}
        />
      ) : (
        <PaintedScene />
      )}

      {/* Legibility wash — keeps the hero and player readable over any art. */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_35%,transparent_25%,rgba(10,7,6,0.55)_75%,rgba(10,7,6,0.85)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink/90 via-ink/45 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink/70 to-transparent" />
    </div>
  );
}

/** A baithak after midnight: teak, velvet, brass, one lamp still on. */
function PaintedScene() {
  return (
    <div className="absolute inset-0">
      {/* Wall, deep and warm */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#2a2018_0%,#3a2a1d_30%,#2c1f16_62%,#15100b_100%)]" />

      {/* Velvet drape down the right */}
      <div className="absolute inset-y-0 right-0 w-[46%] bg-[repeating-linear-gradient(90deg,rgba(110,32,41,0.55)_0px,rgba(110,32,41,0.55)_38px,rgba(58,14,20,0.65)_38px,rgba(58,14,20,0.65)_76px)]" />
      <div className="absolute inset-y-0 right-0 w-[46%] bg-[linear-gradient(180deg,transparent_0%,rgba(10,6,4,0.75)_85%)]" />

      {/* Lamp bloom, upper left */}
      <div className="animate-flicker absolute inset-0 bg-[radial-gradient(40%_40%_at_22%_26%,rgba(230,182,96,0.5),transparent_68%)]" />
      <div className="absolute left-[19%] top-[21%] h-3 w-3 rounded-full bg-[#f0d9a0] shadow-[0_0_70px_34px_rgba(230,182,96,0.4)]" />

      {/* Brass rail catching that light */}
      <div className="absolute left-[8%] top-[46%] h-[3px] w-[34%] rounded-full bg-[linear-gradient(90deg,transparent,#c9a227_35%,#f3dc9a_55%,#8a6d18_80%,transparent)] opacity-70" />

      {/* Low table, foreground */}
      <div className="absolute inset-x-0 bottom-0 h-[26%] bg-[linear-gradient(180deg,#43301e_0%,#241a10_55%,#120c07_100%)]" />
      <div className="absolute inset-x-0 bottom-[26%] h-px bg-[linear-gradient(90deg,transparent,rgba(201,162,39,0.45),transparent)]" />

      {/* Smoke, barely */}
      <div className="absolute inset-0 bg-[radial-gradient(60%_45%_at_45%_70%,rgba(214,196,168,0.09),transparent_70%)]" />
    </div>
  );
}
