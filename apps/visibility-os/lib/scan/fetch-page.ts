import { lookup as dnsLookup } from "node:dns/promises";
import { isBlockedIp, isSafeExternalUrl } from "../url-safety";
import type { FailureCause } from "./types";

/**
 * Fetches one home page for the scan, honestly and safely.
 *
 * - Every failure is classified. Only some are certain (a domain that does not
 *   exist, a bad certificate); the rest are "could not check" and never become
 *   a claim about the owner's site. One bad moment is retried before it counts.
 * - Redirects are followed by hand, each hop re-checked (address rules and DNS).
 * - The body is streamed and capped: it is read until the end of <head>
 *   (up to 2 MB, because some pages inline huge CSS before the title), then at
 *   most 500 KB more. Tests: tests/engine/fetch-page.test.ts.
 */

export const HEAD_CAP_BYTES = 2 * 1024 * 1024;
export const BODY_AFTER_HEAD_BYTES = 500 * 1024;
const USER_AGENT = "TossVisibilityBot/1.0 (+https://tossvisibilityos.com)";
const DEFAULT_TIMEOUT_MS = 15_000;
const MAX_REDIRECTS = 5;

const CERTAIN: ReadonlySet<FailureCause> = new Set([
  "domain_not_found", "certificate_expired", "certificate_untrusted", "certificate_wrong_name", "not_html", "invalid_url", "unsafe_address", "too_many_redirects",
]);
/** True when the cause proves something about the site; false when it only tells us we could not look. */
export const isCertainCause = (cause: FailureCause): boolean => CERTAIN.has(cause);

type LookupResult = { address: string; family: number }[];
export type LookupFn = (host: string, options: { all: true; verbatim: true }) => Promise<LookupResult>;

/** Does an independent resolver agree that a name does not exist? Only "gone" lets us say so. */
export type MissingVerdict = "gone" | "exists" | "unsure";
export type FetchPageDeps = { fetch?: typeof fetch; lookup?: LookupFn; now?: () => number; confirmMissing?: (host: string) => Promise<MissingVerdict> };
export type FetchPageOptions = { timeoutMs?: number; retries?: number; retryDelayMs?: number; maxRedirects?: number; signal?: AbortSignal };

export type FetchPageResult =
  | {
      ok: true;
      status: number;
      finalUrl: string;
      redirects: string[];
      html: string;
      truncated: boolean;
      bytesRead: number;
      contentType: string;
      retried: boolean;
      movedToOtherDomain: boolean;
      usedHttpFallback: boolean;
      elapsedMs: number;
    }
  | { ok: false; cause: FailureCause; retried: boolean; status?: number; finalUrl?: string; usedHttpFallback?: boolean };

type Failure = Extract<FetchPageResult, { ok: false }>;

// ---- classification ---------------------------------------------------------

const CODE_TO_CAUSE: Record<string, FailureCause> = {
  ENOTFOUND: "domain_not_found",
  ENODATA: "domain_not_found",
  CERT_HAS_EXPIRED: "certificate_expired",
  DEPTH_ZERO_SELF_SIGNED_CERT: "certificate_untrusted",
  SELF_SIGNED_CERT_IN_CHAIN: "certificate_untrusted",
  UNABLE_TO_VERIFY_LEAF_SIGNATURE: "certificate_untrusted",
  UNABLE_TO_GET_ISSUER_CERT_LOCALLY: "certificate_untrusted",
  CERT_UNTRUSTED: "certificate_untrusted",
  CERT_NOT_YET_VALID: "certificate_untrusted",
  ERR_TLS_CERT_ALTNAME_INVALID: "certificate_wrong_name",
  HOSTNAME_MISMATCH: "certificate_wrong_name",
  UND_ERR_CONNECT_TIMEOUT: "timeout",
  UND_ERR_HEADERS_TIMEOUT: "timeout",
  UND_ERR_BODY_TIMEOUT: "timeout",
  ETIMEDOUT: "timeout",
};

function classifyError(err: unknown): FailureCause {
  const e = err as { name?: string; code?: string; cause?: { code?: string; name?: string } } | null;
  const code = e?.cause?.code ?? e?.code;
  if (code && CODE_TO_CAUSE[code]) return CODE_TO_CAUSE[code];
  if (e?.name === "TimeoutError" || e?.name === "AbortError" || e?.cause?.name === "TimeoutError") return "timeout";
  return "connection_failed"; // refused, reset, temporary DNS trouble, anything we cannot name
}

function classifyStatus(status: number): FailureCause | null {
  if (status >= 200 && status < 300) return null;
  if (status === 404 || status === 410) return "not_found";
  if (status >= 500) return "server_error";
  return "blocked"; // 401, 403, 429 and other refusals: we cannot tell why, so we do not blame the site
}

const retryable = (cause: FailureCause) => cause === "timeout" || cause === "connection_failed" || cause === "server_error";

