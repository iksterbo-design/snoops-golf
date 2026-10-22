import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getStore } from "@/lib/db";
import { getCoach } from "@/lib/coaches/data";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CoachAvatar } from "@/components/ui/CoachCard";
import { fmtDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Review history — AI Golf Coach" };

export default async function HistoryPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/history");
  const store = getStore();
  const swings = (await store.listSwingsByUser(user.id)).filter(s => s.status === "completed" && s.analysis);
  const coaches = [...new Set(swings.map(s => s.coachId))].map(getCoach).filter(Boolean);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Review history</h1>
          <p className="mt-1 text-sm text-ink-500">Every saved review. Compare scores across time to track progress.</p>
        </div>
        <Link href="/coaches"><Button>New review</Button></Link>
      </div>

      {coaches.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {coaches.map(c => c && <Badge key={c.id} tone="blue">{c.name} × {swings.filter(s => s.coachId === c.id).length}</Badge>)}
        </div>
      )}

      {swings.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No reviews yet" hint="Complete your first swing review and it will appear here with scores to compare over time."
            action={<Link href="/coaches"><Button>Start your first review</Button></Link>} />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {swings.map(s => {
            const coach = getCoach(s.coachId);
            return (
              <Link key={s.id} href={`/review/${s.id}`}>
                <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-lg">
                  <CardBody className="pt-5">
                    <div className="flex items-center gap-3">
                      {coach && <CoachAvatar initials={coach.initials} accent={coach.accent} size={9} />}
                      <div>
                        <div className="font-semibold">{s.input.club}</div>
                        <div className="text-xs text-ink-500">{coach?.name} · {fmtDate(s.createdAt)}</div>
                      </div>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm text-ink-500">{s.analysis!.summary}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3">
                      <div className="flex gap-3 text-xs text-ink-500">
                        <span>Contact <b className="text-ink-900">{s.analysis!.scores.contact}</b></span>
                        <span>Tempo <b className="text-ink-900">{s.analysis!.scores.tempo}</b></span>
                        <span>Seq <b className="text-ink-900">{s.analysis!.scores.sequencing}</b></span>
                      </div>
                      <Badge tone="green">View</Badge>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
