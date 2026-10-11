import { describe, expect, it } from "vitest";
import { BODY_AFTER_HEAD_BYTES, HEAD_CAP_BYTES, fetchPage, isCertainCause } from "@/lib/scan/fetch-page";
import { GOOD_PAGE, chunked, dnsError, endlessBody, fakeLookup, fakeNet, html, netError, redirect, res } from "./helpers";

// EN-01..EN-06, EN-25, SE-05, SE-15. Everything here runs against a scripted
// fake internet: each way a real site can fail is reproduced, not guessed.

const FAST = { timeoutMs: 80, retryDelayMs: 0 };
const run = (url: string, routes: Parameters<typeof fakeNet>[0], opts: Parameters<typeof fetchPage>[1] = {}, dns = fakeLookup()) => {
  const net = fakeNet(routes);
  return fetchPage(url, { ...FAST, ...opts }, { fetch: net.fetch, lookup: dns.lookup }).then((result) => ({ result, net, dns }));
};

describe("a normal page", () => {
  it("returns the page, the final address and no redirects", async () => {
    const { result } = await run("https://toss.example/", { "https://toss.example/": res(GOOD_PAGE) });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.status).toBe(200);
    expect(result.finalUrl).toBe("https://toss.example/");
    expect(result.redirects).toEqual([]);
    expect(result.html).toContain("<title>Toss Spa Lagos</title>");
    expect(result.retried).toBe(false);
    expect(result.truncated).toBe(false);
  });

  it("identifies itself honestly and follows redirects itself, never automatically (SE-15, SE-05)", async () => {
    const { net } = await run("https://toss.example/", { "https://toss.example/": res(GOOD_PAGE) });
    const req = net.requests[0];
    expect(req.headers.get("user-agent")).toMatch(/TossVisibilityBot\/\d/);
    expect(req.headers.get("user-agent")).toContain("tossvisibilityos.com");
    expect(req.redirect).toBe("manual");
    expect(req.signal).toBeDefined();
  });
});

describe("EN-01: every way a request can fail is classified", () => {
  it.each([
    ["ENOTFOUND", "domain_not_found", true],
    ["CERT_HAS_EXPIRED", "certificate_expired", true],
    ["DEPTH_ZERO_SELF_SIGNED_CERT", "certificate_untrusted", true],
    ["SELF_SIGNED_CERT_IN_CHAIN", "certificate_untrusted", true],
    ["UNABLE_TO_VERIFY_LEAF_SIGNATURE", "certificate_untrusted", true],
    ["ERR_TLS_CERT_ALTNAME_INVALID", "certificate_wrong_name", true],
    ["UND_ERR_CONNECT_TIMEOUT", "timeout", false],
    ["ECONNREFUSED", "connection_failed", false],
    ["ECONNRESET", "connection_failed", false],
    ["EAI_AGAIN", "connection_failed", false], // a temporary DNS hiccup is not proof the domain is missing
  ])("%s -> %s (certain: %s)", async (code, cause, certain) => {
    const { result, net } = await run("https://toss.example/", { "https://toss.example/": netError(code) });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.cause).toBe(cause);
    expect(isCertainCause(result.cause)).toBe(certain);
    // Certain causes are final; uncertain ones are retried once before we say anything.
    expect(net.calls.length).toBe(certain ? 1 : 2);
    expect(result.retried).toBe(!certain);
  });

  it("a domain whose DNS lookup says it does not exist is reported without any request", async () => {
    const { result, net } = await run("https://nope.example/", {}, {}, fakeLookup({ "nope.example": dnsError("ENOTFOUND") }));
    expect(result).toMatchObject({ ok: false, cause: "domain_not_found" });
    expect(net.calls).toEqual([]);
  });

  it.each([
    [403, "blocked"], [401, "blocked"], [429, "blocked"], [404, "not_found"], [410, "not_found"],
  ])("HTTP %i -> %s", async (status, cause) => {
    const { result } = await run("https://toss.example/", { "https://toss.example/": res("nope", { status }) });
    expect(result).toMatchObject({ ok: false, cause, status });
    if (!result.ok) expect(isCertainCause(result.cause)).toBe(false);
  });

  it.each([500, 502, 503, 504])("HTTP %i twice -> server_error after a retry", async (status) => {
    const { result, net } = await run("https://toss.example/", { "https://toss.example/": res("err", { status }) });
    expect(result).toMatchObject({ ok: false, cause: "server_error", status, retried: true });
    expect(net.calls.length).toBe(2);
  });
});

