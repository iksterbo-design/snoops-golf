import "server-only";
import { env } from "./env";
import type { Analysis, Swing } from "@/types";
import { buildCoachPrompt } from "@/lib/coaches/prompts";
import type { CoachProfile } from "@/lib/coaches/data";

/** LLM adapter: any OpenAI-compatible chat-completions endpoint. Falls back to mock on failure. */
export async function generateLlmAnalysis(swing: Swing, coach: CoachProfile, observationsSummary: string): Promise<Analysis> {
  const { system, user } = buildCoachPrompt(coach, swing);
  const finalUser = user.replace("{{OBSERVATIONS}}", observationsSummary);

  const res = await fetch(`${env.llm.baseURL}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.llm.apiKey}` },
    body: JSON.stringify({
      model: env.llm.model, temperature: 0.7, response_format: { type: "json_object" },
      messages: [{ role: "system", content: system }, { role: "user", content: finalUser }],
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`LLM request failed: ${res.status}`);
  const data = await res.json();
  const content: string = data?.choices?.[0]?.message?.content ?? "{}";
  return normalize(JSON.parse(content));
}

function normalize(p: any): Analysis {
  return {
    summary: String(p.summary ?? "Review generated."),
    scores: {
      contact: num(p.scores?.contact), consistency: num(p.scores?.consistency),
      distance: num(p.scores?.distance), tempo: num(p.scores?.tempo), sequencing: num(p.scores?.sequencing),
    },
    observations: Array.isArray(p.observations) ? p.observations.slice(0, 8).map((o: any) => ({
      title: String(o.title ?? "Observation"), detail: String(o.detail ?? ""),
      severity: ["good", "attention", "priority"].includes(o.severity) ? o.severity : "attention",
      checkpoint: { t: String(o.checkpoint?.t ?? "0:00"), label: String(o.checkpoint?.label ?? "Address") },
    })) : [],
    strengths: arr(p.strengths), priorities: arr(p.priorities),
    drills: Array.isArray(p.drills) ? p.drills.slice(0, 5).map((d: any) => ({
      name: String(d.name ?? "Drill"), why: String(d.why ?? ""), how: String(d.how ?? ""), reps: String(d.reps ?? ""), tags: [],
    })) : [],
    plan: Array.isArray(p.plan) ? p.plan.slice(0, 7).map((d: any, i: number) => ({
      day: Number(d.day ?? i + 1), focus: String(d.focus ?? "Practice"),
      activities: Array.isArray(d.activities) ? d.activities.map(String) : [],
    })) : [],
    disclaimer: String(p.disclaimer ?? ""),
    generatedBy: "llm",
    createdAt: new Date().toISOString(),
  };
}
const num = (v: any) => Math.max(0, Math.min(100, Number(v) || 50));
const arr = (v: any) => (Array.isArray(v) ? v.map(String).slice(0, 6) : []);
