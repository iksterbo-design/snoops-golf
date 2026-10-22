import { getStore } from "@/lib/db";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { fmtDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const store = getStore();
  const users = await store.listUsers();

  return (
    <Card>
      <CardBody className="pt-5">
        <h2 className="font-bold">Users ({users.length})</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-500">
                <th className="py-2 pr-4">Name</th><th className="py-2 pr-4">Email</th><th className="py-2 pr-4">Role</th><th className="py-2 pr-4">Joined</th><th className="py-2">ID</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-ink-100/60">
                  <td className="py-2.5 pr-4 font-medium">{u.name}</td>
                  <td className="py-2.5 pr-4">{u.email}</td>
                  <td className="py-2.5 pr-4"><Badge tone={u.role === "admin" ? "red" : "slate"}>{u.role}</Badge></td>
                  <td className="py-2.5 pr-4">{fmtDate(u.createdAt)}</td>
                  <td className="py-2.5 font-mono text-xs text-ink-500">{u.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
}
