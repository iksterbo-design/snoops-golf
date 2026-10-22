"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { PRICE_REVIEW_CENTS } from "@/lib/env.client";

function CheckoutInner() {
  const router = useRouter();
  const params = useSearchParams();
  const swingId = params.get("swing");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pay = async () => {
    if (!swingId) { router.push("/coaches"); return; }
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Checkout failed."); return; }
      if (data.mode === "stripe" && data.url) { window.location.href = data.url; return; }
      router.push(`/upload?swing=${swingId}`);
    } catch { setError("Network error. Try again."); }
    finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-bold">Checkout</h1>
      <p className="mt-1 text-sm text-ink-500">One payment unlocks this swing review. Demo mode: simulated, no card needed.</p>
      <Card className="mt-6">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>AI Swing Review</CardTitle>
          <Badge tone="amber">Demo checkout</Badge>
        </CardHeader>
        <CardBody>
          <div className="flex items-center justify-between border-b border-ink-100 pb-4">
            <div>
              <div className="font-semibold">Structured coaching review</div>
              <div className="text-sm text-ink-500">Coach-specific feedback, video checkpoints, drills, 7-day plan</div>
            </div>
            <div className="text-xl font-bold">${(PRICE_REVIEW_CENTS / 100).toFixed(2)}</div>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-ink-500">
            <li>✓ Coach-specific voice — not generic advice</li>
            <li>✓ Observations tied to video checkpoints</li>
            <li>✓ Drills from your coach&rsquo;s library</li>
            <li>✓ 7-day practice plan + saved history</li>
          </ul>
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          <Button className="mt-6 w-full" size="lg" onClick={pay} disabled={busy}>
            {busy ? <><Spinner className="h-4 w-4" /> Processing…</> : `Pay $${(PRICE_REVIEW_CENTS / 100).toFixed(2)} (simulated)`}
          </Button>
          <p className="mt-3 text-center text-xs text-ink-500">
            In demo mode no real charge occurs. Configure Stripe keys to enable live checkout.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}

export default function CheckoutPage() {
  return <Suspense fallback={<div className="flex justify-center py-20 text-ink-500"><Spinner className="mr-2" /> Loading…</div>}><CheckoutInner /></Suspense>;
}
