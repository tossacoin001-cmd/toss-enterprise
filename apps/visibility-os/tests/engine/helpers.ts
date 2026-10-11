/**
 * Offline kit for the scan engine tests: a scripted fake internet, fake DNS,
 * and a page builder. Every network case (timeouts, certificate errors, huge
 * pages, redirect loops) is reproduced here without touching the real network.
 */

// ---- pages -----------------------------------------------------------------

export type PageOptions = {
  title?: string | null;
  description?: string | null;
  viewport?: boolean;
  lang?: string | null;
  h1?: string | null;
  canonical?: string | null;
  ogImage?: string | null;
  favicon?: boolean;
  ld?: unknown[];
  headExtra?: string;
  body?: string;
};

export function html(o: PageOptions = {}): string {
  const {
    title = "Toss Spa Lagos", description = "Relaxing massages and facials in Lekki, Lagos. Book on WhatsApp.",
    viewport = true, lang = "en", h1 = "Toss Spa", canonical = "https://toss.example/", ogImage = "https://toss.example/og.png",
    favicon = true, ld = [], headExtra = "", body = "<p>Welcome to Toss Spa. We offer massages, facials and body treatments in Lekki.</p>",
  } = o;
  return [
    "<!doctype html>",
    `<html${lang ? ` lang="${lang}"` : ""}><head><meta charset="utf-8">`,
    title !== null ? `<title>${title}</title>` : "",
    description !== null ? `<meta name="description" content="${description}">` : "",
    viewport ? '<meta name="viewport" content="width=device-width, initial-scale=1">' : "",
    canonical ? `<link rel="canonical" href="${canonical}">` : "",
    ogImage ? `<meta property="og:image" content="${ogImage}">` : "",
    favicon ? '<link rel="icon" href="/favicon.ico">' : "",
    ...ld.map((j) => `<script type="application/ld+json">${typeof j === "string" ? j : JSON.stringify(j)}</script>`),
    headExtra,
    "</head><body>",
    h1 ? `<h1>${h1}</h1>` : "",
    body,
    "</body></html>",
  ].join("\n");
}

/** A page that would score full marks on the page-level checks. */
export const GOOD_PAGE = html({
  ld: [{ "@context": "https://schema.org", "@type": "BeautySalon", name: "Toss Spa", telephone: "+2348031234567" }],
  body: '<p>Massages, facials and body treatments in Lekki, Lagos.</p><a href="tel:+2348031234567">Call us</a> <a href="https://wa.me/2348031234567">WhatsApp</a>',
});

// ---- network ----------------------------------------------------------------

export type Req = { url: string; headers: Headers; signal: AbortSignal | undefined; redirect: RequestRedirect | undefined };
export type Route = Response | Error | "hang" | ((req: Req) => Response | Promise<Response>);

/** An error shaped like the ones Node's fetch throws: TypeError("fetch failed") with a cause code. */
export function netError(code: string): Error {
  const err = new TypeError("fetch failed");
  (err as Error & { cause?: unknown }).cause = Object.assign(new Error(code), { code });
  return err;
}

type Rebuildable = Response & { __make?: () => Response };

export function res(body: BodyInit | null, init: ResponseInit & { type?: string } = {}): Response {
  const { type = "text/html; charset=utf-8", headers, ...rest } = init;
  const make = () => {
    const h = new Headers(headers);
    if (!h.has("content-type")) h.set("content-type", type);
    return new Response(body, { status: 200, ...rest, headers: h });
  };
  const response: Rebuildable = make();
  // Text and bytes can be handed out fresh on every call. A stream can be read once, so it is
  // handed out as is (cloning would tee it, and cancelling half a tee never completes).
  if (typeof body === "string" || body === null || body instanceof Uint8Array) response.__make = make;
  return response;
}

export function redirect(to: string, status = 302): Response {
  const make = () => new Response(null, { status, headers: { location: to } });
  const response: Rebuildable = make();
  response.__make = make;
  return response;
}

