import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PwaRegister } from "@/components/PwaRegister";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: { default: "AI Golf Coach — Swing reviews from four real coaching voices", template: "%s · AI Golf Coach" },
  description:
    "Upload a swing, pick one of four coaching personalities, and get structured feedback, video checkpoints, drills, and a 7-day practice plan.",
  applicationName: "AI Golf Coach",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Golf Coach",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    siteName: "AI Golf Coach",
    title: "AI Golf Coach",
    description: "Four coaching voices. One swing video. Real, coach-specific feedback.",
  },
  twitter: { card: "summary", title: "AI Golf Coach", description: "Coach-personalized AI swing reviews." },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#15803d" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <PwaRegister />
        </AuthProvider>
      </body>
    </html>
  );
}
