import { ImageResponse } from "next/og";

/**
 * Renders the app icon at any size so the manifest needs no binary assets.
 * /api/icon?size=512&maskable=1
 */
export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const size = Math.min(1024, Math.max(48, Number(params.get("size")) || 512));
  const maskable = params.get("maskable") === "1";

  // Maskable icons get trimmed to a circle by the launcher, so keep the mark small.
  const scale = maskable ? 0.42 : 0.56;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #6e2029 0%, #3d1218 55%, #17100b 100%)",
          borderRadius: maskable ? 0 : size * 0.22,
        }}
      >
        <div
          style={{
            fontSize: size * scale,
            fontWeight: 800,
            letterSpacing: -size * 0.03,
            color: "#c9a227",
            display: "flex",
          }}
        >
          OM
        </div>
      </div>
    ),
    { width: size, height: size },
  );
}