/** A body that streams `chunks` of `chunkSize` bytes forever (or `count` times), counting what was pulled. */
export function endlessBody(chunkSize = 65536, count = Infinity) {
  const state = { pulled: 0, cancelled: false };
  const chunk = new Uint8Array(chunkSize).fill(97); // "a"
  let sent = 0;
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (sent >= count) return controller.close();
      sent += 1;
      state.pulled += chunkSize;
      controller.enqueue(chunk);
    },
    cancel() {
      state.cancelled = true;
    },
  });
  return { stream, state };
}

/** Bytes of `text` split into 16 KB chunks, as a stream (so reads happen incrementally). */
export function chunked(text: string | Uint8Array, size = 16384): { stream: ReadableStream<Uint8Array>; state: { pulled: number } } {
  const bytes = typeof text === "string" ? new TextEncoder().encode(text) : text;
  const state = { pulled: 0 };
  let at = 0;
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (at >= bytes.length) return controller.close();
      const slice = bytes.slice(at, at + size);
      at += size;
      state.pulled += slice.length;
      controller.enqueue(slice);
    },
  });
  return { stream, state };
}

export function fakeNet(routes: Record<string, Route | Route[]>) {
  const calls: string[] = [];
  const requests: Req[] = [];
  const counters = new Map<string, number>();

  const pick = (url: string): Route | Route[] | undefined => {
    const exact = routes[url] ?? routes[url.replace(/\/$/, "")] ?? routes[`${url}/`];
    if (exact !== undefined) return exact;
    try {
      return routes[new URL(url).origin] ?? routes[new URL(url).origin + "/"] ?? routes["*"];
    } catch {
      return routes["*"];
    }
  };

  const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    calls.push(url);
    const req: Req = { url, headers: new Headers(init?.headers), signal: init?.signal ?? undefined, redirect: init?.redirect };
    requests.push(req);
    let route = pick(url);
    if (Array.isArray(route)) {
      const n = counters.get(url) ?? 0;
      counters.set(url, n + 1);
      route = route[Math.min(n, route.length - 1)];
    }
    if (route === undefined) throw netError("ENOTFOUND");
    if (route === "hang") {
      return new Promise<Response>((_, reject) => {
        const s = init?.signal;
        if (!s) return;
        if (s.aborted) return reject(s.reason);
        s.addEventListener("abort", () => reject(s.reason), { once: true });
      });
    }
    if (route instanceof Error) throw route;
    if (typeof route === "function") return route(req);
    return (route as Rebuildable).__make ? (route as Rebuildable).__make!() : route;
  }) as typeof fetch;

  return { fetch: fetchImpl, calls, requests };
}

/** Public addresses for every name unless overridden, like a well-behaved DNS. */
export function fakeLookup(overrides: Record<string, string | string[] | Error> = {}) {
  const asked: string[] = [];
  const lookup = (async (host: string) => {
    asked.push(host);
    const o = overrides[host];
    if (o instanceof Error) throw o;
    const addrs = o === undefined ? ["93.184.216.34"] : Array.isArray(o) ? o : [o];
    return addrs.map((address) => ({ address, family: address.includes(":") ? 6 : 4 }));
  }) as unknown as (host: string, opts: { all: true; verbatim: true }) => Promise<{ address: string; family: number }[]>;
  return { lookup, asked };
}

export const dnsError = (code: string) => Object.assign(new Error(code), { code });

// ---- reading level (a Flesch-Kincaid grade estimate; good enough to catch jargon-heavy copy) ----

function syllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const m = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "").match(/[aeiouy]{1,2}/g);
  return Math.max(1, m ? m.length : 1);
}

export function readingGrade(text: string): number {
  const sentences = Math.max(1, (text.match(/[.!?]+(\s|$)/g) || []).length);
  const words = text.split(/\s+/).filter((w) => /[a-z]/i.test(w));
  if (words.length === 0) return 0;
  const syl = words.reduce((n, w) => n + syllables(w), 0);
  return 0.39 * (words.length / sentences) + 11.8 * (syl / words.length) - 15.59;
}
