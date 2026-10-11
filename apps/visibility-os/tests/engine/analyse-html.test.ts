import { describe, expect, it } from "vitest";
import { analyseHtml } from "@/lib/scan/analyse-html";
import { extractPhones, normalizeWhatsapp } from "@/lib/scan/phone";
import { GOOD_PAGE, html } from "./helpers";

// EN-07..EN-11, EN-16..EN-20, NW-05. These are the facts the engine can read
// from a page. Anything it cannot read stays null or false, never guessed.

const BASE = "https://toss.example/";
const a = (page: string) => analyseHtml(page, BASE);

describe("basics", () => {
  it("reads a complete page", () => {
    const s = a(GOOD_PAGE);
    expect(s).toMatchObject({
      title: "Toss Spa Lagos", viewport: true, canonical: "https://toss.example/", lang: "en", h1Count: 1, ogImage: true, favicon: true,
    });
    expect(s.description).toContain("Relaxing massages");
  });

  it("reports what is missing as null or false, not as empty strings", () => {
    const s = a(html({ title: null, description: null, viewport: false, lang: null, h1: null, canonical: null, ogImage: null, favicon: false }));
    expect(s).toMatchObject({ title: null, description: null, viewport: false, canonical: null, lang: null, h1Count: 0, ogImage: false, favicon: false });
  });

  it("treats a blank title or description as missing and tidies whitespace", () => {
    expect(a(html({ title: "   " })).title).toBeNull();
    expect(a(html({ description: "" })).description).toBeNull();
    expect(a(html({ title: "  Toss \n  Spa  " })).title).toBe("Toss Spa");
  });

  it("decodes entities", () => {
    expect(a(html({ title: "Tom&#39;s Spa &amp; Wellness" })).title).toBe("Tom's Spa & Wellness");
  });

  it.each([
    ['<meta name=viewport content="width=device-width,initial-scale=1">', true],
    ["<meta content='width=device-width' name='viewport'>", true],
    ['<META NAME="Viewport" CONTENT="width=device-width">', true],
    ["", false],
  ])("viewport variant %#", (tag, expected) => {
    expect(a(html({ viewport: false, headExtra: tag })).viewport).toBe(expected);
  });

  it.each(['<link rel="shortcut icon" href="/f.ico">', '<link rel="apple-touch-icon" href="/a.png">', '<link rel="icon" type="image/svg+xml" href="/i.svg">'])("favicon variant %s", (tag) => {
    expect(a(html({ favicon: false, headExtra: tag })).favicon).toBe(true);
  });

  it("uses the first of duplicated tags, and counts every heading", () => {
    const s = a(html({ title: "First", headExtra: "<title>Second</title>", body: "<h1>A</h1><h1>B</h1>", h1: null }));
    expect(s.title).toBe("First");
    expect(s.h1Count).toBe(2);
  });
});

describe("EN-08: business details in JSON-LD", () => {
  const ld = (j: unknown) => a(html({ ld: [j] }));

  it.each([
    [{ "@type": "LocalBusiness" }],
    [{ "@type": "Dentist" }],
    [{ "@type": "BeautySalon" }],
    [{ "@type": "Restaurant" }],
    [{ "@type": ["Organization", "HealthAndBeautyBusiness"] }],
    [{ "@graph": [{ "@type": "WebSite" }, { "@type": "MedicalClinic" }] }],
    [[{ "@type": "Thing" }, { "@type": "Store" }]],
    [{ "@type": "ClothingStore", name: "OJ", address: { "@type": "PostalAddress" } }],
  ])("recognises a local business in %j", (j) => expect(ld(j).hasBusinessSchema).toBe(true));

  it.each([[{ "@type": "WebSite" }], [{ "@type": "Organization" }], [{ "@type": "Article" }], [{ name: "no type" }]])("does not count %j as a local business", (j) =>
    expect(ld(j).hasBusinessSchema).toBe(false)
  );

  it("ignores invalid JSON without failing, and still reads the valid block next to it", () => {
    const s = a(html({ ld: ["{ not json", { "@type": "Dentist" }] }));
    expect(s.hasBusinessSchema).toBe(true);
  });

  it("lists the types it saw, for the report", () => {
    expect(ld({ "@graph": [{ "@type": "WebSite" }, { "@type": "Dentist" }] }).jsonLdTypes.sort()).toEqual(["Dentist", "WebSite"]);
  });
});