/** Cancels a body without ever waiting long for it: a slow connection must not stall the scan. */
async function safeCancel(target: { cancel: () => Promise<void> } | null | undefined): Promise<void> {
  if (!target) return;
  await Promise.race([target.cancel().catch(() => undefined), new Promise<void>((r) => setTimeout(r, 50))]);
}

// ---- body -------------------------------------------------------------------

function pickCharset(contentType: string, head: Uint8Array): string {
  const fromHeader = /charset=["']?([a-z0-9_-]+)/i.exec(contentType)?.[1];
  const sniffed = fromHeader ?? /<meta[^>]+charset=["']?([a-z0-9_-]+)/i.exec(Buffer.from(head.slice(0, 4096)).toString("latin1"))?.[1];
  const label = (sniffed ?? "utf-8").toLowerCase();
  try {
    new TextDecoder(label);
    return label;
  } catch {
    return "utf-8";
  }
}

const looksLikeHtml = (bytes: Uint8Array) => /<!doctype html|<html|<head|<title|<body/i.test(Buffer.from(bytes.slice(0, 1024)).toString("latin1"));

/** Streams the body until the end of <head> (cap 2 MB), then up to 500 KB more. */
async function readBody(res: Response, signal: AbortSignal): Promise<{ bytes: Uint8Array; truncated: boolean }> {
  if (!res.body) return { bytes: new Uint8Array(0), truncated: false };
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  let allowed = HEAD_CAP_BYTES;
  let headEnd = -1;
  let carry = "";
  let truncated = false;
  try {
    for (;;) {
      if (signal.aborted) throw signal.reason;
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      chunks.push(value);
      if (headEnd < 0) {
        const text = (carry + Buffer.from(value).toString("latin1")).toLowerCase();
        const at = text.indexOf("</head");
        if (at >= 0) {
          headEnd = total + at - carry.length;
          allowed = Math.min(HEAD_CAP_BYTES, headEnd) + BODY_AFTER_HEAD_BYTES;
        }
        carry = text.slice(-7);
      }
      total += value.length;
      if (total >= allowed) {
        truncated = true;
        break;
      }
    }
  } catch (err) {
    // A stall after we already have some of the page: use what we have.
    if (total === 0) throw err;
    truncated = true;
  } finally {
    await safeCancel(reader);
  }
  const bytes = new Uint8Array(total);
  let at = 0;
  for (const c of chunks) {
    bytes.set(c, at);
    at += c.length;
  }
  return { bytes, truncated };
}

// ---- the fetch --------------------------------------------------------------

const siteOf = (url: string) => new URL(url).hostname.toLowerCase().replace(/^www\./, "");
const sleep = (ms: number) => (ms > 0 ? new Promise<void>((r) => setTimeout(r, ms)) : Promise.resolve());

export async function fetchPage(input: string, options: FetchPageOptions = {}, deps: FetchPageDeps = {}): Promise<FetchPageResult> {
  const doFetch = deps.fetch ?? fetch;
  const lookup = deps.lookup ?? (dnsLookup as unknown as LookupFn);
  const now = deps.now ?? Date.now;
  const confirm = deps.confirmMissing ?? ((host: string) => confirmMissingViaDoh(host, doFetch));
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retries = options.retries ?? 1;
  const retryDelayMs = options.retryDelayMs ?? 400;
  const maxRedirects = options.maxRedirects ?? MAX_REDIRECTS;
  const started = now();
  let retried = false;

  const first = isSafeExternalUrl(input);
  if (!first) {
    const text = input.trim();
    let parses = true;
    try {
      new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(text) ? text : `https://${text}`);
    } catch {
      parses = false;
    }
    return { ok: false, cause: parses && text && !/\s/.test(text) ? "unsafe_address" : "invalid_url", retried: false };
  }
  const hadScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(input.trim());

  /** One request, retried on a bad moment. Never follows a redirect itself. */
  async function hop(url: URL): Promise<{ ok: true; res: Response; signal: AbortSignal } | Failure> {
    for (let attempt = 0; ; attempt++) {
      let dns = await checkHost(url.hostname, lookup);
      // Never say a name does not exist unless an independent resolver agrees; otherwise it was a bad moment.
      if (dns === "domain_not_found" && (await confirm(url.hostname)) !== "gone") dns = "connection_failed";
      if (dns !== "ok") {
        if (dns === "connection_failed" && attempt < retries && !options.signal?.aborted) {
          retried = true;
          await sleep(retryDelayMs);
          continue;
        }
        return { ok: false, cause: dns, retried };
      }
      const signal = AbortSignal.any([AbortSignal.timeout(timeoutMs), ...(options.signal ? [options.signal] : [])]);
      let cause: FailureCause | null = null;
      let status: number | undefined;
      try {
        const res = await doFetch(url.toString(), {
          redirect: "manual",
          signal,
          headers: { "user-agent": USER_AGENT, accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5", "accept-language": "en" },
        });
        status = res.status;
        const isRedirect = res.status >= 300 && res.status < 400 && res.headers.has("location");
        cause = isRedirect ? null : classifyStatus(res.status);
        if (cause === null) return { ok: true, res, signal };
        await safeCancel(res.body);
      } catch (err) {
        cause = classifyError(err);
        if (cause === "domain_not_found" && (await confirm(url.hostname)) !== "gone") cause = "connection_failed";
      }
      if (retryable(cause) && attempt < retries && !options.signal?.aborted) {
        retried = true;
        await sleep(retryDelayMs);
        continue;
      }
      return { ok: false, cause, retried, status };
    }
  }

  async function chain(start: URL): Promise<FetchPageResult> {
    let current = start;
    const redirects: string[] = [];
    const seen = new Set<string>([current.toString()]);
    for (;;) {
      const r = await hop(current);
      if (!r.ok) return { ...r, finalUrl: current.toString() };
      const { res, signal } = r;

      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get("location") ?? "";
        await safeCancel(res.body);
        let next: URL | null = null;
        try {
          next = isSafeExternalUrl(new URL(location, current).toString());
        } catch {
          next = null;
        }
        if (!next) return { ok: false, cause: "unsafe_address", retried, finalUrl: current.toString() };
        if (redirects.length >= maxRedirects || seen.has(next.toString())) return { ok: false, cause: "too_many_redirects", retried, finalUrl: current.toString() };
        seen.add(next.toString());
        redirects.push(next.toString());
        current = next;
        continue;
      }

      const contentType = res.headers.get("content-type") ?? "";
      const declaredHtml = /text\/html|application\/xhtml\+xml/i.test(contentType);
      if (contentType && !declaredHtml) {
        await safeCancel(res.body);
        return { ok: false, cause: "not_html", retried, status: res.status, finalUrl: current.toString() };
      }

      let body: { bytes: Uint8Array; truncated: boolean };
      try {
        body = await readBody(res, signal);
      } catch (err) {
        return { ok: false, cause: classifyError(err), retried, status: res.status, finalUrl: current.toString() };
      }
      if (!declaredHtml && !looksLikeHtml(body.bytes)) return { ok: false, cause: "not_html", retried, status: res.status, finalUrl: current.toString() };

      const html = new TextDecoder(pickCharset(contentType, body.bytes)).decode(body.bytes);
      return {
        ok: true,
        status: res.status,
        finalUrl: current.toString(),
        redirects,
        html,
        truncated: body.truncated,
        bytesRead: body.bytes.length,
        contentType,
        retried,
        movedToOtherDomain: siteOf(current.toString()) !== siteOf(start.toString()),
        usedHttpFallback: false,
        elapsedMs: now() - started,
      };
    }
  }

  const result = await chain(first);
  // A bare domain whose https side is simply not answering may still serve plain http.
  if (!result.ok && !hadScheme && first.protocol === "https:" && (result.cause === "connection_failed" || result.cause === "timeout") && !options.signal?.aborted) {
    const http = new URL(first.toString());
    http.protocol = "http:";
    const fallback = await chain(http);
    if (fallback.ok) return { ...fallback, usedHttpFallback: true };
  }
  return result;
}

const HOST_OK = /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9-]{2,63}$/i;