describe("EN-02: one bad moment is never reported as a problem", () => {
  it("a timeout followed by success is a success, marked as retried", async () => {
    const { result, net } = await run("https://toss.example/", { "https://toss.example/": ["hang", res(GOOD_PAGE)] });
    expect(result).toMatchObject({ ok: true, retried: true });
    expect(net.calls.length).toBe(2);
  });

  it("two timeouts in a row is 'timeout', not unreachable, and takes about two attempts, not more", async () => {
    const started = Date.now();
    const { result, net } = await run("https://toss.example/", { "https://toss.example/": "hang" });
    expect(result).toMatchObject({ ok: false, cause: "timeout", retried: true });
    expect(net.calls.length).toBe(2);
    expect(Date.now() - started).toBeLessThan(2000);
  });

  it("a 503 followed by a 200 is a success", async () => {
    const { result } = await run("https://toss.example/", { "https://toss.example/": [res("busy", { status: 503 }), res(GOOD_PAGE)] });
    expect(result).toMatchObject({ ok: true, retried: true });
  });

  it("retries can be turned off", async () => {
    const { net } = await run("https://toss.example/", { "https://toss.example/": "hang" }, { retries: 0 });
    expect(net.calls.length).toBe(1);
  });
});

describe("EN-03 and SE-05: redirects", () => {
  it("follows a short chain and lists it", async () => {
    const { result } = await run("http://toss.example/", {
      "http://toss.example/": redirect("https://toss.example/"),
      "https://toss.example/": redirect("https://www.toss.example/"),
      "https://www.toss.example/": res(GOOD_PAGE),
    });
    expect(result).toMatchObject({ ok: true, finalUrl: "https://www.toss.example/", movedToOtherDomain: false });
    if (result.ok) expect(result.redirects).toEqual(["https://toss.example/", "https://www.toss.example/"]);
  });

  it("stops after 5 hops and on a loop", async () => {
    const chain: Record<string, Response> = {};
    for (let i = 0; i < 8; i++) chain[`https://toss.example/${i}`] = redirect(`https://toss.example/${i + 1}`);
    const long = await run("https://toss.example/0", chain);
    expect(long.result).toMatchObject({ ok: false, cause: "too_many_redirects" });

    const loop = await run("https://toss.example/a", { "https://toss.example/a": redirect("https://toss.example/b"), "https://toss.example/b": redirect("https://toss.example/a") });
    expect(loop.result).toMatchObject({ ok: false, cause: "too_many_redirects" });
    expect(loop.net.calls.length).toBeLessThanOrEqual(7);
  });

  it("notes a move to a different site", async () => {
    const { result } = await run("https://old.example/", { "https://old.example/": redirect("https://new-brand.example/"), "https://new-brand.example/": res(GOOD_PAGE) });
    expect(result).toMatchObject({ ok: true, movedToOtherDomain: true, finalUrl: "https://new-brand.example/" });
  });

  it.each([
    "http://127.0.0.1/", "http://169.254.169.254/latest/meta-data/", "http://192.168.0.1/", "http://100.64.0.1/", "https://toss.example:8443/",
    "https://user:pass@toss.example/", "ftp://toss.example/", "http://[::1]/", "http://localhost/",
  ])("a redirect to %s is not followed", async (target) => {
    const { result, net } = await run("https://toss.example/", { "https://toss.example/": redirect(target) });
    expect(result).toMatchObject({ ok: false, cause: "unsafe_address" });
    expect(net.calls).toEqual(["https://toss.example/"]);
  });

  it("a name that resolves to a private address is never requested, at the start or mid-chain", async () => {
    const dns = fakeLookup({ "internal.attacker.example": "10.0.0.5", "rebind.attacker.example": ["93.184.216.34", "127.0.0.1"] });
    const first = await run("https://internal.attacker.example/", { "*": res(GOOD_PAGE) }, {}, dns);
    expect(first.result).toMatchObject({ ok: false, cause: "unsafe_address" });
    expect(first.net.calls).toEqual([]);

    const mid = await run("https://toss.example/", { "https://toss.example/": redirect("https://rebind.attacker.example/") }, {}, dns);
    expect(mid.result).toMatchObject({ ok: false, cause: "unsafe_address" });
    expect(mid.net.calls).toEqual(["https://toss.example/"]);
  });
});

describe("input that is not a fetchable address", () => {
  it.each(["http://127.0.0.1", "http://example.com:6379", "http://user:pw@example.com", "http://localhost", "http://8.8.8.8"])("%s is refused without a request", async (url) => {
    const { result, net } = await run(url, { "*": res(GOOD_PAGE) });
    expect(result).toMatchObject({ ok: false, cause: "unsafe_address" });
    expect(net.calls).toEqual([]);
  });

  it.each(["", "not a url", "https://exa mple.com"])("%j is invalid_url", async (url) => {
    const { result, net } = await run(url, { "*": res(GOOD_PAGE) });
    expect(result).toMatchObject({ ok: false, cause: "invalid_url" });
    expect(net.calls).toEqual([]);
  });

  it("a bare domain tries https first", async () => {
    const { net } = await run("toss.example", { "https://toss.example/": res(GOOD_PAGE) });
    expect(net.calls[0]).toBe("https://toss.example/");
  });

  it("a bare domain whose https port is closed falls back to http and says so", async () => {
    const { result } = await run("toss.example", { "https://toss.example/": netError("ECONNREFUSED"), "http://toss.example/": res(GOOD_PAGE) });
    expect(result).toMatchObject({ ok: true, usedHttpFallback: true, finalUrl: "http://toss.example/" });
  });

  it("an expired certificate is NOT papered over with an http fallback", async () => {
    const { result, net } = await run("toss.example", { "https://toss.example/": netError("CERT_HAS_EXPIRED"), "http://toss.example/": res(GOOD_PAGE) });
    expect(result).toMatchObject({ ok: false, cause: "certificate_expired" });
    expect(net.calls).toEqual(["https://toss.example/"]);
  });
});

