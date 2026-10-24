import { randomBytes } from "node:crypto";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { appUrl } from "@/lib/app-url";
import { checkoutAvailable, isInterval, isPlanId, priceFor } from "@/lib/billing/plans";

export const dynamic = "force-dynamic";

/**
 * Starts a Paystack payment for one plan. The amount comes from our price list only. Nothing is switched on
 * here: the plan changes when Paystack's signed webhook arrives and the amount matches. ADR-0021.
 */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!checkoutAvailable({ secretKey: key })) return NextResponse.json({ error: "Payments are not open yet. We will tell you when they are." }, { status: 503 });

  const body: unknown = await req.json().catch(() => null);
  const plan = body && typeof body === "object" ? (body as { plan?: unknown }).plan : undefined;
  const interval = body && typeof body === "object" ? (body as { interval?: unknown }).interval : undefined;
  if (!isPlanId(plan) || !isInterval(interval)) return NextResponse.json({ error: "Choose a package and monthly or yearly." }, { status: 400 });

  const email = (await currentUser().catch(() => null))?.emailAddresses[0]?.emailAddress;
  if (!email) return NextResponse.json({ error: "We could not find your email address. Please sign in again." }, { status: 400 });

  const price = priceFor(plan, interval);
  const reference = `vos_${randomBytes(12).toString("hex")}`;
  try {
    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        email,
        amount: price.amountMinor,
        currency: price.currency,
        reference,
        callback_url: `${appUrl()}/settings?paid=1`,
        metadata: { userId, plan, interval },
      }),
    });
    const data = (await res.json().catch(() => null)) as { status?: boolean; data?: { authorization_url?: string } } | null;
    const url = data?.data?.authorization_url;
    if (!res.ok || !data?.status || !url) return NextResponse.json({ error: "We could not start the payment. Please try again in a moment." }, { status: 502 });
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ error: "We could not start the payment. Please try again in a moment." }, { status: 502 });
  }
}
