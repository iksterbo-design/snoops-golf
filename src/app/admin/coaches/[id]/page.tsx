import { notFound } from "next/navigation";
import { getCoach } from "@/lib/coaches/data";
import { getStore } from "@/lib/db";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { CoachPromptEditor } from "@/components/admin/CoachPromptEditor";

export const dynamic = "force-dynamic";

export default async function AdminCoachEditPage({ params }: { params: { id: string } }) {
  const coach = getCoach(params.id);
  if (!coach) notFound();
  const store = getStore();
  const overrides = await store.getCoachOverrides();
  const effectivePrompt = overrides[coach.id]?.systemPrompt ?? coach.systemPrompt;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader><CardTitle>{coach.name}</CardTitle></CardHeader>
        <CardBody className="text-sm text-ink-500 space-y-3">
          <p><b className="text-ink-900">Positioning:</b> {coach.positioning}</p>
          <p><b className="text-ink-900">Communication:</b> {coach.communication.join(", ")}</p>
          <p><b className="text-ink-900">AI behavior rules:</b></p>
          <ul className="list-disc pl-5 space-y-1">{coach.aiBehavior.map(b => <li key={b}>{b}</li>)}</ul>
          <p><b className="text-ink-900">Drill library ({coach.preferredDrills.length}):</b></p>
          <ul className="list-disc pl-5 space-y-1">{coach.preferredDrills.map(d => <li key={d.name}>{d.name}</li>)}</ul>
        </CardBody>
      </Card>
      <div className="lg:col-span-2">
        <Card>
          <CardHeader><CardTitle>Prompt template</CardTitle></CardHeader>
          <CardBody>
            <CoachPromptEditor coachId={coach.id} initialPrompt={effectivePrompt} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
