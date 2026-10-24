import { db } from "@/lib/db";
import { priceFor } from "@/lib/billing/plans";
import { applyBillingEvent, verifySignature, type BillingDb } from "@/lib/billing/webhook";

export const dynamic = "force-dynamic";

/**
 * Paystack payment events. Closed until PAYSTACK_SECRET_KEY is set; a request with a wrong or missing
 * signature is refused before anything is read or written. ADR-0021.
 */
export async function POST(req: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return new Response("Billing is not switched on", { status: 503 });

  const raw = await req.text();
  if (!verifySignature(raw, req.headers.get("x-paystack-signature"), secret)) return new Response("Invalid signature", { status: 401 });

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response("Invalid body", { status: 400 });
  }
  try {
    const outcome = await applyBillingEvent(db as unknown as BillingDb, body, priceFor, Date.now());
    return Response.json({ outcome });
  } catch (e) {
    console.error("[webhook paystack]", e instanceof Error ? e.message : "failed");
    return new Response("Could not process", { status: 500 });
  }
}
