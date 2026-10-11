import { describe, expect, it } from "vitest";
import { classifyWebsiteInput, describeInput } from "@/lib/scan/input";

// IN-03, IN-04, IN-05, UB-12: people paste all kinds of things into the
// "website" box. Each one must be recognised and sent to the right path, never
// scanned as if it were a website and never answered with an error page.

describe("classifyWebsiteInput", () => {
  it.each(["", "   ", "\n"])("%j is empty", (v) => expect(classifyWebsiteInput(v)).toEqual({ kind: "empty" }));

  it.each(["toss.example", "https://www.toss.example/about?x=1", "HTTP://TOSS.EXAMPLE", "  toss.example  ", "toss.com.ng", "https://bücher.example"])(
    "%j is a website",
    (v) => expect(classifyWebsiteInput(v).kind).toBe("website")
  );

  it.each([
    ["instagram.com/tossspa", "instagram", "tossspa"],
    ["https://www.instagram.com/tossspa/", "instagram", "tossspa"],
    ["https://instagram.com/TossSpa/?hl=en", "instagram", "tossspa"],
    ["facebook.com/tossspa", "facebook", "tossspa"],
    ["https://m.facebook.com/tossspa", "facebook", "tossspa"],
    ["fb.com/tossspa", "facebook", "tossspa"],
    ["https://www.tiktok.com/@tossspa", "tiktok", "tossspa"],
    ["x.com/tossspa", "x", "tossspa"],
    ["https://twitter.com/tossspa", "x", "tossspa"],
    ["linkedin.com/company/toss-spa", "linkedin", "toss-spa"],
    ["https://www.youtube.com/@tossspa", "youtube", "@tossspa"],
  ])("%s is a social profile", (v, platform, handle) => expect(classifyWebsiteInput(v)).toEqual({ kind: "social", platform, handle }));

  it("a bare @handle is a handle on an unknown platform", () => {
    expect(classifyWebsiteInput("@tossspa")).toEqual({ kind: "handle", handle: "tossspa" });
  });

  it.each([
    ["wa.me/2348031234567", "+2348031234567"],
    ["https://wa.me/2348031234567?text=hi", "+2348031234567"],
    ["https://api.whatsapp.com/send?phone=2348031234567", "+2348031234567"],
  ])("%s is a WhatsApp link", (v, e164) => expect(classifyWebsiteInput(v)).toEqual({ kind: "whatsapp", e164 }));

  it.each([
    ["0803 123 4567", "+2348031234567"],
    ["+234 803 123 4567", "+2348031234567"],
    ["08031234567", "+2348031234567"],
  ])("%s is a phone number", (v, e164) => expect(classifyWebsiteInput(v)).toEqual({ kind: "phone", e164 }));

  it.each([
    "https://goo.gl/maps/abc123", "https://maps.app.goo.gl/xyz", "https://www.google.com/maps/place/Toss+Spa/@6.4,3.4,17z", "https://maps.google.com/?cid=123", "https://g.page/tossspa",
  ])("%s is a Google Maps link", (v) => expect(classifyWebsiteInput(v).kind).toBe("google_maps"));

  it.each(["linktr.ee/tossspa", "https://bio.link/tossspa", "beacons.ai/tossspa", "https://tossspa.carrd.co"])("%s is a link page", (v) =>
    expect(classifyWebsiteInput(v).kind).toBe("link_page")
  );

  it.each(["127.0.0.1", "http://8.8.8.8", "http://[::1]", "http://2130706433", "93.184.216.34"])("%s is an IP address", (v) => expect(classifyWebsiteInput(v).kind).toBe("ip"));

  it.each(["localhost", "http://intranet", "printer.local", "db.internal", "http://example.com:8080", "http://user:pw@example.com"])("%s is not a public website address", (v) =>
    expect(["local", "invalid"]).toContain(classifyWebsiteInput(v).kind)
  );

  it.each(["not a url at all", "ftp://example.com", "javascript:alert(1)", "file:///etc/passwd", "a".repeat(3000)])("%j is invalid", (v) =>
    expect(classifyWebsiteInput(v).kind).toBe("invalid")
  );
});

describe("describeInput: what we say back (never an error page, never jargon)", () => {
  const words = (s: string) => s.toLowerCase();

  it("a website needs no message", () => {
    expect(describeInput(classifyWebsiteInput("toss.example"))).toBeNull();
  });

  it.each([
    ["instagram.com/tossspa", /instagram/, /profile|account/],
    ["facebook.com/tossspa", /facebook/, /profile|page/],
    ["wa.me/2348031234567", /whatsapp/, /number/],
    ["0803 123 4567", /phone/, /website/],
    ["https://goo.gl/maps/abc", /google/, /map|listing/],
    ["linktr.ee/tossspa", /link/, /page/],
    ["127.0.0.1", /number/, /website address/],
    ["localhost", /website address/, /public|real|your/],
    ["not a url at all", /website address/, /example|like/],
    ["", /website/, /paste|type|enter/],
  ])("%j gets a helpful message", (input, a, b) => {
    const msg = describeInput(classifyWebsiteInput(input));
    expect(msg).toBeTruthy();
    expect(words(msg!)).toMatch(a);
    expect(words(msg!)).toMatch(b);
    // plain words: no technical jargon, no raw error talk
    expect(words(msg!)).not.toMatch(/\b(invalid|error|exception|undefined|null|regex|ssrf|dns|ip address)\b/);
    expect(msg!.length).toBeLessThan(220);
  });

  it("tells the owner we can use the social profile instead, rather than refusing", () => {
    expect(describeInput(classifyWebsiteInput("instagram.com/tossspa"))).toMatch(/use it|we can use|check it|add it/i);
  });
});
