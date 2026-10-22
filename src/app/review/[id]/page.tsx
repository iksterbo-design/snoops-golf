import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getStore } from "@/lib/db";
import { getCoach } from "@/lib/coaches/data";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { CoachAvatar } from "@/components/ui/CoachCard";
import { VideoWithCheckpoints } from "@/components/VideoWithCheckpoints";
import { DeleteSwingButton } from "@/components/DeleteSwingButton";
import { fmtDate } from "@/lib/utils";
import type { Swing } from "@/types";

export const dynamic = "force-dynamic";

export default async function ReviewPage({ params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=/review/${params.id}`);
  const store = getStore();
  const swing = await store.getSwing(params.id);
  if (!swing || (!user.isAdmin && swing.userId !== user.id)) notFound();

  const coach = getCoach(swing.coachId);
  const previous = (await store.listSwingsByUser(swing.userId))
    .filter(s => s.id !== swing.id && s.status === "completed" && s.analysis)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

  if (swing.status !== "completed" || !swing.analysis) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-xl font-bold">This review isn&rsquo;t ready yet</h1>
        <p className="mt-2 text-sm text-ink-500">Status: <span className="capitalize">{swing.status}</span>{swing.error ? ` — ${swing.error}` : ""}</p>
        <Link href={`/processing/${swing.id}`} className="mt-4 inline-block font-medium text-fairway-700 hover:underline">Check processing status &rarr;</Link>
      </div>
    );
  }

  const a = swing.analysis;
  const prevScores = previous?.analysis?.scores;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {coach && <CoachAvatar initials={coach.initials} accent={coach.accent} size={12} />}
          <div>
            <h1 className="text-2xl font-bold">Review: {swing.input.club}</h1>
            <p className="text-sm text-ink-500">{coach?.name} · {fmtDate(swing.createdAt)} · {swing.input.skillLevel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/history"><button className="rounded-lg border border-ink-300 px-3 py-1.5 text-sm text-ink-700 hover:border-ink-900">All reviews</button></Link>
          <DeleteSwingButton swingId={swing.id} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone="amber">Demo analysis — simulated</Badge>
        {swing.input.issues.map(i => <Badge key={i} tone="slate">{i}</Badge>)}
      </div>

      <Card className="mt-6">
        <CardBody className="pt-6">
          <VideoWithCheckpoints swingId={swing.id} videoName={swing.videoName} observations={a.observations} />
        </CardBody>
      </Card>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Coach&rsquo;s summary</CardTitle></CardHeader>
          <CardBody>
            <p className="text-[15px] leading-relaxed text-ink-700">{a.summary}</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-fairway-50 p-4">
                <h4 className="text-sm font-semibold text-fairway-800">Already working</h4>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-700">{a.strengths.map(s => <li key={s}>{s}</li>)}</ul>
              </div>
              <div className="rounded-xl bg-amber-50 p-4">
                <h4 className="text-sm font-semibold text-amber-800">Fix these first</h4>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-700">{a.priorities.map(s => <li key={s}>{s}</li>)}</ul>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Scores</CardTitle></CardHeader>
          <CardBody className="flex flex-wrap justify-center gap-4">
            {(Object.keys(a.scores) as (keyof typeof a.scores)[]).map(k => (
              <div key={k} className="text-center">
                <ScoreRing value={a.scores[k]} label={k} />
                {prevScores && (
                  <div className="mt-1 text-[11px] text-ink-500">
                    prev {prevScores[k]} {a.scores[k] - prevScores[k] >= 0 ? `+${a.scores[k] - prevScores[k]}` : a.scores[k] - prevScores[k]}
                  </div>
                )}
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Observations</CardTitle></CardHeader>
        <CardBody className="space-y-3">
          {a.observations.map((o, i) => (
            <div key={i} className="flex gap-3 rounded-xl border border-ink-100 p-4">
              <div className="flex shrink-0 flex-col items-start gap-2">
                <Badge tone={o.severity === "good" ? "green" : o.severity === "attention" ? "amber" : "red"} className="h-fit">
                  {o.severity === "good" ? "Working" : o.severity}
                </Badge>
                {o.checkpoint.frame ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={o.checkpoint.frame} alt={o.checkpoint.label} loading="lazy"
                    className="h-16 w-24 rounded-lg border border-ink-100 object-cover" />
                ) : null}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-semibold text-sm">{o.title}</h4>
                  <span className="checkpoint-marker">{o.checkpoint.t}</span>
                  <span className="text-xs text-ink-500">{o.checkpoint.label}</span>
                </div>
                <p className="mt-1 text-sm text-ink-500">{o.detail}</p>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card className="mt-6">
        <CardHeader><CardTitle>{coach?.name.split(" ")[0]}&rsquo;s drills</CardTitle></CardHeader>
        <CardBody className="grid gap-4 md:grid-cols-3">
          {a.drills.map(d => (
            <div key={d.name} className="rounded-xl border border-ink-100 p-4">
              <h4 className="font-semibold text-sm">{d.name}</h4>
              <p className="mt-2 text-xs font-medium uppercase tracking-wide text-fairway-700">Why it matters</p>
              <p className="mt-1 text-sm text-ink-500">{d.why}</p>
              <p className="mt-2 text-xs font-medium uppercase tracking-wide text-fairway-700">How</p>
              <p className="mt-1 text-sm text-ink-500">{d.how}</p>
              <p className="mt-3 text-xs font-semibold text-ink-700">{d.reps}</p>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card className="mt-6">
        <CardHeader><CardTitle>Your 7-day practice plan</CardTitle></CardHeader>
        <CardBody>
          <div className="grid gap-3 sm:grid-cols-7">
            {a.plan.map(p => (
              <div key={p.day} className="rounded-xl border border-ink-100 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-fairway-700">Day {p.day}</span>
                </div>
                <h4 className="mt-1 text-sm font-semibold">{p.focus}</h4>
                <ul className="mt-2 space-y-1.5 text-xs text-ink-500">
                  {p.activities.map((act, i) => <li key={i}>• {act}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {previous && (
        <Card className="mt-6">
          <CardHeader><CardTitle>Compare with previous review</CardTitle></CardHeader>
          <CardBody>
            <p className="text-sm text-ink-500">vs. {previous.input.club} reviewed {fmtDate(previous.createdAt)}</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-500">
                    <th className="py-2 pr-4">Metric</th><th className="py-2 pr-4">Previous</th><th className="py-2 pr-4">Now</th><th className="py-2">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {(Object.keys(a.scores) as (keyof typeof a.scores)[]).map(k => {
                    const diff = a.scores[k] - (prevScores?.[k] ?? a.scores[k]);
                    return (
                      <tr key={k} className="border-b border-ink-100/60">
                        <td className="py-2 pr-4 capitalize">{k}</td>
                        <td className="py-2 pr-4">{prevScores?.[k] ?? "—"}</td>
                        <td className="py-2 pr-4">{a.scores[k]}</td>
                        <td className={`py-2 font-medium ${diff > 0 ? "text-fairway-700" : diff < 0 ? "text-red-600" : "text-ink-500"}`}>
                          {diff > 0 ? `+${diff}` : diff}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}

      <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">{a.disclaimer}</p>
    </div>
  );
}
