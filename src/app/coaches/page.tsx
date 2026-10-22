import Link from "next/link";
import { COACHES } from "@/lib/coaches/data";
import { CoachCard } from "@/components/ui/CoachCard";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const metadata = { title: "Choose your coach — AI Golf Coach" };

export default function CoachesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">Choose your coach</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink-500">
        These are four different coaching minds. The analysis, drills, and plan all come from the coach you pick —
        same swing, four different reviews.
      </p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
        {COACHES.map(c => (
          <div key={c.id} className="space-y-3">
            <CoachCard coach={c} />
            <Card><CardBody className="pt-4 text-sm text-ink-500">
              <div className="flex flex-wrap gap-1.5">
                {c.preferredDrills.slice(0, 4).map(d => <Badge key={d.name} tone="blue">{d.name}</Badge>)}
              </div>
              <Link href={`/swings/new?coach=${c.id}`} className="mt-3 inline-block font-semibold text-fairway-700 hover:underline">
                Swing with {c.name.split(" ")[0]} &rarr;
              </Link>
            </CardBody></Card>
          </div>
        ))}
      </div>
    </div>
  );
}
