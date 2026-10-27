import Link from "next/link";
import { COACHES } from "@/lib/coaches/data";
import { STAFF } from "@/lib/staff/data";
import { CoachAvatar } from "@/components/ui/CoachCard";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Coaches & Staff menu — AI Golf Coach" };

export default function MenuPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-ink-900">Coaches &amp; Staff</h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-500">
            The full roster. Pick a coach to start a swing review, or reach out to a staff member for help.
          </p>
        </div>
        <Link href="/coaches">
          <Button variant="outline" size="sm">Compare all coaches &rarr;</Button>
        </Link>
      </div>

      <section className="mt-10">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-ink-900">Coaching roster</h2>
          <Badge tone="blue">{COACHES.length} coaches</Badge>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {COACHES.map(c => (
            <Card key={c.id} className="overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg">
              <CardBody className="pt-6">
                <div className="flex items-start gap-4">
                  <CoachAvatar initials={c.initials} accent={c.accent} size={12} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-ink-900">{c.name}</h3>
                      <Badge tone={c.active ? "green" : "red"}>{c.active ? "active" : "inactive"}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-ink-500">{c.tagline}</p>
                    <p className="mt-2 text-xs italic text-ink-700">&ldquo;{c.philosophy}&rdquo;</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {c.communication.slice(0, 4).map(x => <Badge key={x} tone="slate">{x}</Badge>)}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link href={`/swings/new?coach=${c.id}`}>
                        <Button size="sm">Swing with {c.name.split(" ")[0]} &rarr;</Button>
                      </Link>
                      <Link href="/coaches">
                        <Button variant="ghost" size="sm">Details</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-ink-900">Staff</h2>
          <Badge tone="amber">{STAFF.length} members</Badge>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STAFF.map(s => (
            <Card key={s.id} className="transition-all hover:-translate-y-0.5 hover:shadow-lg">
              <CardBody className="pt-6">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-lg font-bold text-white ${s.accent}`}>
                  {s.initials}
                </div>
                <h3 className="mt-3 font-bold text-ink-900">{s.name}</h3>
                <p className="text-xs font-semibold text-fairway-700">{s.role}</p>
                <p className="mt-2 text-sm text-ink-500">{s.bio}</p>
                {s.email && (
                  <a href={`mailto:${s.email}`} className="mt-3 inline-block text-xs text-ink-400 hover:text-fairway-700">
                    {s.email}
                  </a>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
