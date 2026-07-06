import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const optionalTrimmed = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null));

const createBusinessSchema = z.object({
  name: z.string().trim().min(2, "Business name is required").max(120),
  category: optionalTrimmed(80),
  city: optionalTrimmed(80),
  country: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{2,3}$/, "Country must be a 2-3 letter code")
    .transform((v) => v.toUpperCase())
    .default("NG"),
  googleBizUrl: optionalTrimmed(300),
  phoneNumber: optionalTrimmed(30),
  website: optionalTrimmed(300),
  instagramHandle: optionalTrimmed(60).transform((v) => (v ? v.replace(/^@/, "") : v)),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = createBusinessSchema.safeParse(json);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid input";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    // Ensure the user record exists (normally mirrored by the Clerk webhook).
    await db.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: "" },
    });

    const count = await db.business.count({ where: { userId } });
    if (count >= 3) {
      return NextResponse.json(
        { error: "Business limit reached for your plan" },
        { status: 403 }
      );
    }

    const business = await db.business.create({
      data: { ...parsed.data, userId },
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
    return NextResponse.json({ error: "Failed to load businesses" }, { status: 500 });
  }
}
