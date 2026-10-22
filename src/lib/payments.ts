import "server-only";
import { env, PRICE_REVIEW_CENTS } from "./env";
import { getStore } from "./db";
import type { Payment } from "@/types";
import { uid } from "./utils";

/** Checkout abstraction: demo mode simulates success; live mode creates a Stripe session. */
export async function createCheckout(userId: string): Promise<{ mode: "demo" | "stripe"; url?: string; payment: Payment }> {
  const store = getStore();
  if (!env.stripe.enabled) {
    const payment: Payment = {
      id: uid("pay"), userId, swingId: null, amountCents: PRICE_REVIEW_CENTS,
      currency: "usd", provider: "demo", status: "succeeded", createdAt: new Date().toISOString(),
    };
    await store.createPayment(payment);
    return { mode: "demo", payment };
  }
  const Stripe = require("stripe");
  const stripe = new Stripe(env.stripe.secretKey);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ quantity: 1, price_data: { currency: "usd", unit_amount: PRICE_REVIEW_CENTS, product_data: { name: "AI Swing Review" } } }],
    success_url: `${env.appUrl}/dashboard?paid=1`,
    cancel_url: `${env.appUrl}/checkout`,
    client_reference_id: userId, metadata: { userId },
  });
  const payment: Payment = {
    id: uid("pay"), userId, swingId: null, amountCents: PRICE_REVIEW_CENTS,
    currency: "usd", provider: "stripe", status: "pending", createdAt: new Date().toISOString(),
  };
  await store.createPayment(payment);
  return { mode: "stripe", url: session.url ?? undefined, payment };
}
