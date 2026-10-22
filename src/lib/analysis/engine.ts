import type { Analysis, Drill, Observation, Swing } from "@/types";
import type { CoachProfile } from "@/lib/coaches/data";
import { clamp, hashString, seededRand, pick } from "@/lib/utils";

/**
 * Structured coaching-review generator.
 *
 * In demo mode (no LLM key) this engine produces a realistic, coach-specific
 * review. It is deterministic per swing (seeded by swing id) so retries and
 * comparisons are stable. It is NOT genuine video analysis — every result
 * carries an explicit disclaimer and mode marker.
 */
export function generateMockAnalysis(swing: Swing, coach: CoachProfile): Analysis {
  const r = seededRand(hashString(swing.id + coach.id));
  const issues = new Set(swing.input.issues.flatMap(i => issueTags(i)));
  const skill = swing.input.skillLevel;

  // --- score baseline: driven by issues + club + a little swing-specific noise
  const base = { contact: 78, consistency: 74, distance: 72, tempo: 76, sequencing: 70 };
  for (const _tag of issues) {
    for (const key of Object.keys(base) as (keyof typeof base)[]) {
      base[key] = clamp(base[key] - 4 - Math.floor(r() * 5));
    }
  }
  for (const key of Object.keys(base) as (keyof typeof base)[]) {
    base[key] = clamp(base[key] + Math.floor(r() * 10) - 4 + (skill === "advanced" ? 3 : skill === "beginner" ? -4 : 0));
  }

  // --- drills: pick from THIS coach's library, matched to issue tags
  const scored = coach.preferredDrills
    .map(d => ({ d, s: d.tags.filter(t => issues.has(t)).length + r() * 0.6 }))
    .sort((a, b) => b.s - a.s);
  const drills: Drill[] = scored.slice(0, 3).map(x => x.d);

  // --- observations with video checkpoints
  const checkpoints = [
    { t: "0:00", label: "Address" }, { t: "0:03", label: "Takeaway" },
    { t: "0:06", label: "Top of backswing" }, { t: "0:09", label: "Transition" },
    { t: "0:12", label: "Impact" }, { t: "0:15", label: "Release" }, { t: "0:18", label: "Finish" },
  ];
  const obsSpecs: { title: string; detail: string; severity: Observation["severity"] }[] = [
    { title: `Contact pattern on the ${swing.input.club.toLowerCase()}`, detail: `Strike was ${base.contact >= 75 ? "centered with a shallow, downward blow" : "tending toward the toe with a slightly descending path"} at impact (checkpoint 0:12).`, severity: base.contact >= 75 ? "good" : "attention" },
    { title: "Tempo through transition", detail: base.tempo >= 75 ? "Backswing to downswing transition showed a smooth ~3:1 rhythm." : "Transition showed a slight rush from the top; the downswing started before the backswing fully loaded.", severity: base.tempo >= 75 ? "good" : "attention" },
    { title: "Setup priorities at address", detail: `Setup at 0:00 aligned with ${coach.name.split(" ")[0]}'s priorities: ${coach.observationFocus.slice(0, 3).join(", ")}.`, severity: "good" },
    { title: "Sequencing into and through impact", detail: base.sequencing >= 75 ? "Hips led the downswing with the arms following — the correct ground-up order." : "Arms appeared to out-run the body at the start of the downswing, costing both speed and consistency.", severity: base.sequencing >= 75 ? "good" : "priority" },
    { title: `Distance output for the ${swing.input.club.toLowerCase()}`, detail: base.distance >= 75 ? "Carry distance looked playable for scoring; no meaningful speed leak detected." : "Distance was limited by strike location and sequencing rather than by effort.", severity: base.distance >= 75 ? "good" : "attention" },
  ];
  const observations: Observation[] = obsSpecs.map((o, i) => ({
    ...o, checkpoint: checkpoints[(i * 2 + Math.floor(r() * 2)) % checkpoints.length],
  }));

  // --- strengths / priorities in the coach's voice
  const strengths: string[] = [];
  if (base.contact >= 75) strengths.push(`Solid, repeatable contact with the ${swing.input.club.toLowerCase()}`);
  if (base.tempo >= 75) strengths.push("A calm, athletic tempo through the transition");
  if (base.distance >= 75) strengths.push("Playable distance — no speed leaks worth chasing right now");
  if (strengths.length < 2) strengths.push(`A clear stated goal (${swing.input.goal.toLowerCase()}) — that is half the battle`);

  const priorities: string[] = [];
  if (issues.has("contact")) priorities.push(`Own the strike: two drills a week on centered contact with the ${swing.input.club.toLowerCase()}`);
  if (issues.has("sequencing") || issues.has("tempo")) priorities.push("One movement priority: let the body lead the downswing — do not stack fixes");
  if (issues.has("distance")) priorities.push("Speed comes from sequencing and strike, not from swinging harder");
  if (priorities.length === 0) priorities.push("Lock in consistency with a repeatable pre-shot routine and the wedge ladder");

  const plan = buildPlan(coach, drills, skill);

  const summary = coach.id === "michaelSchrempf"
    ? `Good news first: your contact and tempo are working. The practical fix is ${priorities[0].charAt(0).toLowerCase() + priorities[0].slice(1)} — no rebuild needed. Hit it solid and far enough and you're playing golf; let's maximize that.`
    : coach.id === "mattWastyn"
    ? `Here's the deal in plain English: your swing has a few moving parts fighting each other, and we're going to make them teammates. This week's theme is ${pick(["the barrel rolling, not sliding", "the glove staying tucked", "the wedge ladder building feel"], r)}. You're closer than you think. One drill, one reason, one next step.`
    : coach.id === "johnSchrempf"
    ? `Athletically speaking, your body is ${base.sequencing >= 75 ? "firing in the right order but needs to own the finish" : "starting the downswing before the ground work is done"}. This week: one movement priority — ${pick(["feel the pressure in the right heel through impact", "hold the finish like a balance pose", "turn like you're throwing a ball, not reaching"], r)}. Observable checkpoints are included for every drill.`
    : `We start where every good swing starts: grip, athletic setup, and the first move back. At your level we ${skill === "advanced" ? "refine the takeaway and hinge sequence" : "build a consistent setup and one-piece takeaway"}. The setup checkpoints below are exact — use them.`;

  return {
    summary, scores: base, observations, strengths, priorities, drills, plan,
    disclaimer: "Demo mode: this review was generated by a simulated analysis engine, not by genuine pose estimation on your video. Use it to explore the product and the coaching styles.",
    generatedBy: "mock-v1",
    createdAt: new Date().toISOString(),
  };
}

