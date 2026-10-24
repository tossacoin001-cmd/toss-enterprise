import { db } from "@/lib/db";
import { planPrice } from "@/lib/billing/plans";
import { applyBillingEvent, verifyHash, type BillingDb } from "@/lib/billing/webhook";

export const dynamic = "force-dynamic";

/**
 * Flutterwave payment events. Off until FLUTTERWAVE_WEBHOOK_HASH is set; a request with the wrong hash is
 * refused before anything is read or written. ADR-0019.
 */
export async function POST(req: Request) {
  const secret = process.env.FLUTTERWAVE_WEBHOOK_HASH;
  if (!secret) return new Response("Billing is not switched on", { status: 503 });
  if (!verifyHash(req.headers.get("verif-hash"), secret)) return new Response("Invalid signature", { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid body", { status: 400 });
  }
  try {
    const outcome = await applyBillingEvent(db as unknown as BillingDb, body, planPrice, Date.now());
    return Response.json({ outcome });
  } catch (e) {
    console.error("[webhook flutterwave]", e instanceof Error ? e.message : "failed");
    return new Response("Could not process", { status: 500 });
  }
}
