import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Turns the weekly email on or off for the signed-in account. Allowed after the trial too. */
export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const body: unknown = await req.json().catch(() => null);
  const weeklyEmail = body && typeof body === "object" ? (body as { weeklyEmail?: unknown }).weeklyEmail : undefined;
  if (typeof weeklyEmail !== "boolean") return NextResponse.json({ error: "Send weeklyEmail as true or false." }, { status: 400 });
  try {
    const r = await db.user.updateMany({ where: { id: userId }, data: { digestOptOut: !weeklyEmail } });
    if (r.count === 0) return NextResponse.json({ error: "We could not find your account." }, { status: 404 });
    return NextResponse.json({ weeklyEmail });
  } catch (e) {
    console.error("[PATCH /api/account/preferences]", e instanceof Error ? e.message : "failed");
    return NextResponse.json({ error: "Something went wrong on our side. Please try again." }, { status: 500 });
  }
}
