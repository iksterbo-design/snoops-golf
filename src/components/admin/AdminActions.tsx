"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

export function RetryButton({ swingId }: { swingId: string }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const run = async () => {
    setBusy(true);
    await fetch(`/api/swings/${swingId}/retry`, { method: "POST" });
    setBusy(false);
    router.refresh();
  };
  return <Button variant="outline" size="sm" onClick={run} disabled={busy}>{busy && <Spinner className="h-3 w-3" />} Retry</Button>;
}

export function AdminDeleteSwingButton({ swingId }: { swingId: string }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const run = async () => {
    setBusy(true);
    await fetch(`/api/swings/${swingId}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  };
  return <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={run} disabled={busy}>{busy ? <Spinner className="h-3 w-3" /> : "Delete"}</Button>;
}
