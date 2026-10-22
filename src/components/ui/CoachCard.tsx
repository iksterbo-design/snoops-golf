import type { Coach } from "@/types";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { cn } from "@/lib/utils";

export function CoachAvatar({ initials, accent, size = 12 }: { initials: string; accent: string; size?: number }) {
  return (
    <div className={cn("flex items-center justify-center rounded-full bg-gradient-to-br font-bold text-white", accent)}
      style={{ width: size * 4, height: size * 4, fontSize: size * 1.6 }}>
      {initials}
    </div>
  );
}

export function CoachCard({ coach, selected, onSelect }: { coach: Coach & { lessonStyle?: string[]; philosophy?: string; communication?: string[] }; selected?: boolean; onSelect?: () => void }) {
  return (
    <button type="button" onClick={onSelect}
      className={cn("w-full text-left", onSelect && "cursor-pointer")}>
      <Card className={cn("h-full transition-all hover:shadow-lg hover:-translate-y-0.5", selected && "ring-2 ring-fairway-500 border-fairway-500")}>
        <div className="p-6">
          <div className="flex items-start justify-between">
            <CoachAvatar initials={coach.initials} accent={coach.accent} />
            {selected && <Badge tone="green">Selected</Badge>}
          </div>
          <h3 className="mt-4 text-lg font-bold text-ink-900">{coach.name}</h3>
          <p className="mt-1 text-sm text-ink-500">{coach.tagline}</p>
          <p className="mt-3 text-sm italic text-ink-700">&ldquo;{coach.philosophy}&rdquo;</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {coach.communication?.slice(0, 4).map(c => <Badge key={c} tone="slate">{c}</Badge>)}
          </div>
        </div>
      </Card>
    </button>
  );
}
