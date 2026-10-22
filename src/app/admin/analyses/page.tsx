import Link from "next/link";
import { getStore } from "@/lib/db";
import { getCoach } from "@/lib/coaches/data";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { fmtDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminAnalysesPage() {
  const store = getStore();
  const swings = (await store.listAllSwings()).filter(s => s.analysis);

  return (
    <Card>
      <CardBody className="pt-5">
        <h2 className="font-bold">Generated analyses ({swings.length})</h2>
        <div className="mt-4 space-y-3">
          {swings.map(s => (
            <div key={s.id} className="rounded-xl border border-ink-100 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{s.input.club}</span>
                  <Badge tone="slate">{getCoach(s.coachId)?.name}</Badge>
                  <Badge tone={s.analysis!.generatedBy === "llm" ? "purple" : "amber"}>
                    {s.analysis!.generatedBy === "llm" ? "LLM" : "mock engine"}
                  </Badge>
                </div>
                <Link href={`/review/${s.id}`} className="text-sm font-medium text-fairway-700 hover:underline">Open review &rarr;</Link>
              </div>
              <p className="mt-2 text-sm text-ink-500">{s.analysis!.summary}</p>
              <p className="mt-1 text-xs text-ink-500">{fmtDate(s.createdAt)} · contact {s.analysis!.scores.contact} · tempo {s.analysis!.scores.tempo} · sequencing {s.analysis!.scores.sequencing}</p>
            </div>
          ))}
          {swings.length === 0 && <p className="text-sm text-ink-500">No analyses generated yet.</p>}
        </div>
      </CardBody>
    </Card>
  );
}
