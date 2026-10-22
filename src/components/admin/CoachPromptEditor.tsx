"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";

export function CoachPromptEditor({ coachId, initialPrompt }: { coachId: string; initialPrompt: string }) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const save = async () => {
    setBusy(true); setSaved(false);
    const res = await fetch(`/api/coaches/${coachId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ systemPrompt: prompt }),
    });
    setBusy(false);
    if (res.ok) { setSaved(true); router.refresh(); } else alert("Save failed.");
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm text-ink-500">The system prompt is the coach&rsquo;s brain — edit it and every future review changes voice.</p>
        {saved && <span className="text-sm text-fairway-700">Saved ✓</span>}
      </div>
      <Textarea rows={18} value={prompt} onChange={e => setPrompt(e.target.value)} className="font-mono text-xs" />
      <div className="mt-3 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => setPrompt(initialPrompt)}>Reset</Button>
        <Button size="sm" onClick={save} disabled={busy}>{busy && <Spinner className="h-4 w-4" />} Save prompt</Button>
      </div>
    </div>
  );
}
