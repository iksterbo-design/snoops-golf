import type { Swing } from "@/types";
import type { CoachProfile } from "./data";

export function buildCoachPrompt(coach: CoachProfile, swing: Swing): { system: string; user: string } {
  const user = `GOLFER CONTEXT
- Skill level: ${swing.input.skillLevel}
- Club: ${swing.input.club}
- Stated goal: ${swing.input.goal}
- Self-reported issues: ${swing.input.issues.join(", ") || "none listed"}
- Additional context from the golfer: ${swing.input.context || "none provided"}
- Video duration: ${Math.round(swing.durationSec)}s, coach: ${coach.name}

OBSERVATION DATA (simulated pose/metric feed for this swing)
The analysis pipeline attached these observed checkpoints and metrics:
{{OBSERVATIONS}}

TASK
Produce a structured coaching review as JSON with exactly this shape:
{
  "summary": string,                 // 2-4 sentences in your voice
  "scores": { "contact": 0-100, "consistency": 0-100, "distance": 0-100, "tempo": 0-100, "sequencing": 0-100 },
  "observations": [ { "title": string, "detail": string, "severity": "good"|"attention"|"priority", "checkpoint": { "t": "0:12", "label": string } } ],
  "strengths": string[],             // 2-4 items, what is already working
  "priorities": string[],            // 1-3 items, highest-leverage changes
  "drills": [ { "name": string, "why": string, "how": string, "reps": string } ],   // 2-4 drills from your library
  "plan": [ { "day": 1..7, "focus": string, "activities": string[] } ],              // 7-day practice plan
  "disclaimer": string               // short honest caveat about the data quality
}

Rules: stay in your coaching voice; only prescribe drills from your own library; no unsupported performance claims; JSON only, no markdown fences.`;
  return { system: coach.systemPrompt, user };
}
