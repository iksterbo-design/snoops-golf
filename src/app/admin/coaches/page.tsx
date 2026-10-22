import Link from "next/link";
import { COACHES } from "@/lib/coaches/data";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CoachAvatar } from "@/components/ui/CoachCard";

export const dynamic = "force-dynamic";

export default async function AdminCoachesPage() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {COACHES.map(c => (
        <Card key={c.id}>
          <CardBody className="pt-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CoachAvatar initials={c.initials} accent={c.accent} size={10} />
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs text-ink-500">{c.id} · {c.preferredDrills.length} drills in library</div>
                </div>
              </div>
              <Badge tone={c.active ? "green" : "red"}>{c.active ? "active" : "inactive"}</Badge>
            </div>
            <p className="mt-3 text-sm text-ink-500">{c.positioning}</p>
            <p className="mt-2 text-xs italic text-ink-700">&ldquo;{c.philosophy}&rdquo;</p>
            <Link href={`/admin/coaches/${c.id}`}>
              <button className="mt-4 rounded-lg bg-ink-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-ink-700">
                Edit prompt template &rarr;
              </button>
            </Link>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
