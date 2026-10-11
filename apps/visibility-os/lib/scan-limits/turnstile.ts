/**
 * Cloudflare Turnstile server check. Fails closed: if Cloudflare cannot be reached or answers
 * oddly, the scan does not start (a friendly "try again"). Tests: tests/scan-limits/turnstile.test.ts.
 */

export type HumanCheck = { ok: true } | { ok: false; reason: "missing" | "invalid" | "expired_or_reused" | "unavailable" };

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(
  token: string | undefined,
  ip: string | null,
  deps: { fetch?: typeof fetch; secret?: string; timeoutMs?: number } = {}
): Promise<HumanCheck> {
  const secret = deps.secret ?? process.env.TURNSTILE_SECRET_KEY ?? "";
  if (!secret) return { ok: false, reason: "unavailable" };
  if (!token || !token.trim()) return { ok: false, reason: "missing" };

  const body = new URLSearchParams({ secret, response: token.trim() });
  if (ip) body.set("remoteip", ip);

  try {
    const res = await (deps.fetch ?? fetch)(VERIFY_URL, { method: "POST", body, signal: AbortSignal.timeout(deps.timeoutMs ?? 8000) });
    if (!res.ok) return { ok: false, reason: "unavailable" };
    const answer = (await res.json()) as { success?: unknown; "error-codes"?: unknown };
    if (answer.success === true) return { ok: true };
    if (answer.success !== false) return { ok: false, reason: "unavailable" };
    const codes = Array.isArray(answer["error-codes"]) ? (answer["error-codes"] as unknown[]) : [];
    if (codes.includes("timeout-or-duplicate")) return { ok: false, reason: "expired_or_reused" };
    if (codes.includes("missing-input-response")) return { ok: false, reason: "missing" };
    if (codes.includes("invalid-input-response") || codes.length === 0) return { ok: false, reason: "invalid" };
    return { ok: false, reason: "unavailable" }; // our own setup is wrong, not the visitor's fault
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}
