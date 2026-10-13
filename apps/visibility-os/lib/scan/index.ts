import { certDaysLeft as realCertDaysLeft } from "./cert";
import { entryMeta, PLAN, variantFor, type Detail } from "./copy";
import { analyseHtml, type PageSignals } from "./analyse-html";
import { fetchPage, isCertainCause, type FetchPageResult, type LookupFn, type MissingVerdict } from "./fetch-page";
import { classifyWebsiteInput, describeInput } from "./input";
import { normalizeWhatsapp } from "./phone";
import { verifySocial, VERIFIABLE, type Verdict } from "./social";
import type { Evidence, Finding, FindingCause, PlanStep, Priority, ScanInput, ScanReport, SocialPlatform } from "./types";

export type { Finding, ScanInput, ScanReport } from "./types";

/**
 * The scan: one input in, one honest report out. Every check ends as found,
 * missing or could-not-check, and only the first two touch the score.
 * Plan: docs/04-product/visibility-os-s1-engine-plan.md. Tests: tests/engine/scan.test.ts.
 */

export type ScanDeps = {
  fetch?: typeof fetch;
  lookup?: LookupFn;
  now?: () => number;
  /** Independent check before we say a domain does not exist. Defaults to Cloudflare DNS-over-HTTPS. */
  confirmMissing?: (host: string) => Promise<MissingVerdict>;
  certDaysLeft?: (host: string, timeoutMs?: number) => Promise<number | null>;
  timeoutMs?: number;
  retryDelayMs?: number;
  /** Total time the whole scan may take; it returns what it has when this runs out. */
  budgetMs?: number;
  /** Shared across scans in production so other companies' servers are not hammered. */
  cache?: Map<string, Verdict>;
};

const USER_AGENT = "TossVisibilityBot/1.0 (+https://tossvisibilityos.com)";
const DEFAULT_BUDGET_MS = 25_000;
const POSSIBLE = 200;
const PRIORITY_RANK: Record<Priority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
const COST_RANK = { free: 0, low: 1, paid: 2 } as const;
const JS_CAVEAT_IDS = new Set(["page.description", "page.heading", "trust.contact", "trust.schema", "social.linked"]);
const WEBSITE_IDS = ["page.title", "page.description", "page.mobile", "page.heading", "page.canonical", "trust.contact", "trust.schema", "find.robots_sitemap", "speed"];

type Opts = { cause?: FindingCause; caveat?: "js_built"; detail?: Detail; earned?: number };

function make(id: string, state: Evidence, opts: Opts = {}): Finding {
  const meta = entryMeta(id);
  const caveat = state === "missing" && opts.caveat && JS_CAVEAT_IDS.has(id) ? opts.caveat : undefined;
  const v = variantFor(id, { state, cause: opts.cause, caveat, detail: opts.detail });
  const finding: Finding = {
    id, group: meta.group, state, priority: meta.priority, title: v.title, why: v.why, fix: v.fix, minutes: meta.minutes,
    points: meta.points, earned: state === "found" ? (opts.earned ?? meta.points) : 0,
  };
  if (opts.cause && state !== "found") finding.cause = opts.cause;
  if (caveat) finding.caveat = caveat;
  if (opts.detail) finding.detail = opts.detail;
  return finding;
}

const yesNo = (ok: boolean, id: string, caveat?: "js_built") => make(id, ok ? "found" : "missing", { caveat });
const unchecked = (id: string) => make(id, "could_not_check");

type Probe = "yes" | "no" | "unknown";

/** Is there a real file at this address? A page that answers 200 with a web page does not count. */
async function probe(url: string, doFetch: typeof fetch, signal: AbortSignal, timeoutMs: number): Promise<Probe> {
  try {
    const res = await doFetch(url, {
      redirect: "manual",
      signal: AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)]),
      headers: { "user-agent": USER_AGENT, accept: "text/plain,application/xml,*/*;q=0.5" },
    });
    await Promise.race([res.body?.cancel().catch(() => undefined), new Promise<void>((r) => setTimeout(r, 50))]);
    if (res.status === 200) return /html/i.test(res.headers.get("content-type") ?? "") ? "no" : "yes";
    if (res.status === 403 || res.status === 429 || res.status >= 500) return "unknown";
    return "no";
  } catch {
    return "unknown";
  }
}

const normaliseHandle = (platform: SocialPlatform, handle: string): string => {
  const h = handle.trim();
  if (platform === "youtube") return h.startsWith("@") || h.includes("/") ? h : `@${h}`;
  return h.replace(/^@/, "");
};

export async function runScan(input: ScanInput, deps: ScanDeps = {}): Promise<ScanReport> {
  const budget = new AbortController();
  const timer = setTimeout(() => budget.abort(), deps.budgetMs ?? DEFAULT_BUDGET_MS);
  try {
    return await scanInside(input, deps, budget.signal);
  } finally {
    clearTimeout(timer);
  }
}

