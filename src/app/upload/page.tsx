"use client";

import { Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner, ProgressBar } from "@/components/ui/Spinner";

function UploadInner() {
  const router = useRouter();
  const params = useSearchParams();
  const swingId = params.get("swing");
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const choose = (f: File | null) => {
    setFile(f); setError(null);
    if (preview) URL.revokeObjectURL(preview);
    if (f) {
      setPreview(URL.createObjectURL(f));
      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = () => { setDuration(Math.round(v.duration) || 0); URL.revokeObjectURL(v.src); };
      v.src = URL.createObjectURL(f);
    } else setPreview(null);
  };

  const submit = async () => {
    if (!swingId) { router.push("/coaches"); return; }
    if (!file) { setError("Choose a video first."); return; }
    setBusy(true); setError(null); setProgress(10);
    try {
      const form = new FormData();
      form.append("video", file);
      form.append("duration", String(duration));
      const xhr = new XMLHttpRequest();
      const uploadDone = new Promise<boolean>((resolve) => {
        xhr.upload.onprogress = e => { if (e.lengthComputable) setProgress(10 + Math.round((e.loaded / e.total) * 60)); };
        xhr.onload = () => resolve(xhr.status >= 200 && xhr.status < 300);
        xhr.onerror = () => resolve(false);
      });
      xhr.open("POST", `/api/upload?swingId=${encodeURIComponent(swingId)}`);
      xhr.send(form);
      if (!(await uploadDone)) { setError("Upload failed. Try a smaller file."); return; }

      setProgress(80);
      await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ swingId }) });
      setProgress(100);
      router.push(`/processing/${swingId}`);
    } catch { setError("Network error. Try again."); }
    finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold">Upload your swing</h1>
      <p className="mt-1 text-sm text-ink-500">A short clip (3–60s) works best. Face-on or down-the-line, phone video is fine.</p>
      <Card className="mt-6">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Swing video</CardTitle>
          <Badge tone="amber">Demo upload</Badge>
        </CardHeader>
        <CardBody>
          <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={e => choose(e.target.files?.[0] ?? null)} />
          {!preview ? (
            <button type="button" onClick={() => inputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink-300 bg-ink-100/50 px-6 py-14 text-ink-500 transition-colors hover:border-fairway-500 hover:text-fairway-700">
              <span className="text-3xl">🎥</span>
              <span className="mt-2 font-medium">Tap to choose a video</span>
              <span className="text-xs">MP4, MOV, WebM — up to ~500MB</span>
            </button>
          ) : (
            <div>
              <video src={preview} controls className="w-full rounded-xl bg-black" style={{ maxHeight: 380 }} />
              <div className="mt-3 flex items-center justify-between text-sm text-ink-500">
                <span className="truncate">{file?.name} · {duration}s</span>
                <button type="button" className="text-red-600 hover:underline" onClick={() => choose(null)}>Remove</button>
              </div>
            </div>
          )}
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          {busy && <ProgressBar value={progress} className="mt-4" />}
          <Button className="mt-6 w-full" size="lg" onClick={submit} disabled={busy}>
            {busy ? "Uploading…" : "Upload & start analysis"}
          </Button>
          <p className="mt-3 text-center text-xs text-ink-500">
            Demo mode stores the file locally and simulates pose analysis. Configure Firebase Storage + a pose service for production.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}

export default function UploadPage() {
  return <Suspense fallback={<div className="flex justify-center py-20 text-ink-500"><Spinner className="mr-2" /> Loading…</div>}><UploadInner /></Suspense>;
}
