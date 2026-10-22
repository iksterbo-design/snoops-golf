import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const tones = {
  green: "bg-fairway-100 text-fairway-800",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-red-100 text-red-700",
  slate: "bg-ink-100 text-ink-500",
  blue: "bg-sky-100 text-sky-800",
  purple: "bg-purple-100 text-purple-800",
};
export function Badge({ tone = "slate", className, children }: { tone?: keyof typeof tones; className?: string; children: ReactNode }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", tones[tone], className)}>{children}</span>;
}
