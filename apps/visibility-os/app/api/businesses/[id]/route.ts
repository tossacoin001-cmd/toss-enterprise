import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getPlaceDetails, isPlacesConfigured } from "@/lib/google-places";
import { runAndPersistScore } from "@/lib/run-weekly-score";

export const maxDuration = 30;

const connectSchema = z.object({
  googlePlaceId: z.string().trim().min(1).max(120),
  placeSessionToken: z.string().trim().max(100).optional(),
});

/** Connects a Google listing to an existing business, then re-scores it so
 * the owner sees the effect straight away. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isPlacesConfigured()) {
    return NextResponse.json({ error: "Google connection opens soon." }, { status: 503 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const parsed = connectSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Pick your business from the Google results." }, { status: 400 });
  }

  const { id } = await params;
  try {
    const business = await db.business.findFirst({
      where: { id, userId },
      include: { visibilityScores: { orderBy: { recordedAt: "desc" }, take: 1 } },
    });
    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });

    // Confirm the id is a real listing rather than trusting the client.
    const details = await getPlaceDetails(parsed.data.googlePlaceId, parsed.data.placeSessionToken);
    if (!details) {
      return NextResponse.json(
        { error: "We could not confirm that listing on Google. Please search again." },
        { status: 400 }
      );
    }

    await db.business.update({ where: { id }, data: { googlePlaceId: details.placeId } });
    const { score } = await runAndPersistScore({ ...business, googlePlaceId: details.placeId });
    return NextResponse.json({ score });
  } catch (e) {
    console.error("[PATCH /api/businesses/:id]", e);
    return NextResponse.json({ error: "Could not connect the listing. Please try again." }, { status: 500 });
  }
}
