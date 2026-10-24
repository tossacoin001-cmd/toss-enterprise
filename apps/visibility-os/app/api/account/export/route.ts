import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildExport, type ExportDb } from "@/lib/account/export";

export const dynamic = "force-dynamic";

/** A download of everything we hold for the signed-in account. Always allowed, trial or not. */
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  try {
    const now = Date.now();
    const data = await buildExport(db as unknown as ExportDb, userId, now);
    const day = new Date(now).toISOString().slice(0, 10);
    return new Response(JSON.stringify(data, null, 2), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "content-disposition": `attachment; filename="visibility-os-data-${day}.json"`,
        "cache-control": "no-store",
      },
    });
  } catch (e) {
    console.error("[GET /api/account/export]", e instanceof Error ? e.message : "failed");
    return NextResponse.json({ error: "Something went wrong on our side. Please try again." }, { status: 500 });
  }
}
