import "server-only";
import { getStore } from "@/lib/db";
import { runAnalysis } from "./run";

/**
 * Fire-and-forget completion for `next dev` (in-process timer).
 * In serverless, GET /api/swings/[id] performs the same completion lazily.
 */
export function completeSwing(swingId: string, delayMs = 2500): void {
  setTimeout(async () => {
    try {
      const analysis = await runAnalysis(swingId);
      const store = getStore();
      await store.updateSwing(swingId, { status: "completed", analysis, error: null });
      console.log(`[analysis] swing ${swingId} completed`);
    } catch (e: any) {
      const store = getStore();
      await store.updateSwing(swingId, { status: "failed", error: e?.message ?? "Analysis failed" });
      console.error(`[analysis] swing ${swingId} failed:`, e);
    }
  }, delayMs);
}
