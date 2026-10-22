"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Label, Select, Textarea, FieldError } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { CoachAvatar } from "@/components/ui/CoachCard";
import { CLUBS, GOALS, ISSUE_OPTIONS } from "@/lib/constants";
import { COACHES } from "@/lib/coaches/data";

function NewSwingForm() {
  const router = useRouter();
  const params = useSearchParams();
  const coachId = params.get("coach") ?? COACHES[0].id;
  const coach = COACHES.find(c => c.id === coachId) ?? COACHES[0];

  const [club, setClub] = useState<string>("7-Iron");
  const [skillLevel, setSkillLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [goal, setGoal] = useState<string>("Lower my handicap");
  const [context, setContext] = useState("");
  const [issues, setIssues] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const toggleIssue = (id: string) =>
    setIssues(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/swings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coachId, input: { club, skillLevel, goal, context, issues } }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Could not create swing."); return; }
      router.push(`/checkout?swing=${data.swing.id}`);
    } catch { setError("Network error. Try again."); }
    finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">Tell {coach.name.split(" ")[0]} about the swing</h1>
      <p className="mt-1 text-sm text-ink-500">Context shapes the review. Be honest — it makes the feedback better.</p>

      <Card className="mt-6">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Your coach</CardTitle>
          <Badge tone="green">{coach.positioning.split(",")[0]}</Badge>
        </CardHeader>
        <CardBody className="flex items-center gap-4">
          <CoachAvatar initials={coach.initials} accent={coach.accent} size={12} />
          <div className="flex-1">
            <div className="font-semibold">{coach.name}</div>
            <div className="text-sm text-ink-500">{coach.tagline}</div>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => router.push("/coaches")}>Change</Button>
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardHeader><CardTitle>Swing details</CardTitle></CardHeader>
        <CardBody className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="club">Club</Label>
              <Select id="club" value={club} onChange={e => setClub(e.target.value)}>
                {CLUBS.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="skill">Skill level</Label>
              <Select id="skill" value={skillLevel} onChange={e => setSkillLevel(e.target.value as typeof skillLevel)}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="goal">Primary goal</Label>
            <Select id="goal" value={goal} onChange={e => setGoal(e.target.value)}>
              {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
            </Select>
          </div>
          <div>
            <Label>What are you feeling? <span className="font-normal text-ink-300">(select all that apply)</span></Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {ISSUE_OPTIONS.map(o => (
                <button key={o.id} type="button" onClick={() => toggleIssue(o.id)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${issues.includes(o.id) ? "border-fairway-600 bg-fairway-50 text-fairway-800 font-medium" : "border-ink-300 text-ink-500 hover:border-ink-500"}`}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="context">Anything else? <span className="font-normal text-ink-300">(optional)</span></Label>
            <Textarea id="context" rows={4} value={context} onChange={e => setContext(e.target.value)}
              placeholder="e.g. Video is face-on from down-the-line. I struggle most with my driver on the course under pressure." />
          </div>
          <FieldError>{error}</FieldError>
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-ink-500">Next: checkout, then upload the video.</p>
            <Button type="submit" disabled={busy}>{busy && <Spinner className="h-4 w-4" />} Continue to checkout</Button>
          </div>
        </CardBody>
      </Card>
    </form>
  );
}

export default function NewSwingPage() {
  return <Suspense fallback={<div className="flex justify-center py-20 text-ink-500"><Spinner className="mr-2" /> Loading…</div>}><NewSwingForm /></Suspense>;
}
