import { cn } from "@/lib/utils";

export function ScoreRing({ value, label, size = 92 }: { value: number; label: string; size?: number }) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value)) / 100;
  const color = value >= 80 ? "#16a34a" : value >= 65 ? "#d97706" : "#dc2626";
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} stroke="#e2e8f0" strokeWidth={stroke} fill="none" />
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round" style={{ transition: "stroke-dashoffset .6s ease" }} />
      </svg>
      <div className="text-center -mt-1">
        <div className={cn("text-lg font-bold leading-none")} style={{ color }}>{Math.round(value)}</div>
        <div className="mt-1 text-[11px] font-medium uppercase tracking-wide text-ink-500">{label}</div>
      </div>
    </div>
  );
}
