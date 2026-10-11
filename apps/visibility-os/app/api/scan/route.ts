import { NextResponse } from "next/server";
import { COOKIE_NAME, requestScan } from "@/lib/scan-limits/service";
import { realDeps } from "@/lib/scan-limits/runtime";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

export async function POST(req: Request) {
  const deps = realDeps();
  if (!deps) {
    return NextResponse.json({ error: "human_check_unavailable", message: "The free scan is not available right now. Please try again soon." }, { status: 503, headers: NO_STORE });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_input", message: "Send your website address or your business details." }, { status: 400, headers: NO_STORE });
  }
  const cookie = req.headers.get("cookie")?.split(/;\s*/).find((c) => c.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
  const result = await requestScan({ body, headers: req.headers, cookie }, deps);
  const res = NextResponse.json(result.body, { status: result.status, headers: NO_STORE });
  if (result.setCookie) res.headers.append("Set-Cookie", result.setCookie);
  return res;
}
