import Link from "next/link";
import { getStore } from "@/lib/db";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const store = getStore();
  const [users, swings, payments] = await Promise.all([store.listUsers(), store.listAllSwings(), store.listPayments()]);
  const failed = swings.filter(s => s.status === "failed").length;
  const revenue = payments.filter(p => p.status === "succeeded").reduce((a, p) => a + p.amountCents, 0);

  const stats = [
    { label: "Users", value: users.length, href: "/admin/users" },
    { label: "Swings submitted", value: swings.length, href: "/admin/swings" },
    { label: "Failed jobs", value: failed, href: "/admin/swings", tone: failed > 0 ? "text-red-600" : undefined },
    { label: "Payments", value: payments.length, href: "/admin/payments" },
    { label: "Revenue (simulated)", value: `$${(revenue / 100).toFixed(2)}`, href: "/admin/payments" },
    { label: "Reviews generated", value: swings.filter(s => s.analysis).length, href: "/admin/analyses" },
  ];

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(s => (
          <Link key={s.label} href={s.href}>
            <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-lg">
              <CardBody className="pt-5">
                <div className={`text-3xl font-bold ${s.tone ?? ""}`}>{s.value}</div>
                <div className="mt-1 text-sm text-ink-500">{s.label}</div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
      <div className="mt-6 flex items-center gap-2">
        <Badge tone="amber">Demo data — stored in data/db.json</Badge>
        <span className="text-xs text-ink-500">Configure Firebase to persist in Firestore.</span>
      </div>
    </div>
  );
}
