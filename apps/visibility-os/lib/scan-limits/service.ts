import { randomBytes } from "node:crypto";
import { classifyWebsiteInput, describeInput } from "@/lib/scan/input";
import type { ScanInput, ScanReport, SocialPlatform } from "@/lib/scan/types";
import { siteKey } from "./site-key";
import type { ScanRecord, ScanStore } from "./store";
import type { HumanCheck } from "./turnstile";
import { addBrowserSite, browserSites, clientIp, visitorHash, watDay, watDayStart } from "./visitor";

/**
 * The free instant scan, request by request: input, then the human check, then the shared
 * cache, then the limits, then the scan itself (run after the response). Cached results are
 * free for everyone; a refused request uses no quota.
 * Plan: docs/04-product/visibility-os-instant-scan-plan.md section 5. Tests: tests/scan-limits/service.test.ts.
 */

export const RULES = { newSitesPerBrowserPerDay: 3, scansPerNetworkPerDay: 30, scansPerDay: 300, freshMs: 24 * 3600 * 1000, staleRunningMs: 90_000 };
export const COOKIE_NAME = "tvo_scans";

export type ScanDeps2 = {
  store: ScanStore;
  verifyHuman: (token: string | undefined, ip: string | null) => Promise<HumanCheck>;
  runScan: (input: ScanInput) => Promise<ScanReport>;
  /** Runs work after the response has been sent. */
  schedule: (task: () => Promise<void>) => void;
  now: () => number;
  newId?: () => string;
  cookieSecret: string;
  salt: string;
  alert: (what: string) => void;
};

export type ApiResult = { status: number; body: unknown; setCookie?: string };

const PLATFORMS: ReadonlySet<string> = new Set<SocialPlatform>(["instagram", "facebook", "tiktok", "x", "youtube", "linkedin"]);
const bad = (message: string): ApiResult => ({ status: 400, body: { error: "invalid_input", message } });
const text = (v: unknown, max: number): string | undefined | null => (v === undefined || v === null ? undefined : typeof v === "string" && v.length <= max ? v.trim() : null);

type Parsed = { input: ScanInput; token: string | undefined; site: string | null };

function parseBody(body: unknown): Parsed | ApiResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) return bad("Send your website address or your business details.");
  const b = body as Record<string, unknown>;
  const website = text(b.website, 2000);
  const name = text(b.name, 120);
  const city = text(b.city, 120);
  const category = text(b.category, 120);
  const whatsapp = text(b.whatsapp, 40);
  const token = text(b.token, 4096);
  if ([website, name, city, category, whatsapp, token].some((v) => v === null)) return bad("Some details are too long or in the wrong form.");

  const handles: Partial<Record<SocialPlatform, string>> = {};
  if (b.handles !== undefined) {
    if (!b.handles || typeof b.handles !== "object" || Array.isArray(b.handles)) return bad("Social handles are in the wrong form.");
    for (const [k, v] of Object.entries(b.handles as Record<string, unknown>)) {
      const h = text(v, 100);
      if (!PLATFORMS.has(k) || h === null) return bad("Social handles are in the wrong form.");
      if (h) handles[k as SocialPlatform] = h;
    }
  }

  let site: string | null = null;
  if (website) {
    const kind = classifyWebsiteInput(website);
    if (kind.kind === "website") site = siteKey(kind.url);
    else if (kind.kind === "invalid" || kind.kind === "ip" || kind.kind === "local" || kind.kind === "empty") {
      return bad(describeInput(kind) ?? "That does not look like a website address. Try something like yourbusiness.com.");
    }
  }
  if (!site && !(name || Object.keys(handles).length || whatsapp || website)) return bad("Paste your website address, or tell us your business name and social handle.");

  const input: ScanInput = { website: website || null, name: name || null, city: city || null, category: category || null, whatsapp: whatsapp || null, handles };
  return { input, token: token || undefined, site };
}

const alerted = new WeakMap<object, string>();

