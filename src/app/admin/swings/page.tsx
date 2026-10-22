import Link from "next/link";
import { getStore } from "@/lib/db";
import { getCoach } from "@/lib/coaches/data";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { fmtDateTime } from "@/lib/utils";
import { RetryButton, AdminDeleteSwingButton } from "@/components/admin/AdminActions";

export const dynamic = "force-dynamic";

export default async function AdminSwingsPage() {
  const store = getStore();
  const swings = await store.listAllSwings();

  return (
    <Card>
      <CardBody className="pt-5">
        <h2 className="font-bold">Submitted swings ({swings.length})</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-500">
                <th className="py-2 pr-4">Swing</th><th className="py-2 pr-4">User</th><th className="py-2 pr-4">Coach</th>
                <th className="py-2 pr-4">Status</th><th className="py-2 pr-4">Submitted</th><th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {swings.map(s => (
                <tr key={s.id} className="border-b border-ink-100/60">
                  <td className="py-2.5 pr-4 font-medium">{s.input.club}<div className="text-xs font-normal text-ink-500">{s.input.skillLevel}</div></td>
                  <td className="py-2.5 pr-4 text-xs">{s.userId.slice(0, 12)}…</td>
                  <td className="py-2.5 pr-4">{getCoach(s.coachId)?.name ?? s.coachId}</td>
                  <td className="py-2.5 pr-4">
                    {s.status === "completed" ? <Badge tone="green">completed</Badge>
                      : s.status === "failed" ? <Badge tone="red">failed</Badge>
                      : <Badge tone="amber">processing</Badge>}
                  </td>
                  <td className="py-2.5 pr-4 text-xs text-ink-500">{fmtDateTime(s.createdAt)}</td>
                  <td className="py-2.5">
                    <div className="flex justify-end gap-1">
                      <Link href={`/review/${s.id}`}><button className="rounded-lg border border-ink-300 px-2 py-1 text-xs hover:border-ink-900">View</button></Link>
                      {s.status === "failed" && <RetryButton swingId={s.id} />}
                      <AdminDeleteSwingButton swingId={s.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {swings.length === 0 && <p className="mt-4 text-sm text-ink-500">No swings submitted yet.</p>}
      </CardBody>
    </Card>
  );
}
