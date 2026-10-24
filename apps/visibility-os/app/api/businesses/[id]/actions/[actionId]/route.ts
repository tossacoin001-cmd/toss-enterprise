import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireMutationAccess } from "@/lib/billing/access";
import { applyActionUpdate, type ExistingAction } from "@/lib/workspace/actions";

export const dynamic = "force-dynamic";

/**
 * Changes one action's status or note. The server decides who may: the action is looked up by its id,
 * its business and the signed-in owner together, so another user's action is simply not found.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; actionId: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const held = await requireMutationAccess(userId);
  if (held) return held;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Send a status or a note." }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Send a status or a note." }, { status: 400 });
  }

  const { id, actionId } = await params;
  try {
    const current = await db.actionItem.findFirst({ where: { id: actionId, businessId: id, business: { userId } } });
    if (!current) return NextResponse.json({ error: "We could not find that action." }, { status: 404 });

    const result = applyActionUpdate(current as unknown as ExistingAction, body, Date.now());
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    if (Object.keys(result.patch).length === 0) return NextResponse.json({ item: current });

    const item = await db.actionItem.update({ where: { id: actionId }, data: result.patch });
    return NextResponse.json({ item });
  } catch (e) {
    console.error("[PATCH /api/businesses/:id/actions/:actionId]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Something went wrong on our side. Please try again." }, { status: 500 });
  }
}