async function scanInside(input: ScanInput, deps: ScanDeps, signal: AbortSignal): Promise<ScanReport> {
  const doFetch = deps.fetch ?? fetch;
  const timeoutMs = deps.timeoutMs ?? 10_000;

  // 1. What did they give us? A social link or a phone number in the website box is not a website.
  const handles: Partial<Record<SocialPlatform, string>> = {};
  for (const [k, v] of Object.entries(input.handles ?? {})) if (v && v.trim()) handles[k as SocialPlatform] = normaliseHandle(k as SocialPlatform, v);
  let whatsappInput = input.whatsapp ?? null;
  let inputNote: ScanReport["inputNote"];
  let websiteUrl: string | null = null;

  const raw = (input.website ?? "").trim();
  if (raw) {
    const kind = classifyWebsiteInput(raw);
    // A bare domain stays bare, so the fetch may fall back to http for sites with no https.
    if (kind.kind === "website") websiteUrl = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? kind.url : raw;
    else if (describeInput(kind)) {
      if (kind.kind === "social") {
        inputNote = { kind: "social", platform: kind.platform, handle: kind.handle };
        if (!handles[kind.platform]) handles[kind.platform] = normaliseHandle(kind.platform, kind.handle);
      } else inputNote = { kind: kind.kind };
      if (kind.kind === "phone" || kind.kind === "whatsapp") whatsappInput = whatsappInput ?? kind.e164;
    }
  }

  // 2. The website, if there is one.
  let page: FetchPageResult | null = null;
  let signals: PageSignals | null = null;
  if (websiteUrl) {
    const run = fetchPage(websiteUrl, { timeoutMs, retryDelayMs: deps.retryDelayMs, signal }, { fetch: doFetch, lookup: deps.lookup, now: deps.now, confirmMissing: deps.confirmMissing });
    const stop = new Promise<FetchPageResult>((resolve) =>
      signal.addEventListener("abort", () => setTimeout(() => resolve({ ok: false, cause: "timeout", retried: false }), 100), { once: true })
    );
    page = await Promise.race([run, stop]);
    if (page.ok) signals = analyseHtml(page.html, page.finalUrl);
  }

  const findings: Finding[] = [];
  const pageLoaded = !!(page && page.ok && signals && !signals.botChallenge && !signals.maintenance && !signals.parked);

  if (!websiteUrl) {
    findings.push(make("site.none", "missing"));
  } else if (page && !page.ok) {
    const cause = page.cause;
    if (cause === "certificate_expired" || cause === "certificate_untrusted" || cause === "certificate_wrong_name") {
      findings.push(unchecked("site.reachable"), make("site.https", "missing", { cause }));
    } else {
      const known = (isCertainCause(cause) && cause !== "unsafe_address" && cause !== "invalid_url") || cause === "server_error";
      findings.push(make("site.reachable", known ? "missing" : "could_not_check", { cause }), unchecked("site.https"));
    }
    for (const id of WEBSITE_IDS) findings.push(unchecked(id));
  } else if (page && page.ok && signals) {
    if (signals.parked) findings.push(make("site.reachable", "missing", { cause: "parked" }));
    else if (signals.botChallenge) findings.push(make("site.reachable", "could_not_check", { cause: "blocked" }));
    else if (signals.maintenance) findings.push(unchecked("site.reachable"));
    else findings.push(make("site.reachable", "found"));

    if (!pageLoaded) {
      findings.push(unchecked("site.https"));
      for (const id of WEBSITE_IDS) findings.push(unchecked(id));
    } else {
      const secure = page.finalUrl.startsWith("https:") && !page.usedHttpFallback;
      findings.push(yesNo(secure, "site.https"));
      const url = new URL(page.finalUrl);
      const js = signals.jsBuilt ? ("js_built" as const) : undefined;
      const certCheck = secure
        ? Promise.race([
            (deps.certDaysLeft ?? realCertDaysLeft)(url.hostname, timeoutMs),
            new Promise<null>((r) => signal.addEventListener("abort", () => r(null), { once: true })),
          ]).catch(() => null)
        : Promise.resolve(null);
      const [robots, sitemap, daysLeft] = await Promise.all([
        probe(`${url.origin}/robots.txt`, doFetch, signal, timeoutMs),
        probe(`${url.origin}/sitemap.xml`, doFetch, signal, timeoutMs),
        certCheck,
      ]);
      if (daysLeft !== null && daysLeft >= 0 && daysLeft < 30) findings.push(make("site.cert_expiring", "missing"));
      findings.push(
        yesNo(!!signals.title, "page.title"),
        yesNo(!!signals.description, "page.description", js),
        yesNo(signals.viewport, "page.mobile"),
        yesNo(signals.h1Count > 0, "page.heading", js),
        yesNo(!!signals.canonical, "page.canonical"),
        yesNo(signals.contact.any, "trust.contact", js),
        yesNo(signals.hasBusinessSchema, "trust.schema", js),
        robots === "yes" || sitemap === "yes"
          ? make("find.robots_sitemap", "found")
          : robots === "unknown" || sitemap === "unknown"
            ? unchecked("find.robots_sitemap")
            : make("find.robots_sitemap", "missing")
      );
      const ms = page.elapsedMs;
      findings.push(ms <= 4000 ? make("speed", "found") : ms <= 7000 ? make("speed", "found", { earned: 3 }) : make("speed", "missing"));
    }
  }

  // 3. Social media: what the site links to, what the owner typed, and what can honestly be checked.
  const linked: Partial<Record<SocialPlatform, string>> = pageLoaded && signals ? { ...signals.social } : {};
  const all: Partial<Record<SocialPlatform, string>> = { ...handles, ...linked };
  const candidates = (Object.keys(all) as SocialPlatform[]).filter((p) => VERIFIABLE.has(p));
  const cache = deps.cache ?? new Map<string, Verdict>();
  const verdicts = await Promise.all(candidates.map((p) => verifySocial(p, normaliseHandle(p, all[p]!), { fetch: doFetch, now: deps.now, cache, timeoutMs })));
  const anyLive = verdicts.some((v) => v.verdict === "live");
  const anyGone = verdicts.some((v) => v.verdict === "missing");
  const anyHandle = Object.keys(all).length > 0;
  const anyLink = Object.keys(linked).length > 0;
  const decided = !websiteUrl || pageLoaded; // we know what the site does or does not link to

  // With no website and no handle we have not looked at anything, so we say that instead of "none found".
  const notGiven = !websiteUrl && !anyHandle;
  findings.push(
    anyLink || anyLive
      ? make("social.present", "found")
      : notGiven
        ? make("social.present", "could_not_check", { detail: "not_given" })
        : !anyHandle && decided
          ? make("social.present", "missing")
          : unchecked("social.present")
  );
  if (websiteUrl) {
    findings.push(
      !pageLoaded ? unchecked("social.linked") : anyLink ? make("social.linked", "found") : make("social.linked", "missing", { caveat: signals?.jsBuilt ? "js_built" : undefined })
    );
  }
  findings.push(
    anyGone
      ? make("social.verified", "missing", { detail: "broken_link" })
      : anyLive
        ? make("social.verified", "found")
        : notGiven
          ? make("social.verified", "could_not_check", { detail: "not_given" })
          : anyHandle || !decided
          ? unchecked("social.verified")
          : make("social.verified", "missing", { detail: "none_found" })
  );
  if (!websiteUrl) findings.push(unchecked("google.profile"));

  // 4. Score. Only found and missing count; what we could not check is left out, never counted as zero.
  const sums = (group: Finding["group"]) => {
    const counted = findings.filter((x) => x.group === group && x.state !== "could_not_check");
    return { counted: counted.reduce((n, x) => n + x.points, 0), earned: counted.reduce((n, x) => n + x.earned, 0) };
  };
  const pct = (s: { counted: number; earned: number }) => (s.counted > 0 ? Math.round((s.earned / s.counted) * 100) : null);
  const website = websiteUrl ? pct(sums("website")) : null;
  const social = pct(sums("social"));
  const total = website === null ? null : social === null ? website : Math.round((website + social) / 2);
  const earned = findings.reduce((n, x) => n + x.earned, 0);

  const fixes = findings
    .map((x, i) => ({ x, i }))
    .filter(({ x }) => x.state === "missing")
    .sort((a, b) => PRIORITY_RANK[a.x.priority] - PRIORITY_RANK[b.x.priority] || a.x.minutes - b.x.minutes || b.x.points - a.x.points || a.i - b.i)
    .map(({ x }) => x);

  const report: ScanReport = {
    path: websiteUrl ? "website" : "no_website",
    findings,
    fixes,
    topFixes: fixes.slice(0, 3),
    couldNotCheck: findings.filter((x) => x.state === "could_not_check").map((x) => x.id),
    score: { website, social, total, earned, possible: POSSIBLE, pointsAvailable: POSSIBLE - earned },
  };
  if (page && page.ok) {
    report.site = { finalUrl: page.finalUrl, status: page.status, movedToOtherDomain: page.movedToOtherDomain, usedHttpFallback: page.usedHttpFallback };
  }
  if (inputNote) report.inputNote = inputNote;
  if (!websiteUrl) {
    report.whatsapp = whatsappInput ? normalizeWhatsapp(whatsappInput) : null;
    report.startHere = [...PLAN].sort((a, b) => COST_RANK[a.cost] - COST_RANK[b.cost]) as PlanStep[];
  }
  return report;
}