function issueTags(issueId: string): string[] {
  const map: Record<string, string[]> = {
    slice: ["contact", "path"], hook: ["contact", "path"], thin: ["contact", "lowpoint"],
    topspin: ["contact", "launch"], distance: ["speed", "sequencing"], tempo: ["tempo"],
    posture: ["posture", "footwork"], grip: ["grip", "setup"], alignment: ["alignment", "setup"],
    backswing: ["backswing", "sequencing"], consistency: ["contact", "consistency"],
    early_extension: ["footwork", "sequencing"],
  };
  return map[issueId] ?? [];
}

function buildPlan(coach: CoachProfile, drills: Drill[], skill: "beginner" | "intermediate" | "advanced") {
  const d = (i: number) => drills[i % drills.length]?.name ?? "Fundamental rehearsal";
  const intensity = skill === "beginner" ? "20 min" : skill === "advanced" ? "45 min" : "30 min";
  return [
    { day: 1, focus: "Foundation", activities: [`${intensity}: ${d(0)} — feel it slow first`, "10 minutes of rehearsal swings before any balls"] },
    { day: 2, focus: "Contact", activities: [`${intensity}: ${d(1)}`, "5 balls at 50% effort, then 10 at full speed"] },
    { day: 3, focus: "Rest or walk", activities: ["Light rehearsal at home (no balls)", "Film one slow-motion practice swing for yourself"] },
    { day: 4, focus: "Build", activities: [`${intensity}: ${d(0)} into ${d(1)}`, "Wedge distance ladder: 4 distances x 4 balls"] },
    { day: 5, focus: "Transfer", activities: ["Situational practice: 6 imagined course shots", "Keep score of quality contact, not just makes"] },
    { day: 6, focus: "Refine", activities: [`${intensity}: ${d(2)}`, "Your 3 worst swings of the session — write down the one feel fix"] },
    { day: 7, focus: "Play or test", activities: ["On-course: apply the one priority under pressure", "Film one swing to compare against this review"] },
  ];
}
