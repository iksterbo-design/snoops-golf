"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";
import { Modal } from "./ui/Modal";
import { Spinner } from "./ui/Spinner";

export function DeleteSwingButton({ swingId, redirectTo }: { swingId: string; redirectTo?: string }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const confirm = async () => {
    setBusy(true);
    await fetch(`/api/swings/${swingId}`, { method: "DELETE" });
    setBusy(false); setOpen(false);
    router.push(redirectTo ?? "/history");
    router.refresh();
  };

  return (
    <>
      <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => setOpen(true)}>Delete</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Delete this swing?">
        <p className="text-sm text-ink-500">This removes the video, analysis, and review from your history. This cannot be undone.</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="danger" size="sm" onClick={confirm} disabled={busy}>{busy && <Spinner className="h-4 w-4" />} Delete forever</Button>
        </div>
      </Modal>
    </>
  );
}
