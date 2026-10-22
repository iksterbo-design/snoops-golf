"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { Spinner, ProgressBar } from "@/components/ui/Spinner";

const STAGES = ["Receiving video", "Detecting pose & checkpoints", "Coach analysis", "Building your review"];

export default function ProcessingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [stage, setStage] = useState(0);
  const [status, setStatus] = useState<string>("processing");

  useEffect(() => {
    const interval = setInterval(() => setStage(s => Math.min(s + 1, STAGES.length - 1)), 900);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let stop = false;
    const poll = async () => {
      try {
        const res = await fetch(`/api/swings/${id}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setStatus(data.swing?.status ?? "processing");
        if (data.swing?.status === "completed") { router.replace(`/review/${id}`); return; }
        if (data.swing?.status === "failed") { router.replace(`/review/${id}?failed=1`); return; }
        if (!stop) setTimeout(poll, 1200);
      } catch { if (!stop) setTimeout(poll, 2000); }
    };
    poll();
    return () => { stop = true; };
  }, [id, router]);

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <Card><CardBody className="py-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-fairway-50 text-fairway-600">
          <Spinner className="h-8 w-8" />
        </div>
        <h1 className="mt-5 text-xl font-bold">Your coach is watching the tape…</h1>
        <p className="mt-1 text-sm text-ink-500">Status: <span className="font-medium capitalize">{status}</span></p>
        <ProgressBar value={(stage + 1) / STAGES.length * 100} className="mx-auto mt-8 max-w-sm" />
        <div className="mt-6 space-y-2 text-left max-w-sm mx-auto">
          {STAGES.map((s, i) => (
            <div key={s} className={`flex items-center gap-2 text-sm ${i <= stage ? "text-ink-900" : "text-ink-300"}`}>
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${i < stage ? "bg-fairway-600 text-white" : i === stage ? "bg-fairway-100 text-fairway-700" : "bg-ink-100"}`}>
                {i < stage ? "✓" : i + 1}
              </span>
              {s}
            </div>
          ))}
        </div>
      </CardBody></Card>
    </div>
  );
}
