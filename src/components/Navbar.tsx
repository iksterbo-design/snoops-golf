"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./providers/AuthProvider";
import { Button } from "./ui/Button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/menu", label: "Menu" },
  { href: "/coaches", label: "Coaches" },
  { href: "/history", label: "History" },
  { href: "/profile", label: "Profile" },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  if (pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/signup")) return null;
  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-ink-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-fairway-600 text-white text-sm">A</span>
          AI Golf Coach
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className={cn("rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname.startsWith(l.href) ? "bg-fairway-50 text-fairway-800" : "text-ink-500 hover:text-ink-900")}>
              {l.label}
            </Link>
          ))}
          {user?.isAdmin && (
            <Link href="/admin" className={cn("rounded-lg px-3 py-2 text-sm font-medium", pathname.startsWith("/admin") ? "bg-red-50 text-red-700" : "text-ink-500 hover:text-ink-900")}>
              Admin
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-ink-500 sm:block">{user?.name}</span>
          <Button variant="ghost" size="sm" onClick={logout}>Sign out</Button>
        </div>
      </div>
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-ink-100 px-3 py-1.5 md:hidden">
        {links.map(l => (
          <Link key={l.href} href={l.href} className={cn("whitespace-nowrap rounded-lg px-3 py-1.5 text-sm", pathname.startsWith(l.href) ? "bg-fairway-50 text-fairway-800" : "text-ink-500")}>{l.label}</Link>
        ))}
        {user?.isAdmin && <Link href="/admin" className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm text-red-600">Admin</Link>}
      </nav>
    </header>
  );
}
