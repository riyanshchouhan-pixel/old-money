import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Mukta } from "next/font/google";
import { PlayerProvider } from "@/lib/player";
import { SITE } from "@/lib/site";
import { Scene } from "@/components/scene/Scene";
import { PlayerBar } from "@/components/player/PlayerBar";
import { TopNav } from "@/components/chrome/TopNav";
import { Clock } from "@/components/chrome/Clock";
import { ServiceWorker } from "@/components/chrome/ServiceWorker";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const display = Mukta({
  variable: "--font-display",
  subsets: ["devanagari", "latin"],
  weight: ["400", "700", "800"],
});

export const metadata: Metadata = {
  title: `${SITE.name} — an ambient rainy-night radio`,
  description: SITE.description,
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: SITE.name, statusBarStyle: "black-translucent" },
  openGraph: {
    title: `${SITE.name} — an ambient rainy-night radio`,
    description: SITE.description,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#14100e",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <PlayerProvider>
          <Scene />
          <Clock />
          <TopNav />
          <main className="relative h-dvh overflow-y-auto overscroll-contain">
            {children}
          </main>
          <PlayerBar />
          <ServiceWorker />
        </PlayerProvider>
      </body>
    </html>
  );
}
