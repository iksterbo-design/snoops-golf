/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Produces .next/standalone/server.js so the runtime image stays small and
  // runs on any host (linux/amd64, linux/arm64, macOS, Windows).
  output: "standalone",
  experimental: { serverComponentsExternalPackages: ["firebase-admin"] },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }],
      },
      {
        source: "/manifest.webmanifest",
        headers: [{ key: "Content-Type", value: "application/manifest+json" }],
      },
    ];
  },
};
export default nextConfig;
