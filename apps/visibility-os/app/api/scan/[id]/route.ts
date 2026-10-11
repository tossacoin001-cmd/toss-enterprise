import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { prismaStore } from "@/lib/scan-limits/prisma-store";
import { getScan } from "@/lib/scan-limits/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const result = await getScan(id, { store: prismaStore(db), now: Date.now });
  return NextResponse.json(result.body, { status: result.status, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
}
