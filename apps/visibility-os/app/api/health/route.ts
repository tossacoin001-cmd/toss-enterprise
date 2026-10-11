import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkHealth } from "@/lib/health";

// Uptime monitors call this every few minutes. It must hit the database, not
// just render: a paused or unreachable database is exactly what a plain page
// check misses, and the regular query also counts as activity on the free
// Supabase tier. See docs/05-operations/database-and-deploy-runbook.md.
export const dynamic = "force-dynamic";
export const maxDuration = 15;

async function handle() {
  const result = await checkHealth(() => db.user.findFirst({ select: { id: true } }), {
    onError: (error) => console.error("[health] database check failed", error),
  });
  // The body stays minimal; the timing header shows how far the database is.
  return NextResponse.json(
    { status: result.status },
    {
      status: result.status === "ok" ? 200 : 503,
      headers: { "cache-control": "no-store", "server-timing": `db;dur=${result.ms}` },
    }
  );
}

// Monitors differ on GET vs HEAD; both answer the same way.
export const GET = handle;
export const HEAD = handle;
