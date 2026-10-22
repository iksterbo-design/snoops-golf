import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getStore } from "@/lib/db";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { fmtDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profile — AI Golf Coach" };

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/profile");
  const store = getStore();
  const swings = await store.listSwingsByUser(user.id);
  const payments = await store.listPaymentsByUser(user.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">Your profile</h1>
      <Card className="mt-6">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Account</CardTitle>
          <Badge tone={user.isAdmin ? "red" : "slate"}>{user.isAdmin ? "Administrator" : "Golfer"}</Badge>
        </CardHeader>
        <CardBody className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-ink-100 pb-3"><span className="text-ink-500">Name</span><span className="font-medium">{user.name}</span></div>
          <div className="flex justify-between border-b border-ink-100 pb-3"><span className="text-ink-500">Email</span><span className="font-medium">{user.email}</span></div>
          <div className="flex justify-between border-b border-ink-100 pb-3"><span className="text-ink-500">Member since</span><span className="font-medium">{fmtDate(user.createdAt)}</span></div>
          <div className="flex justify-between"><span className="text-ink-500">Mode</span><span className="font-medium">{process.env.NEXT_PUBLIC_DEMO_MODE === "false" ? "Live" : "Demo"}</span></div>
        </CardBody>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card><CardBody className="pt-5"><div className="text-3xl font-bold">{swings.length}</div><div className="mt-1 text-sm text-ink-500">Swings submitted</div></CardBody></Card>
        <Card><CardBody className="pt-5"><div className="text-3xl font-bold">{payments.length}</div><div className="mt-1 text-sm text-ink-500">Payments ({payments[0]?.provider ?? "demo"})</div></CardBody></Card>
      </div>
    </div>
  );
}
