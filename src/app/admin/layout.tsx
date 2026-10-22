import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/coaches", label: "Coaches" },
  { href: "/admin/swings", label: "Swings" },
  { href: "/admin/analyses", label: "Analyses" },
  { href: "/admin/payments", label: "Payments" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/admin");
  if (!user.isAdmin) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center gap-3">
        <span className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">Admin</span>
        <h1 className="text-xl font-bold">Control panel</h1>
      </div>
      <nav className="mt-4 flex flex-wrap gap-1 border-b border-ink-100 pb-3">
        {nav.map(n => (
          <Link key={n.href} href={n.href} className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-500 hover:bg-ink-100 hover:text-ink-900">
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="mt-6">{children}</div>
    </div>
  );
}