/**
 * "This address does not exist" is a serious thing to tell an owner, and a lookup can fail on our side
 * (a weak connection, a resolver having a bad moment). So before we say it, a second, independent
 * resolver (Cloudflare's public DNS-over-HTTPS) must clearly say the name does not exist (NXDOMAIN).
 * Anything else, including not being able to ask, is "unsure" and never becomes an accusation.
 */
export async function confirmMissingViaDoh(host: string, doFetch: typeof fetch, timeoutMs = 4000): Promise<MissingVerdict> {
  if (!HOST_OK.test(host)) return "unsure";
  try {
    const res = await doFetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(host)}&type=A`, {
      headers: { accept: "application/dns-json" },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return "unsure";
    const body = (await res.json()) as { Status?: number; Answer?: unknown[] };
    if (body.Status === 3) return "gone";
    if (body.Status === 0 && Array.isArray(body.Answer) && body.Answer.length > 0) return "exists";
    return "unsure";
  } catch {
    return "unsure";
  }
}

async function checkHost(host: string, lookup: LookupFn): Promise<"ok" | "unsafe_address" | "domain_not_found" | "connection_failed"> {
  let records: LookupResult;
  try {
    records = await lookup(host, { all: true, verbatim: true });
  } catch (err) {
    const code = (err as { code?: string })?.code;
    return code === "ENOTFOUND" || code === "ENODATA" ? "domain_not_found" : "connection_failed";
  }
  if (records.length === 0) return "domain_not_found";
  return records.some((r) => isBlockedIp(r.address)) ? "unsafe_address" : "ok";
}
