import { getStore } from "@/lib/db";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { fmtDateTime, fmtMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const store = getStore();
  const payments = await store.listPayments();
  const succeeded = payments.filter(p => p.status === "succeeded");

  return (
    <Card>
      <CardBody className="pt-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Payments ({payments.length})</h2>
          <div className="text-sm text-ink-500">Collected: <b className="text-ink-900">{fmtMoney(succeeded.reduce((a, p) => a + p.amountCents, 0))}</b></div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-500">
                <th className="py-2 pr-4">Payment</th><th className="py-2 pr-4">User</th><th className="py-2 pr-4">Provider</th>
                <th className="py-2 pr-4">Amount</th><th className="py-2 pr-4">Status</th><th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} className="border-b border-ink-100/60">
                  <td className="py-2.5 pr-4 font-mono text-xs">{p.id}</td>
                  <td className="py-2.5 pr-4 text-xs">{p.userId.slice(0, 12)}…</td>
                  <td className="py-2.5 pr-4"><Badge tone={p.provider === "stripe" ? "purple" : "amber"}>{p.provider}</Badge></td>
                  <td className="py-2.5 pr-4 font-medium">{fmtMoney(p.amountCents, p.currency)}</td>
                  <td className="py-2.5 pr-4"><Badge tone={p.status === "succeeded" ? "green" : p.status === "pending" ? "amber" : "red"}>{p.status}</Badge></td>
                  <td className="py-2.5 text-xs text-ink-500">{fmtDateTime(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {payments.length === 0 && <p className="mt-4 text-sm text-ink-500">No payments yet.</p>}
      </CardBody>
    </Card>
  );
}
