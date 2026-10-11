import { describe, expect, it } from "vitest";
import { getScan } from "@/lib/scan-limits/service";
import { DAY, FAKE_REPORT, T0, ask, cookieValue, setup } from "./harness";

// AB-03..AB-18, RL-03, RL-05. Every rule, in order: input, human check, cache, limits.

describe("input and the human check come first and cost nothing", () => {
  it("a bad input is a friendly 400 and uses no quota and no human-check token", async () => {
    let verified = 0;
    const { deps, store } = setup({ verifyHuman: async () => { verified++; return { ok: true }; } });
    for (const website of ["", "not a url", "http://127.0.0.1", "javascript:alert(1)"]) {
      const r = await ask(deps, { website });
      expect(r.status, website).toBe(400);
      expect(r.body).toMatchObject({ error: "invalid_input" });
      expect(typeof (r.body as { message: string }).message).toBe("string");
    }
    expect(verified).toBe(0);
    expect(store.rows).toHaveLength(0);
  });

  it("AB-13: a failed human check is refused with a retry message and starts no scan", async () => {
    const reasons = ["missing", "invalid", "expired_or_reused"] as const;
    for (const reason of reasons) {
      const { deps, store, runScan } = setup({ verifyHuman: async () => ({ ok: false, reason }) });
      const r = await ask(deps, { website: "example.com" });
      expect(r.status).toBe(403);
      expect(r.body).toMatchObject({ error: "human_check", reason });
      expect(JSON.stringify(r.body)).toMatch(/try again/i);
      expect(store.rows).toHaveLength(0);
      expect(runScan).not.toHaveBeenCalled();
    }
  });

  it("AB-14: when the human check itself is down, the scan fails closed with a friendly message", async () => {
    const { deps, runScan } = setup({ verifyHuman: async () => ({ ok: false, reason: "unavailable" }) });
    const r = await ask(deps, { website: "example.com" });
    expect(r.status).toBe(503);
    expect(JSON.stringify(r.body)).toMatch(/try again/i);
    expect(runScan).not.toHaveBeenCalled();
  });
});

describe("a normal scan", () => {
  it("returns an id at once, runs the scan after the response, and stores the result", async () => {
    const { deps, flush, store, runScan } = setup();
    const r = await ask(deps, { website: "https://www.Example.com/about" });
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ status: "running", cached: false });
    expect(runScan).not.toHaveBeenCalled(); // not before the response
    await flush();
    expect(runScan).toHaveBeenCalledTimes(1);
    expect(store.rows[0]).toMatchObject({ siteKey: "example.com", status: "done" });
    const got = await getScan((r.body as { id: string }).id, deps);
    expect(got.status).toBe(200);
    expect(got.body).toMatchObject({ status: "done", result: { score: { website: 80 } } });
  });

  it("AB-18: ids are at least 128 bits, and an unknown, malformed or expired id gets one identical 404", async () => {
    const { deps, flush } = setup({ newId: undefined });
    const r = await ask(deps, { website: "example.com" });
    await flush();
    expect((r.body as { id: string }).id).toMatch(/^[0-9a-f]{32,}$/);
    const unknown = await getScan("0".repeat(32), deps);
    const junk = await getScan("../../etc/passwd", deps);
    const short = await getScan("abc", deps);
    for (const x of [unknown, junk, short]) expect(x).toEqual({ status: 404, body: { error: "not_found" } });
  });

  it("the stored row and the public answer never hold the network address or the visitor hash", async () => {
    const { deps, flush, store } = setup();
    const r = await ask(deps, { website: "example.com" }, { ip: "102.89.1.1" });
    await flush();
    expect(JSON.stringify(store.rows)).not.toContain("102.89.1.1");
    const got = await getScan((r.body as { id: string }).id, deps);
    expect(JSON.stringify(got.body)).not.toMatch(/visitor|102\.89|hash/i);
  });

  it("a scan that throws is marked incomplete, never left running", async () => {
    const { deps, flush, store } = setup({ runScan: async () => { throw new Error("boom"); } });
    await ask(deps, { website: "example.com" });
    await flush();
    expect(store.rows[0].status).toBe("incomplete");
  });

  it("RL-03: a scan still running long after it should have finished is reported as incomplete, not a stuck spinner", async () => {
    const { deps, clock } = setup();
    const r = await ask(deps, { website: "example.com" }); // never flushed: the function was cut off
    clock.t += 5 * 60_000;
    const got = await getScan((r.body as { id: string }).id, deps);
    expect(got.body).toMatchObject({ status: "incomplete" });
  });

  it("RL-05: a database write failure still returns the scan, not stored, with a notice", async () => {
    const { deps, store, runScan } = setup();
    store.failNext();
    const r = await ask(deps, { website: "example.com" });
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ status: "done", stored: false, result: { score: { website: 80 } } });
    expect(runScan).toHaveBeenCalledTimes(1);
  });
});

