import { describe, expect, it } from "vitest";
import { siteKey } from "@/lib/scan-limits/site-key";

// AB-01: every spelling of one site collapses to one key, so tricks cannot dodge the cache or the limits.
describe("siteKey", () => {
  it.each([
    "https://www.Example.com/", "example.com", "HTTP://EXAMPLE.COM/about?x=1#y", "example.com.", "https://example.com:443/",
    "www.example.com/path", "  example.com  ", "https://EXAMPLE.com/?utm_source=a",
  ])("%j is example.com", (s) => expect(siteKey(s)).toBe("example.com"));

  it("keeps real subdomains apart from www", () => {
    expect(siteKey("https://shop.example.com")).toBe("shop.example.com");
    expect(siteKey("https://www.shop.example.com")).toBe("shop.example.com");
  });

  it("turns international names into one ASCII form", () => {
    expect(siteKey("https://bücher.example/")).toBe("xn--bcher-kva.example");
    expect(siteKey("https://BÜCHER.example")).toBe("xn--bcher-kva.example");
  });

  it.each(["", "localhost", "ftp://example.com", "javascript:alert(1)", "http://", "not a url", "a".repeat(3000), "http://127.0.0.1", "http://[::1]/"])(
    "%j is refused",
    (s) => expect(() => siteKey(s)).toThrow()
  );
});
