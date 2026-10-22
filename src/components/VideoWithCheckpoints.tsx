"use client";

import { useRef, useState } from "react";
import type { Observation } from "@/types";
import { Badge } from "./ui/Badge";
import { cn } from "@/lib/utils";

function toSec(t: string): number {
  const parts = t.split(":").map(Number);
  return parts.length === 2 ? parts[0] * 60 + parts[1] : Number(t) || 0;
}

export function VideoWithCheckpoints({ swingId, videoName, observations }: { swingId: string; videoName: string | null; observations: Observation[] }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(0);

  const seek = (t: string) => {
    const v = videoRef.current;
    if (v) { v.currentTime = toSec(t); v.play().catch(() => undefined); }
    setActive(observations.findIndex(o => o.checkpoint.t === t));
  };

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <video ref={videoRef} src={`/api/media/${swingId}`} controls preload="metadata"
          className="w-full rounded-xl bg-black" style={{ maxHeight: 420 }} />
        <p className="mt-2 truncate text-xs text-ink-500">{videoName ?? "Swing video"}</p>
      </div>
      <div className="lg:col-span-2">
        <h4 className="text-sm font-semibold text-ink-900">Video checkpoints</h4>
        <div className="mt-2 space-y-2">
          {observations.map((o, i) => (
            <button key={i} onClick={() => seek(o.checkpoint.t)}
              className={cn("flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                active === i ? "border-fairway-500 bg-fairway-50" : "border-ink-100 bg-white hover:border-ink-300")}>
              <span className="checkpoint-marker">{o.checkpoint.t}</span>
              <span className="flex-1 truncate">{o.checkpoint.label} — {o.title}</span>
              <Badge tone={o.severity === "good" ? "green" : o.severity === "attention" ? "amber" : "red"}>
                {o.severity === "good" ? "Working" : o.severity}
              </Badge>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