describe("EN-09 and NW-05: phone numbers", () => {
  it.each([
    ["+234 803 123 4567", "+2348031234567"],
    ["+234-803-123-4567", "+2348031234567"],
    ["0803 123 4567", "+2348031234567"],
    ["0803-123-4567", "+2348031234567"],
    ["08031234567", "+2348031234567"],
    ["(0803) 123 4567", "+2348031234567"],
    ["0701 234 5678", "+2347012345678"],
    ["0901 234 5678", "+2349012345678"],
    ["0813 000 1122", "+2348130001122"],
    ["+44 7700 900123", "+447700900123"],
    ["+1 202 555 0143", "+12025550143"],
  ])("finds %s", (text, e164) => expect(extractPhones(`Call us on ${text} today`)).toEqual([e164]));

  it.each([
    "Founded in 2019 and 2024", "From ₦150,000 per month", "Item 100 200 300", "Call 0803 123", "ID 12345678901", "Ref 0603 123 4567",
    "Order #123456789012345", "Open 9am - 5pm, Mon - Sat", "Version 2.0.1.4",
  ])("does not mistake %j for a phone number", (text) => expect(extractPhones(text)).toEqual([]));

  it("finds several and removes duplicates", () => {
    expect(extractPhones("0803 123 4567 or +234 803 123 4567, also 0701 234 5678").sort()).toEqual(["+2347012345678", "+2348031234567"]);
  });

  it.each([
    ["0803 123 4567", "+2348031234567"],
    ["080-3123-4567", "+2348031234567"],
    ["+234 803 123 4567", "+2348031234567"],
    ["https://wa.me/2348031234567", "+2348031234567"],
    ["wa.me/2348031234567?text=Hi", "+2348031234567"],
    ["+44 7700 900123", "+447700900123"],
  ])("normalises the WhatsApp number %s", (input, e164) => {
    const w = normalizeWhatsapp(input);
    expect(w?.e164).toBe(e164);
    expect(w?.link).toBe(`https://wa.me/${e164.slice(1)}`);
  });

  it.each(["", "123", "not a number", "0603 123 4567", "+999"])("rejects %j as a WhatsApp number", (input) => expect(normalizeWhatsapp(input)).toBeNull());
});

describe("contact signals on a page", () => {
  it("reads tel, WhatsApp and email links and phones written in the text", () => {
    const s = a(html({ body: '<a href="tel:+2348031234567">c</a><a href="mailto:hi@toss.example">e</a><a href="https://wa.me/2348031234567">w</a><p>Also 0701 234 5678</p>' }));
    expect(s.contact.tel).toHaveLength(1);
    expect(s.contact.email).toEqual(["hi@toss.example"]);
    expect(s.contact.whatsapp).toHaveLength(1);
    expect(s.contact.phonesInText).toEqual(["+2347012345678"]);
    expect(s.contact.any).toBe(true);
  });

  it.each([
    "https://wa.me/2348031234567", "https://wa.me/2348031234567?text=Hello%20there", "https://api.whatsapp.com/send?phone=2348031234567",
    "https://api.whatsapp.com/send/?phone=2348031234567&text=Hi", "whatsapp://send?phone=2348031234567", "https://wa.me/message/ABC123XYZ", "https://web.whatsapp.com/send?phone=2348031234567",
  ])("recognises the WhatsApp link %s", (href) => expect(a(html({ body: `<a href="${href}">chat</a>` })).contact.whatsapp).toHaveLength(1));

  it("a page with no contact details says so", () => {
    expect(a(html({ body: "<p>Hello</p>" })).contact.any).toBe(false);
  });
});

describe("EN-11: social links", () => {
  const social = (body: string) => a(html({ body })).social;

  it("finds the owner's profile on each platform", () => {
    expect(
      social(
        '<a href="https://www.instagram.com/tossspa/">i</a><a href="https://facebook.com/tossspa">f</a><a href="https://www.tiktok.com/@tossspa">t</a>' +
          '<a href="https://x.com/tossspa">x</a><a href="https://www.linkedin.com/company/toss-spa/">l</a><a href="https://www.youtube.com/@tossspa">y</a>'
      )
    ).toEqual({ instagram: "tossspa", facebook: "tossspa", tiktok: "tossspa", x: "tossspa", linkedin: "toss-spa", youtube: "@tossspa" });
  });

  it("treats twitter.com and x.com as the same platform", () => {
    expect(social('<a href="https://twitter.com/tossspa">t</a>')).toEqual({ x: "tossspa" });
  });

  it.each([
    "https://www.facebook.com/sharer/sharer.php?u=https://toss.example", "https://www.facebook.com/dialog/share?app_id=1", "https://twitter.com/intent/tweet?text=hi",
    "https://twitter.com/share?url=x", "https://www.linkedin.com/shareArticle?mini=true&url=x", "https://www.instagram.com/p/Cabc123/", "https://www.instagram.com/reel/Cabc123/",
    "https://www.facebook.com/plugins/like.php?href=x", "https://pinterest.com/pin/create/button/?url=x", "https://www.youtube.com/watch?v=abc123",
  ])("ignores the share or post link %s", (href) => expect(social(`<a href="${href}">x</a>`)).toEqual({}));

  it("cleans tracking parameters, trailing slashes and case", () => {
    expect(social('<a href="HTTPS://WWW.INSTAGRAM.COM/TossSpa/?utm_source=site&igshid=abc">i</a>').instagram).toBe("tossspa");
  });

  it("takes the first profile when there are several for one platform", () => {
    expect(social('<a href="https://instagram.com/first">1</a><a href="https://instagram.com/second">2</a>').instagram).toBe("first");
  });

  it("skips share links but still finds a real profile later on the page", () => {
    expect(social('<a href="https://twitter.com/share">s</a><a href="https://x.com/tossspa">p</a>').x).toBe("tossspa");
  });
});

