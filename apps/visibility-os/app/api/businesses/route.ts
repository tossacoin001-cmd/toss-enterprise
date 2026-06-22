import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, category, city, country, googleBizUrl, phoneNumber, website, instagramHandle } = body;

  if (!name || name.trim().length < 2) {
    return NextResponse.json({ error: "Business name is required" }, { status: 400 });
  }

  try {
    // Ensure the user record exists (created by Clerk webhook, but create if missing)
    await db.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: "" },
    });

    const count = await db.business.count({ where: { userId } });
    if (count >= 3) {
      return NextResponse.json({ error: "Business limit reached for your plan" }, { status: 403 });
    }

    const business = await db.business.create({
      data: {
        name: name.trim(),
        category: category || null,
        city: city?.trim() || null,
        country: country || "NG",
        googleBizUrl: googleBizUrl?.trim() || null,
        phoneNumber: phoneNumber?.trim() || null,
        website: website?.trim() || null,
        instagramHandle: instagramHandle?.trim() || null,
        userId,
      },
    });

    return NextResponse.json({ business }, { status: 201 });
  } catch (e) {
    console.error("[POST /api/businesses]", e);
    return NextResponse.json({ error: "Failed to save business" }, { status: 500 });
  }
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const businesses = await db.business.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        visibilityScores: { orderBy: { recordedAt: "desc" }, take: 1 },
        _count: { select: { actionItems: true } },
      },
    });
    return NextResponse.json({ businesses });
  } catch (e) {
    console.error("[GET /api/businesses]", e);
    return NextResponse.json({ businesses: [] });
  }
}
