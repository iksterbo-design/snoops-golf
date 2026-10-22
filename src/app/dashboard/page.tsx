import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getStore } from "@/lib/db";
import { getCoach } from "@/lib/coaches/data";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CoachAvatar } from "@/components/ui/CoachCard";
import { fmtDate } from "@/lib/utils";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/dashboard");
  const store = getStore();
  const swings = await store.listSwingsByUser(user.id);
  const completed = swings.filter(s => s.status === "completed");
  const avg = (k: "contact" | "consistency" | "distance" | "tempo" | "sequencing") =>
    completed.length ? Math.round(completed.reduce((a, s) => a + (s.analysis?.scores[k] ?? 0), 0) / completed.length) : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Hey {user.name.split(" ")[0]} ⛳</h1>
          <p className="mt-1 text-sm text-ink-500">Your swing reviews and progress at a glance.</p>
        </div>
        <Link href="/coaches"><Button>New swing review</Button></Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Reviews completed", String(completed.length)],
          ["Avg contact", avg("contact") != null ? `${avg("contact")}/100` : "—"],
          ["Avg consistency", avg("consistency") != null ? `${avg("consistency")}/100` : "—"],
          ["In progress", String(swings.filter(s => s.status === "processing").length)],
        ].map(([label, value]) => (
          <Card key={label}><CardBody className="pt-5"><div className="text-3xl font-bold">{value}</div><div className="mt-1 text-sm text-ink-500">{label}</div></CardBody></Card>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-bold">Recent swings</h2>
      {swings.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="No swings yet" hint="Pick a coach, upload a swing, and get your first structured review."
            action={<Link href="/coaches"><Button>Choose a coach</Button></Link>} />
        </div>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {swings.slice(0, 6).map(s => {
            const coach = getCoach(s.coachId);
            return (
              <Card key={s.id}>
                <CardHeader className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {coach && <CoachAvatar initials={coach.initials} accent={coach.accent} size={8} />}
                    <div>
                      <CardTitle className="text-base">{s.input.club} — {coach?.name ?? s.coachId}</CardTitle>
                      <p className="text-xs text-ink-500">{fmtDate(s.createdAt)}</p>
                    </div>
                  </div>
                  {s.status === "completed" ? <Badge tone="green">Completed</Badge>
                    : s.status === "failed" ? <Badge tone="red">Failed</Badge>
                    : <Badge tone="amber">Processing</Badge>}
                </CardHeader>
                <CardBody className="flex items-center justify-between">
                  <p className="text-sm text-ink-500">
                    {s.analysis ? s.analysis.strengths[0] ?? "Review ready" : s.error ?? "Waiting for upload or analysis"}
                  </p>
                  <Link href={s.status === "completed" ? `/review/${s.id}` : `/processing/${s.id}`}>
                    <Button variant="outline" size="sm">{s.status === "completed" ? "View review" : "Check status"}</Button>
                  </Link>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
