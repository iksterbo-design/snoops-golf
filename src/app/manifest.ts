import type { MetadataRoute } from "next";

/** PWA manifest: makes the MVP installable on iOS/Android phones and desktop browsers. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AI Golf Coach — Swing Reviews",
    short_name: "Golf Coach",
    description:
      "Pick one of four coaching voices, upload a swing video, and get structured feedback, drills, and a 7-day practice plan.",
    id: "/",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui", "browser"],
    orientation: "portrait",
    background_color: "#0b1220",
    theme_color: "#15803d",
    categories: ["sports", "lifestyle"],
    lang: "en",
    dir: "ltr",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "New swing review", short_name: "New review", url: "/swings/new", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Choose a coach", short_name: "Coaches", url: "/coaches", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Review history", short_name: "History", url: "/history", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