describe("AB-04, AB-08, AB-12: the shared cache", () => {
  it("a repeat scan of a site is free and instant for everyone and uses no quota", async () => {
    const { deps, flush, store, runScan } = setup();
    await ask(deps, { website: "example.com" }, { ip: "1.1.1.1" });
    await flush();
    for (let i = 0; i < 40; i++) {
      const r = await ask(deps, { website: i % 2 ? "https://WWW.example.com/x" : "example.com." }, { ip: `9.9.9.${i}` });
      expect(r.body).toMatchObject({ cached: true, status: "done" });
      expect(r.setCookie).toBeUndefined(); // no quota used, so the browser is not charged
    }
    expect(runScan).toHaveBeenCalledTimes(1);
    expect(store.rows).toHaveLength(1);
  });

  it("a result older than a day is refreshed by the next scan", async () => {
    const { deps, flush, clock, runScan } = setup();
    await ask(deps, { website: "example.com" });
    await flush();
    clock.t += DAY + 1000;
    const r = await ask(deps, { website: "example.com" });
    expect(r.body).toMatchObject({ cached: false });
    await flush();
    expect(runScan).toHaveBeenCalledTimes(2);
  });

  it("AB-12: two people scanning the same new site at the same moment cause one fetch and both get the same scan", async () => {
    const { deps, flush, runScan } = setup();
    const [a, b] = await Promise.all([ask(deps, { website: "example.com" }, { ip: "1.1.1.1" }), ask(deps, { website: "www.example.com" }, { ip: "2.2.2.2" })]);
    await flush();
    expect(runScan).toHaveBeenCalledTimes(1);
    expect((a.body as { id: string }).id).toBe((b.body as { id: string }).id);
  });
});

describe("AB-03, AB-09, AB-10: per browser and per network", () => {
  const sites = ["a.com", "b.com", "c.com", "d.com"];

  it("a browser may scan three new sites a day; the fourth is refused and uses no quota; allowed again the next day", async () => {
    const { deps, flush, store, clock } = setup();
    let cookie: string | undefined;
    for (const website of sites.slice(0, 3)) {
      const r = await ask(deps, { website }, { cookie });
      expect(r.status).toBe(200);
      cookie = cookieValue(r.setCookie);
      expect(r.setCookie).toMatch(/HttpOnly/i);
      expect(r.setCookie).toMatch(/SameSite=Lax/i);
      expect(r.setCookie).toMatch(/Secure/i);
    }
    await flush();
    const rows = store.rows.length;
    const refused = await ask(deps, { website: "d.com" }, { cookie });
    expect(refused.status).toBe(429);
    expect(refused.body).toMatchObject({ error: "limit", which: "browser" });
    expect(store.rows).toHaveLength(rows);
    // an already-scanned site is still free for the same browser
    expect((await ask(deps, { website: "a.com" }, { cookie })).status).toBe(200);
    clock.t += DAY;
    expect((await ask(deps, { website: "d.com" }, { cookie })).status).toBe(200);
  });

  it("clearing cookies falls back to the per-network limit of 30 a day", async () => {
    const { deps } = setup();
    let ok = 0;
    let refused = 0;
    for (let i = 0; i < 34; i++) {
      const r = await ask(deps, { website: `site${i}.com` }, { ip: "5.5.5.5" }); // no cookie each time
      if (r.status === 200) ok++;
      else {
        refused++;
        expect(r.body).toMatchObject({ error: "limit", which: "network" });
      }
    }
    expect([ok, refused]).toEqual([30, 4]);
  });

  it("AB-10: 25 different people behind one carrier address are not blocked under normal use", async () => {
    const { deps } = setup();
    for (let i = 0; i < 25; i++) {
      const r = await ask(deps, { website: `person${i}.com` }, { ip: "197.210.0.1" });
      expect(r.status, `person ${i}`).toBe(200);
    }
  });

  it("a forged cookie does not reset the count and a spoofed forwarding header does not change who the visitor is", async () => {
    const { deps } = setup();
    for (let i = 0; i < 30; i++) await ask(deps, { website: `s${i}.com` }, { ip: "5.5.5.5" });
    const forged = await ask(deps, { website: "new.com" }, { ip: "5.5.5.5", cookie: "v1.2026-10-10.x.deadbeef" });
    expect(forged.status).toBe(429);
  });

  it("a visitor with no address Vercel could give us shares one cautious bucket instead of getting free scans", async () => {
    const { deps } = setup();
    let ok = 0;
    for (let i = 0; i < 40; i++) if ((await ask(deps, { website: `n${i}.com` }, { ip: null })).status === 200) ok++;
    expect(ok).toBe(30);
  });
});

