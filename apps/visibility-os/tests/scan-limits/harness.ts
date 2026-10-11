import { vi } from "vitest";
import type { ScanRecord, ScanStore } from "@/lib/scan-limits/store";
import type { ScanReport } from "@/lib/scan";
import { requestScan, type ScanDeps2 } from "@/lib/scan-limits/service";

/** The same rules the database store follows, held in memory, so the rules can be tested fast. */
export function memoryStore(): ScanStore & { rows: ScanRecord[]; failNext: () => void } {
  const rows: ScanRecord[] = [];
  let fail = false;
  const guard = () => {
    if (fail) {
      fail = false;
      throw new Error("database is down");
    }
  };
  return {
    rows,
    failNext: () => { fail = true; },
    async findFresh(siteKey, since) {
      guard();
      return rows.find((r) => r.siteKey === siteKey && r.createdAt > since) ?? null;
    },
    async countSince(since) {
      guard();
      return rows.filter((r) => r.createdAt >= since).length;
    },
    async countByVisitor(visitorHash, since) {
      guard();
      return rows.filter((r) => r.visitorHash === visitorHash && r.createdAt >= since).length;
    },
    async createOrJoin(input) {
      guard();
      if (input.siteKey) {
        const hit = rows.find((r) => r.siteKey === input.siteKey && r.createdAt > input.freshSince);
        if (hit) return { scan: hit, created: false };
      }
      const scan: ScanRecord = {
        id: input.id, siteKey: input.siteKey, url: input.url, visitorHash: input.visitorHash, status: "running",
        result: null, createdAt: input.now, expiresAt: input.now + 30 * 86_400_000,
      };
      rows.push(scan);
      return { scan, created: true };
    },
    async get(id) {
      guard();
      return rows.find((r) => r.id === id) ?? null;
    },
    async finish(id, status, result) {
      guard();
      const r = rows.find((x) => x.id === id);
      if (r) Object.assign(r, { status, result });
    },
  };
}

export const FAKE_REPORT = { path: "website", findings: [], fixes: [], topFixes: [], couldNotCheck: [], score: { website: 80, social: 0, total: 40, earned: 80, possible: 200, pointsAvailable: 120 } } as unknown as ScanReport;

export const T0 = Date.parse("2026-10-10T10:00:00Z");
export const DAY = 24 * 3600 * 1000;

export function setup(over: Partial<ScanDeps2> = {}) {
  const store = memoryStore();
  const clock = { t: T0 };
  const tasks: Array<() => Promise<void>> = [];
  const alerts: string[] = [];
  let n = 0;
  const runScan = vi.fn(async () => FAKE_REPORT);
  const deps: ScanDeps2 = {
    store,
    verifyHuman: async () => ({ ok: true }),
    runScan,
    schedule: (fn) => { tasks.push(fn); },
    now: () => clock.t,
    newId: () => (++n).toString(16).padStart(32, "0"),
    cookieSecret: "test-secret-at-least-32-characters-long!!",
    salt: "salt",
    alert: (what) => { alerts.push(what); },
    ...over,
  };
  const flush = async () => { while (tasks.length) await tasks.shift()!(); };
  return { store, clock, deps, runScan, flush, alerts };
}

export const headers = (ip: string | null = "102.89.1.1", extra: Record<string, string> = {}) => {
  const h = new Headers(extra);
  if (ip) h.set("x-vercel-forwarded-for", ip);
  return h;
};

export const ask = (deps: ScanDeps2, body: Record<string, unknown>, opts: { ip?: string | null; cookie?: string; token?: string } = {}) =>
  requestScan({ body: { token: opts.token ?? "tok", ...body }, headers: headers(opts.ip === undefined ? "102.89.1.1" : opts.ip), cookie: opts.cookie }, deps);

/** The cookie value out of a Set-Cookie string. */
export const cookieValue = (setCookie?: string) => setCookie?.split(";")[0].split("=").slice(1).join("=");
