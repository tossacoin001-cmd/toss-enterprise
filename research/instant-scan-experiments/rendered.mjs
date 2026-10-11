// Two-check standard: compare what a plain server fetch sees (raw) with what a
// real browser sees after JavaScript runs (rendered), on the same pages.
import { chromium } from "playwright-core";
import { readFileSync, writeFileSync } from "node:fs";

const raw = JSON.parse(readFileSync("raw-results-v2.json", "utf8")).filter((x) => x.a);
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });

const extract = () => {
  const links = [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href"));
  const text = (document.body?.innerText || "").replace(/\s+/g, " ").trim();
  const re = { instagram: /instagram\.com\/(?!p\/|reel\/|explore|accounts)[A-Za-z0-9._]{2,30}/i, facebook: /facebook\.com\/(?!sharer|share|dialog|tr\?|plugins)[A-Za-z0-9.\-_/]{2,80}/i, tiktok: /tiktok\.com\/@[A-Za-z0-9._]{2,30}/i, x: /(?:twitter|x)\.com\/(?!intent|share|home)[A-Za-z0-9_]{2,30}/i, linkedin: /linkedin\.com\/(?:company|in)\//i, youtube: /youtube\.com\/(?:@|channel\/|c\/|user\/)/i };
  const social = Object.keys(re).filter((k) => links.some((h) => re[k].test(h)));
  return {
    title: (document.title || "").trim().slice(0, 80),
    description: (document.querySelector('meta[name="description" i]')?.content || "").trim().length,
    h1: document.querySelectorAll("h1").length,
    tel: links.filter((h) => /^tel:/i.test(h)).length,
    whatsapp: links.filter((h) => /wa\.me|api\.whatsapp\.com|whatsapp:\/\//i.test(h)).length,
    social,
    jsonLd: document.querySelectorAll('script[type="application/ld+json"]').length,
    textChars: text.length,
  };
};

const rows = [];
const queue = [...raw];
await Promise.all(Array.from({ length: 2 }, async () => {
  while (queue.length) {
    const r = queue.shift();
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, userAgent: "TossVisibilityBot/1.0 (+https://tossvisibilityos.com)" });
    const page = await ctx.newPage();
    let rendered = null, err = null, ms = null;
    const t = Date.now();
    try {
      await page.goto(r.url, { waitUntil: "load", timeout: 45000 });
      await page.waitForTimeout(3000);
      rendered = await page.evaluate(extract);
      ms = Date.now() - t;
    } catch (e) { err = String(e.message).slice(0, 80); }
    await ctx.close();
    const a = r.a;
    const diffs = [];
    if (rendered) {
      if (!!a.title !== !!rendered.title) diffs.push(`title raw=${!!a.title} browser=${!!rendered.title}`);
      if ((a.description >= 20) !== (rendered.description >= 20)) diffs.push(`description raw=${a.description} browser=${rendered.description}`);
      if ((a.h1 > 0) !== (rendered.h1 > 0)) diffs.push(`h1 raw=${a.h1} browser=${rendered.h1}`);
      if ((a.tel > 0) !== (rendered.tel > 0)) diffs.push(`tel raw=${a.tel} browser=${rendered.tel}`);
      if ((a.whatsapp > 0) !== (rendered.whatsapp > 0)) diffs.push(`whatsapp raw=${a.whatsapp} browser=${rendered.whatsapp}`);
      const rs = Object.keys(a.social).sort().join(","), bs = rendered.social.sort().join(",");
      if (rs !== bs) diffs.push(`social raw=[${rs}] browser=[${bs}]`);
      if ((a.jsonLd.length > 0) !== (rendered.jsonLd > 0)) diffs.push(`jsonld raw=${a.jsonLd.length} browser=${rendered.jsonLd}`);
      if (rendered.textChars > 3 * Math.max(a.textChars, 1) && rendered.textChars - a.textChars > 500) diffs.push(`visible text raw=${a.textChars} browser=${rendered.textChars}`);
    }
    rows.push({ url: r.url, kind: r.kind, rawChars: a.textChars, rendered, err, ms, diffs });
    console.log((err ? "ERR " : diffs.length ? "DIFF" : "same").padEnd(5), String(ms ?? "-").padStart(6) + "ms", r.url.replace("https://", "").slice(0, 38).padEnd(38), err || diffs.join(" ; "));
  }
}));
await browser.close();
writeFileSync("rendered-results.json", JSON.stringify(rows, null, 1));
const ok = rows.filter((x) => x.rendered);
console.log(`\nbrowser loaded ${ok.length}/${rows.length}; pages where raw and browser disagree on at least one signal: ${ok.filter((x) => x.diffs.length).length}/${ok.length}`);