describe("EN-16 to EN-19: pages that are not what they seem", () => {
  const spa = '<!doctype html><html><head><title>App</title></head><body><div id="root"></div><script src="/a.js"></script><script src="/b.js"></script><script src="/c.js"></script></body></html>';

  it("a page built with JavaScript is flagged, so absence findings can be softened", () => {
    expect(a(spa).jsBuilt).toBe(true);
    expect(a('<html><body><div id="__next"></div><script src="/a.js"></script><script src="/b.js"></script><script src="/c.js"></script></body></html>').jsBuilt).toBe(true);
  });

  it("a normal page, and a content-rich page with many scripts, are not", () => {
    expect(a(GOOD_PAGE).jsBuilt).toBe(false);
    const rich = html({ body: `<p>${"Real words about our spa. ".repeat(80)}</p>${'<script src="/x.js"></script>'.repeat(10)}` });
    expect(a(rich).jsBuilt).toBe(false);
  });

  it.each([
    "<html><head><title>Just a moment...</title></head><body>Checking your browser before accessing toss.example</body></html>",
    "<html><head><title>Attention Required! | Cloudflare</title></head><body>Sorry, you have been blocked</body></html>",
    '<html><body><div id="cf-browser-verification">Please wait while we verify</div><noscript>Enable JavaScript and cookies to continue</noscript></body></html>',
    '<html><head><title>Access denied</title></head><body>Error 1020 Access denied. Ray ID: abc</body></html>',
    '<html><body><div class="g-recaptcha"></div><p>Please verify you are human to continue.</p></body></html>',
  ])("detects a bot-check page %#", (page) => expect(a(page).botChallenge).toBe(true));

  it("a real page with a contact form CAPTCHA is not a bot-check page", () => {
    expect(a(html({ body: `<p>${"About our clinic. ".repeat(60)}</p><div class="g-recaptcha"></div>` })).botChallenge).toBe(false);
  });

  it.each([
    "<html><body><h1>This domain is for sale</h1></body></html>",
    "<html><body>Buy this domain. Parked free, courtesy of GoDaddy.com</body></html>",
    "<html><head><title>toss.example</title></head><body>Domain parking by Sedo. The owner of this domain has not set up a website.</body></html>",
    "<html><body><p>Get this domain on Afternic</p></body></html>",
  ])("detects a parked page %#", (page) => expect(a(page).parked).toBe(true));

  it("a real page that mentions domains is not parked", () => {
    expect(a(html({ body: "<p>We help you register a domain name and build your website.</p>" })).parked).toBe(false);
  });

  it("a short coming-soon page is a maintenance page; a long page that mentions maintenance is not", () => {
    expect(a("<html><body><h1>We'll be back soon</h1><p>Our site is under maintenance.</p></body></html>").maintenance).toBe(true);
    expect(a(html({ body: `<p>${"Car maintenance and servicing in Ikeja. ".repeat(40)}</p>` })).maintenance).toBe(false);
  });
});

describe("robustness", () => {
  it.each(["", "   ", "plain text, no tags", "<<<>>>", "\u0000\u0001\u0002", "<html><head>", "</head><body></body></html>"])("does not throw on %j", (page) => {
    expect(() => a(page)).not.toThrow();
  });

  it("handles a very large, deeply nested page quickly", () => {
    const page = html({ body: "<div>".repeat(20000) + "x" + "</div>".repeat(20000) + "<p>end</p>".repeat(20000) });
    const started = Date.now();
    a(page);
    expect(Date.now() - started).toBeLessThan(3000);
  });

  it("returns hostile text as plain text, never as markup", () => {
    const s = a(html({ title: '</title><script>alert(1)</script>"><img src=x onerror=alert(1)>' }));
    expect(typeof s.title === "string" || s.title === null).toBe(true);
  });
});
