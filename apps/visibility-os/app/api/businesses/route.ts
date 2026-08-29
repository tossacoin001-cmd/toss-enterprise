import { auth, currentUser } from "@clerk/nextjs/server";
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
    // Ensure the user record exists (normally mirrored by the Clerk webhook,
    // but that delivery can lag behind this request). email is @unique, so a
    // shared placeholder like "" collides across users the moment a second
    // person hits this fallback before their webhook lands; fetch the real
    // address (or fall back to a per-user placeholder) instead.
    const existingUser = await db.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!existingUser) {
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses[0]?.emailAddress ?? `${userId}@pending.toss-enterprise.local`;
      const name = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") || null;
      // upsert, not create: a concurrent double-submit from this same
      // first-time user would otherwise race two creates against the same id.
      await db.user.upsert({
        where: { id: userId },
        update: {},
        create: { id: userId, email, name },
      });
    }

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
