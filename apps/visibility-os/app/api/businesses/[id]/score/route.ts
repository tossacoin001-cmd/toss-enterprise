import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { runAndPersistScore } from "@/lib/run-weekly-score";

export const maxDuration = 30;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  let placeSessionToken: string | undefined;
  try {
    const body = await req.json();
    if (typeof body?.placeSessionToken === "string") placeSessionToken = body.placeSessionToken;
  } catch {
    // No body (e.g. the dashboard's plain "Re-run Audit" call) - fine, no session to bundle.
  }

  try {
    const business = await db.business.findFirst({
      where: { id, userId },
      include: { visibilityScores: { orderBy: { recordedAt: "desc" }, take: 1 } },
    });
    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const { score, actionItems } = await runAndPersistScore(business, placeSessionToken, { recheck: false });

    return NextResponse.json(
      { score, actionItemCount: actionItems.length },
      { status: 201 }
    );
  } catch (e) {
    console.error("[POST /api/businesses/:id/score]", e);
    return NextResponse.json({ error: "Audit failed. Please try again." }, { status: 500 });
  }
}
