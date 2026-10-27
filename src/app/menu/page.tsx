import Link from "next/link";
import { COACHES } from "@/lib/coaches/data";
import { STAFF } from "@/lib/staff/data";
import { CoachAvatar } from "@/components/ui/CoachCard";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const metadata = { title: "Coaches & Staff menu — AI Golf Coach" };

export default function MenuPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">Coaches &amp; Staff menu</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink-500">
        Browse the coaching roster and the people behind the platform. Pick a coach to start a review, or reach out to staff for help.
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-ink-900">Coaches</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COACHES.map(c => (
            <Link key={c.id} href={`/coaches`} className="block">
              <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-lg">
                <CardBody className="pt-5">
                  <CoachAvatar initials={c.initials} accent={c.accent} size={10} />
                  <h3 className="mt-3 font-bold text-ink-900">{c.name}</h3>
                  <p className="mt-1 text-sm text-ink-500">{c.tagline}</p>
                  <div className="mt-3">
                    <Badge tone={c.active ? "green" : "red"}>{c.active ? "active" : "inactive"}</Badge>
                  </div>
                  <span className="mt-3 inline-block text-sm font-semibold text-fairway-700">View coach &rarr;</span>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-ink-900">Staff</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAFF.map(s => (
            <Card key={s.id} className="h-full">
              <CardBody className="pt-5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br font-bold text-white ${s.accent}`}>
                  {s.initials}
                </div>
                <h3 className="mt-3 font-bold text-ink-900">{s.name}</h3>
                <p className="text-xs font-medium text-fairway-700">{s.role}</p>
                <p className="mt-2 text-sm text-ink-500">{s.bio}</p>
                {s.email && <p className="mt-2 text-xs text-ink-400">{s.email}</p>}
              </CardBody>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
