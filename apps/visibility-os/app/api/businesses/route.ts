import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createBusinessSchema } from "@/lib/schemas";
import { pendingEmail } from "@/lib/utils";
import { limitMessage } from "@/lib/billing/policy";
import { getAccess, requireMutationAccess } from "@/lib/billing/access";
import { createWithinLimit, type LimitDb } from "@/lib/billing/limit";
import { claimScan, type ScanDb } from "@/lib/workspace/claim";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const held = await requireMutationAccess(userId);
  if (held) return held;

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
      const email = clerkUser?.emailAddresses[0]?.emailAddress ?? pendingEmail(userId);
      const name = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") || null;
      // upsert, not create: a concurrent double-submit from this same
      // first-time user would otherwise race two creates against the same id.
      await db.user.upsert({
        where: { id: userId },
        update: {},
        create: { id: userId, email, name },
      });
    }

    const { scanId, ...fields } = parsed.data;
    const { businessLimit } = await getAccess(userId);
    const made = await createWithinLimit(db as unknown as LimitDb, userId, fields, businessLimit);
    if (!made.ok) {
      return NextResponse.json({ error: limitMessage(businessLimit) }, { status: 403 });
    }
    const business = made.business;

    // Save the free check this business came from to the account. A failure here never loses the business.
    let scan: string | null = null;
    if (scanId) {
      scan = await claimScan(db as unknown as ScanDb, scanId, userId, Date.now()).then((r) => r.status).catch(() => null);
    }

    return NextResponse.json({ business, scan }, { status: 201 });
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