export async function requestScan(req: { body: unknown; headers: Headers; cookie: string | undefined }, deps: ScanDeps2): Promise<ApiResult> {
  const parsed = parseBody(req.body);
  if ("status" in parsed) return parsed;
  const { input, token, site } = parsed;

  const ip = clientIp(req.headers);
  const human = await deps.verifyHuman(token, ip);
  if (!human.ok) {
    return human.reason === "unavailable"
      ? { status: 503, body: { error: "human_check_unavailable", message: "We could not run our safety check just now. Please try again in a minute." } }
      : { status: 403, body: { error: "human_check", reason: human.reason, message: "Please complete the safety check and try again." } };
  }

  const now = deps.now();
  const day = watDay(now);
  const visitor = visitorHash(ip ?? "unknown", deps.salt, day);
  const freshSince = now - RULES.freshMs;
  const id = (deps.newId ?? (() => randomBytes(16).toString("hex")))();

  try {
    if (site) {
      const hit = await deps.store.findFresh(site, freshSince);
      if (hit) return { status: 200, body: { id: hit.id, status: hit.status, cached: true } };
    }

    if ((await deps.store.countSince(watDayStart(now))) >= RULES.scansPerDay) {
      if (alerted.get(deps.store) !== day) {
        alerted.set(deps.store, day);
        deps.alert("scan_cap_reached");
      }
      return { status: 429, body: { error: "busy", message: "We are very busy today. Please try again tomorrow. Websites scanned before still open instantly." } };
    }
    if (site && browserSites(req.cookie, day, deps.cookieSecret).filter((s) => s !== site).length >= RULES.newSitesPerBrowserPerDay) {
      return { status: 429, body: { error: "limit", which: "browser", message: "You have used today's free scans on this browser. Sign up to keep going, or come back tomorrow." } };
    }
    if ((await deps.store.countByVisitor(visitor, watDayStart(now))) >= RULES.scansPerNetworkPerDay) {
      return { status: 429, body: { error: "limit", which: "network", message: "Many scans came from your network today. Please try again tomorrow." } };
    }

    const { scan, created } = await deps.store.createOrJoin({ id, siteKey: site, url: input.website ?? null, visitorHash: visitor, now, freshSince });
    if (!created) return { status: 200, body: { id: scan.id, status: scan.status, cached: true } };

    deps.schedule(async () => {
      try {
        await deps.store.finish(scan.id, "done", await deps.runScan(input));
      } catch {
        await deps.store.finish(scan.id, "incomplete", null).catch(() => undefined);
      }
    });
    const setCookie = site
      ? `${COOKIE_NAME}=${addBrowserSite(req.cookie, site, day, deps.cookieSecret)}; Path=/; Max-Age=86400; HttpOnly; Secure; SameSite=Lax`
      : undefined;
    return { status: 200, body: { id: scan.id, status: "running", cached: false }, setCookie };
  } catch {
    // The database failed: still give the visitor their result, just not stored or shareable.
    try {
      return { status: 200, body: { id: null, status: "done", stored: false, result: await deps.runScan(input) } };
    } catch {
      return { status: 503, body: { error: "unavailable", message: "Something went wrong on our side. Please try again in a minute." } };
    }
  }
}

const NOT_FOUND: ApiResult = { status: 404, body: { error: "not_found" } };

export async function getScan(id: string, deps: Pick<ScanDeps2, "store" | "now">): Promise<ApiResult> {
  if (!/^[0-9a-f]{32,64}$/.test(id)) return NOT_FOUND;
  let row: ScanRecord | null;
  try {
    row = await deps.store.get(id);
    const now = deps.now();
    if (!row || row.expiresAt < now) return NOT_FOUND;
    if (row.status === "running" && now - row.createdAt > RULES.staleRunningMs) {
      await deps.store.finish(row.id, "incomplete", null);
      row = { ...row, status: "incomplete" };
    }
  } catch {
    return { status: 503, body: { error: "unavailable" } };
  }
  return { status: 200, body: { id: row.id, status: row.status, result: row.result, createdAt: row.createdAt } };
}
