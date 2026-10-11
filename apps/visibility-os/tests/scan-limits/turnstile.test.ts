import { describe, expect, it } from "vitest";
import { verifyTurnstile } from "@/lib/scan-limits/turnstile";

// AB-13, AB-14. Cloudflare's documented answers: success, missing-input-response,
// invalid-input-response, timeout-or-duplicate (expired or already used).
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const as = (f: unknown) => f as typeof fetch;
const run = (token: string | undefined, f: typeof fetch, ip: string | null = "102.89.1.1") => verifyTurnstile(token, ip, { fetch: f, secret: "SECRET", timeoutMs: 80 });

describe("verifyTurnstile", () => {
  it("a valid token passes, and the secret and token go to Cloudflare over https in the body", async () => {
    let seen: { url: string; body: string } | undefined;
    const r = await run("tok", as(async (url: string, init?: RequestInit) => {
      seen = { url, body: String(init?.body) };
      return json({ success: true });
    }));
    expect(r).toEqual({ ok: true });
    expect(seen!.url).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify");
    expect(seen!.body).toContain("secret=SECRET");
    expect(seen!.body).toContain("response=tok");
    expect(seen!.body).toContain("remoteip=102.89.1.1");
  });

  it("a missing token never reaches Cloudflare", async () => {
    let calls = 0;
    const f = as(async () => { calls++; return json({ success: true }); });
    for (const t of [undefined, "", "   "]) expect(await run(t, f)).toEqual({ ok: false, reason: "missing" });
    expect(calls).toBe(0);
  });

  it.each([
    [["invalid-input-response"], "invalid"],
    [["timeout-or-duplicate"], "expired_or_reused"],
    [["missing-input-response"], "missing"],
    [["invalid-input-secret"], "unavailable"], // our own configuration problem, not the visitor's fault
  ])("%j is %s", async (codes, reason) => {
    expect(await run("tok", as(async () => json({ success: false, "error-codes": codes })))).toEqual({ ok: false, reason });
  });

  it.each([
    ["a network error", as(async () => { throw new TypeError("fetch failed"); })],
    ["a server error", as(async () => json({}, 500))],
    ["a page that is not JSON", as(async () => new Response("<html>", { status: 200 }))],
    ["no answer in time", as(async (_u: string, init?: RequestInit) => new Promise((_r, rej) => init?.signal?.addEventListener("abort", () => rej(new Error("aborted")))))],
    ["success missing from the answer", as(async () => json({}))],
  ])("AB-14: %s fails closed as 'unavailable'", async (_n, f) => {
    expect(await run("tok", f)).toEqual({ ok: false, reason: "unavailable" });
  });

  it("without a configured secret it fails closed", async () => {
    expect(await verifyTurnstile("tok", null, { fetch: as(async () => json({ success: true })), secret: "" })).toEqual({ ok: false, reason: "unavailable" });
  });

  it("works without an address", async () => {
    expect(await run("tok", as(async () => json({ success: true })), null)).toEqual({ ok: true });
  });
});
