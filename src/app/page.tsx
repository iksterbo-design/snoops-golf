import Link from "next/link";
import { COACHES } from "@/lib/coaches/data";
import { CoachAvatar } from "@/components/ui/CoachCard";
import { Badge } from "@/components/ui/Badge";
import { env } from "@/lib/env";

const steps = [
  { n: "1", title: "Pick your coach", body: "Four distinct teaching voices — pragmatic, fun, athletic, or setup-obsessed. Not the same advice with a different name." },
  { n: "2", title: "Upload your swing", body: "Add context: club, skill level, goal, and what you feel. The coach uses it all." },
  { n: "3", title: "Get your review", body: "Structured feedback with video checkpoints, drills from that coach's library, and a 7-day practice plan." },
];

export default function LandingPage() {
  return (
    <div>
      <section className="hero-gradient text-white">
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:pt-24">
          <Badge tone="green" className="mb-4">{env.demoMode ? "Demo build — full journey works offline" : "Live build"}</Badge>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight sm:text-6xl">
            Four coaches. Four real voices.<br />One swing, reviewed your way.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/80">
            AI Golf Coach pairs you with a coaching personality that fits how you learn — then turns your swing video into
            structured feedback, video checkpoints, drills, and a 7-day plan. Every coach thinks differently, so every review does too.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className="rounded-lg bg-fairway-500 px-6 py-3 text-base font-semibold text-white hover:bg-fairway-400 transition-colors">
              Create free account
            </Link>
            <Link href="/login" className="rounded-lg border border-white/30 px-6 py-3 text-base font-semibold text-white hover:bg-white/10 transition-colors">
              Sign in
            </Link>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {steps.map(s => (
              <div key={s.n} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-fairway-500/20 text-fairway-300 font-bold">{s.n}</div>
                <h3 className="mt-3 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-white/70">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">Meet the roster</h2>
            <p className="mt-1 text-ink-500">Each coach has their own philosophy, drill library, and voice in the analysis engine.</p>
          </div>
          <Link href="/coaches" className="text-sm font-medium text-fairway-700 hover:underline">Compare all four &rarr;</Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COACHES.map(c => (
            <Link key={c.id} href="/coaches" className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lg">
              <CoachAvatar initials={c.initials} accent={c.accent} size={10} />
              <h3 className="mt-3 font-bold">{c.name}</h3>
              <p className="mt-1 text-sm text-ink-500">{c.tagline}</p>
              <p className="mt-2 text-xs italic text-ink-700">&ldquo;{c.philosophy}&rdquo;</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-ink-100 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:grid-cols-3">
          {[
            ["Structured, not generic", "Scores, observations tied to video checkpoints, strengths, and priorities — the same shape for every coach, filled with that coach's thinking."],
            ["Progress you can see", "Every review is saved. Compare scores and misses across swings to watch the trend, not just the latest video."],
            ["Built to extend", "Modular pipeline: swap in real pose estimation (MediaPipe/MoveNet), more coaches, subscriptions, a coach marketplace, or a mobile app."],
          ].map(([t, b]) => (
            <div key={t}>
              <h3 className="font-bold text-ink-900">{t}</h3>
              <p className="mt-2 text-sm text-ink-500">{b}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
