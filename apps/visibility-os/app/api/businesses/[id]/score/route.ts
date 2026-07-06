import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { scoreBusiness } from "@/lib/scoring";

export const maxDuration = 30;

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const business = await db.business.findFirst({ where: { id, userId } });
    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const result = await scoreBusiness(business);

    const [score] = await db.$transaction([
      db.visibilityScore.create({
        data: {
          businessId: business.id,
          total: result.total,
          googleScore: result.googleScore,
          socialScore: result.socialScore,
          websiteScore: result.websiteScore,
        },
      }),
      // Regenerate open recommendations; in-progress and done items are kept.
      db.actionItem.deleteMany({ where: { businessId: business.id, status: "PENDING" } }),
      db.actionItem.createMany({
        data: result.actionItems.map((item) => ({
          businessId: business.id,
          title: item.title,
          description: item.description,
          priority: item.priority,
          category: item.category,
        })),
      }),
    ]);

    return NextResponse.json(
      { score, actionItemCount: result.actionItems.length },
      { status: 201 }
    );
  } catch (e) {
    console.error("[POST /api/businesses/:id/score]", e);
    return NextResponse.json({ error: "Audit failed. Please try again." }, { status: 500 });
  }
}
