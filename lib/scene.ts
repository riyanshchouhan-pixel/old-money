/**
 * The single swap point for the backdrop.
 * Drop artwork into /public/scene/ and set `src` — everything else adapts.
 * While `src` is null the CSS scene in components/scene/Scene.tsx stands in.
 */
export const SCENE: {
  src: string | null;
  alt: string;
  /** object-position for the artwork; tune once the real image is in. */
  focus: string;
} = {
  src: "/scene/bhopal.jpg",
  alt: "Raja Bhoj statue on the Upper Lake in Bhopal at night, in the rain",
  focus: "center 40%",
};
