import { ACCOUNT_NETWORK } from "@/lib/accounts/data";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const metadata = { title: "Account Network — AI Golf Coach" };

export default function AccountNetPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-ink-900">Account Network</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink-500">
        The connected accounts across golfers, coaches, staff, and admins.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ACCOUNT_NETWORK.map(a => (
          <Card key={a.id} className="transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <CardBody className="pt-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-ink-900">{a.name}</h3>
                <Badge tone={a.status === "active" ? "green" : "red"}>{a.status}</Badge>
              </div>
              <p className="mt-1 text-xs font-semibold text-fairway-700">{a.type}</p>
              <p className="mt-2 text-sm text-ink-500">{a.connections} connections</p>
              <Badge tone="slate" className="mt-2">{a.id}</Badge>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