describe("EN-04 and EN-25: reading is streamed and capped, and finds the head wherever it ends", () => {
  it("stops reading an endless page and still returns what it has", async () => {
    const { stream, state } = endlessBody(65536);
    const started = Date.now();
    const { result } = await run("https://toss.example/", { "https://toss.example/": res(stream) });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.truncated).toBe(true);
    expect(state.pulled).toBeLessThanOrEqual(HEAD_CAP_BYTES + 262144);
    expect(state.cancelled).toBe(true);
    expect(Date.now() - started).toBeLessThan(5000);
  });

  it("finds the title when the head is 600 KB of inline code (the clinic page that read as 'no title')", async () => {
    const bloat = `<style>${"a{color:red}".repeat(52000)}</style>`; // about 620 KB
    const page = html({ headExtra: bloat });
    expect(page.indexOf("</head>")).toBeGreaterThan(600_000);
    const { stream } = chunked(page);
    const { result } = await run("https://toss.example/", { "https://toss.example/": res(stream) });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.html).toContain("<title>Toss Spa Lagos</title>");
      expect(result.html).toContain("<h1>Toss Spa</h1>");
      expect(result.truncated).toBe(false);
    }
  });

  it("after the head, reads only a bounded slice of a huge body", async () => {
    const bigBody = `<p>${"x".repeat(3_000_000)}</p>`;
    const { stream, state } = chunked(html({ body: bigBody }));
    const { result } = await run("https://toss.example/", { "https://toss.example/": res(stream) });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.truncated).toBe(true);
    expect(state.pulled).toBeLessThanOrEqual(2_000 + BODY_AFTER_HEAD_BYTES + 262144);
  });

  it("does not read the body of a file that is not a web page", async () => {
    const { stream, state } = endlessBody(65536);
    const { result } = await run("https://toss.example/", { "https://toss.example/": res(stream, { type: "application/pdf" }) });
    expect(result).toMatchObject({ ok: false, cause: "not_html" });
    expect(state.pulled).toBeLessThanOrEqual(65536 * 2);
  });
});

describe("EN-05 and EN-06: content types and character sets", () => {
  it.each(["application/pdf", "image/png", "application/json", "application/zip", "video/mp4", "text/plain"])("%s is not a web page", async (type) => {
    const { result } = await run("https://toss.example/", { "https://toss.example/": res("data", { type }) });
    expect(result).toMatchObject({ ok: false, cause: "not_html" });
  });

  it("accepts xhtml, and html with no content type when the body is plainly html", async () => {
    const a = await run("https://toss.example/", { "https://toss.example/": res(GOOD_PAGE, { type: "application/xhtml+xml" }) });
    expect(a.result.ok).toBe(true);
    const b = await run("https://toss.example/", { "https://toss.example/": new Response(new TextEncoder().encode(GOOD_PAGE), { status: 200 }) });
    expect(b.result.ok).toBe(true);
  });

  it("decodes ISO-8859-1 and Windows-1252 from the header", async () => {
    const latin = Uint8Array.from([...new TextEncoder().encode("<html><head><title>Caf")].concat([0xe9]).concat([...new TextEncoder().encode("</title></head><body>x</body></html>")]));
    const a = await run("https://toss.example/", { "https://toss.example/": res(latin, { type: "text/html; charset=iso-8859-1" }) });
    expect(a.result.ok && a.result.html).toContain("Café");
    const smart = Uint8Array.from([...new TextEncoder().encode("<html><head><title>Tom")].concat([0x92]).concat([...new TextEncoder().encode("s Spa</title></head><body>x</body></html>")]));
    const b = await run("https://toss.example/", { "https://toss.example/": res(smart, { type: "text/html; charset=windows-1252" }) });
    expect(b.result.ok && b.result.html).toContain("Tom’s Spa");
  });

  it("reads the charset from the page itself when the header has none", async () => {
    const bytes = Uint8Array.from([...new TextEncoder().encode('<html><head><meta charset="windows-1252"><title>Caf')].concat([0xe9]).concat([...new TextEncoder().encode("</title></head><body>x</body></html>")]));
    const { result } = await run("https://toss.example/", { "https://toss.example/": res(bytes, { type: "text/html" }) });
    expect(result.ok && result.html).toContain("Café");
  });

  it("handles UTF-8 with a byte-order mark", async () => {
    const bom = Uint8Array.from([0xef, 0xbb, 0xbf, ...new TextEncoder().encode("<html><head><title>Ọlá Spa</title></head><body>x</body></html>")]);
    const { result } = await run("https://toss.example/", { "https://toss.example/": res(bom) });
    expect(result.ok && result.html).toContain("<title>Ọlá Spa</title>");
    expect(result.ok && result.html.charCodeAt(0)).not.toBe(0xfeff);
  });
});