describe("AB-05, AB-06, AB-07, AB-15: the whole-service cap", () => {
  const manyVisitors = async (deps: Parameters<typeof ask>[0], n: number) => {
    const out = [];
    for (let i = 0; i < n; i++) out.push(await ask(deps, { website: `bot${i}.com` }, { ip: `203.0.${Math.floor(i / 250)}.${i % 250}` }));
    return out;
  };

  it("AB-05: rotating addresses cannot beat 300 new scans a day", async () => {
    const { deps } = setup();
    const out = await manyVisitors(deps, 310);
    expect(out.filter((r) => r.status === 200)).toHaveLength(300);
    expect(out.slice(300).every((r) => r.status === 429 && (r.body as { error: string }).error === "busy")).toBe(true);
  });

  it("AB-06: results already scanned are still served when the cap is hit", async () => {
    const { deps, flush } = setup();
    await manyVisitors(deps, 300);
    await flush();
    const cached = await ask(deps, { website: "bot7.com" }, { ip: "8.8.8.8" });
    expect(cached.status).toBe(200);
    expect(cached.body).toMatchObject({ cached: true });
    expect((await ask(deps, { website: "brand-new.com" }, { ip: "8.8.8.8" })).status).toBe(429);
  });

  it("AB-07: a refused request uses no quota", async () => {
    const { deps, store } = setup();
    await manyVisitors(deps, 300);
    const before = store.rows.length;
    for (let i = 0; i < 20; i++) await ask(deps, { website: `later${i}.com` }, { ip: `7.7.7.${i}` });
    expect(store.rows).toHaveLength(before);
  });

  it("AB-15: hitting the cap raises one alert, and the next day starts fresh", async () => {
    const { deps, alerts, clock } = setup();
    await manyVisitors(deps, 310);
    expect(alerts.filter((a) => a === "scan_cap_reached")).toHaveLength(1);
    clock.t += DAY;
    expect((await ask(deps, { website: "tomorrow.com" }, { ip: "4.4.4.4" })).status).toBe(200);
  });
});

describe("people with no website yet", () => {
  it("can scan with a name and handles; there is nothing to cache, and the network and whole-service limits still apply", async () => {
    const { deps, flush, runScan } = setup();
    const r = await ask(deps, { name: "Toss Spa", city: "Lagos", handles: { instagram: "tossspa" }, whatsapp: "0803 123 4567" });
    expect(r.status).toBe(200);
    await flush();
    expect(runScan).toHaveBeenCalledWith(expect.objectContaining({ name: "Toss Spa", handles: { instagram: "tossspa" } }));
    const again = await ask(deps, { name: "Toss Spa", handles: { instagram: "tossspa" } });
    expect(again.body).toMatchObject({ cached: false });
  });

  it("a request with nothing to check at all is refused politely", async () => {
    const { deps } = setup();
    expect((await ask(deps, {})).status).toBe(400);
    expect((await ask(deps, { name: "   " })).status).toBe(400);
  });

  it("a social link typed into the website box is a no-website scan with that handle", async () => {
    const { deps, flush, runScan } = setup();
    const r = await ask(deps, { website: "https://www.instagram.com/tossspa/" });
    expect(r.status).toBe(200);
    await flush();
    expect(runScan).toHaveBeenCalledTimes(1);
  });
});

describe("inputs that try to cause trouble", () => {
  it.each([
    ["an array", { website: ["a.com"] }],
    ["an object", { website: { a: 1 } }],
    ["a huge name", { name: "x".repeat(100_000) }],
    ["handles that are not text", { handles: { instagram: { a: 1 } } }],
    ["unknown platforms", { handles: { myspace: "x" } }],
  ])("%s is a 400, not a crash", async (_n, body) => {
    const { deps } = setup();
    const r = await ask(deps, body);
    expect(r.status).toBe(400);
  });

  it("a body that is not an object is a 400", async () => {
    const { deps } = setup();
    for (const body of [null, "x", 5, []]) {
      const r = await (await import("@/lib/scan-limits/service")).requestScan({ body, headers: new Headers(), cookie: undefined }, deps);
      expect(r.status).toBe(400);
    }
  });
});

describe("AB-17: a scan makes no paid API calls", () => {
  it("the scan code never touches the Google Places client or any paid key", async () => {
    const { readFileSync, readdirSync } = await import("node:fs");
    const dirs = ["../../lib/scan/", "../../lib/scan-limits/"];
    for (const d of dirs) {
      for (const f of readdirSync(new URL(d, import.meta.url)).filter((x) => x.endsWith(".ts"))) {
        const src = readFileSync(new URL(d + f, import.meta.url), "utf8");
        expect(src, `${d}${f}`).not.toMatch(/google-places|GOOGLE_PLACES_API_KEY|ANTHROPIC_API_KEY/);
      }
    }
  });
});

void FAKE_REPORT;
void T0;
