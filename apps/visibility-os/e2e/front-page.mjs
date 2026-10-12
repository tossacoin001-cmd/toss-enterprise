// Real-browser check of the front page: every screen size, motion on and off, slow network, and a
// full journey for each of the three audiences. Needs a running build and Google Chrome.
//
//   1. Build with Cloudflare's always-pass test keys and a local Postgres:
//        NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA pnpm build
//      then start it:  pnpm start -p 3011
//   2. node e2e/front-page.mjs [baseUrl] [outDir]
//
// It is a script, not a unit test, because it needs a browser, a server and the internet.
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:3011";
const OUT = process.argv[3] ?? "e2e-out";
const CHROME = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
mkdirSync(OUT, { recursive: true });

const SCREENS = [
  ["320x568 small Android", 320, 568, true],
  ["360x640 common Android", 360, 640, true],
  ["390x844 iPhone", 390, 844, true],
  ["412x915 large Android", 412, 915, true],
  ["768x1024 tablet", 768, 1024, true],
  ["1024x768 small laptop", 1024, 768, false],
  ["1280x800 laptop", 1280, 800, false],
  ["1920x1080 desktop", 1920, 1080, false],
];

const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  " + detail : ""}`);
};

const browser = await chromium.launch({ executablePath: CHROME });

/** Opens a page, trying again when the connection drops (this is a long run on a home connection). */
async function open(page, url, opts = { waitUntil: "load", timeout: 60000 }) {
  for (let i = 1; ; i++) {
    try {
      return await page.goto(url, opts);
    } catch (e) {
      if (i >= 4 || !/ERR_(INTERNET|NETWORK|CONNECTION|NAME)/.test(String(e.message))) throw e;
      await page.waitForTimeout(3000);
    }
  }
}

// ---- 1. every screen size ---------------------------------------------------------------
for (const [label, width, height, touch] of SCREENS) {
  const ctx = await browser.newContext({ viewport: { width, height }, hasTouch: touch, isMobile: touch && width < 700 });
  const page = await ctx.newPage();
  let bytes = 0; // what really crosses the network (compressed), measured by the browser itself
  const errors = [];
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Network.enable");
  cdp.on("Network.loadingFinished", (e) => { bytes += e.encodedDataLength; });
  page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 120)));
  page.on("pageerror", (e) => errors.push(e.message.slice(0, 120)));
  await page.addInitScript(() => {
    window.__cls = 0;
    new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) window.__cls += e.value; })).observe({ type: "layout-shift", buffered: true });
  });
  await open(page, BASE);
  await page.waitForTimeout(3500);
  const m = await page.evaluate((h) => {
    const box = document.getElementById("scan-website").getBoundingClientRect();
    const tooSmall = [...document.querySelectorAll("button, a, input")].filter((e) => {
      const r = e.getBoundingClientRect();
      if (!r.width || !r.height || e.closest("footer")) return false;
      const inline = e.tagName === "A" && getComputedStyle(e).display === "inline" && e.closest("p, li");
      return !inline && (r.height < 43.5 || r.width < 43.5) && e.type !== "hidden";
    }).map((e) => `${e.tagName}:${(e.textContent || e.id || "").trim().slice(0, 22)}:${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`);
    return {
      scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth,
      boxBottom: Math.round(box.bottom), vh: h, h1: document.querySelectorAll("h1").length, tooSmall, cls: window.__cls,
      h1Bottom: Math.round(document.querySelector("h1").getBoundingClientRect().bottom),
    };
  }, height);
  check(`${label}: no sideways scroll`, m.scrollW <= m.clientW, `${m.scrollW}/${m.clientW}`);
  check(`${label}: headline and scan box are on the first screen`, m.h1Bottom < height && m.boxBottom <= height + 40, `h1 ends ${m.h1Bottom}, box ends ${m.boxBottom}, screen ${height}`);
  check(`${label}: tap targets are 44px or more`, m.tooSmall.length === 0, m.tooSmall.slice(0, 3).join(" "));
  check(`${label}: layout shift is 0.1 or less`, m.cls <= 0.1, m.cls.toFixed(3));
  check(`${label}: no browser errors`, errors.length === 0, errors[0] ?? "");
  check(`${label}: reading the page costs 250 KB or less (the safety check loads only when the form is touched)`, bytes <= 250 * 1024, `${Math.round(bytes / 1024)} KB`);
  await page.screenshot({ path: `${OUT}/home_${width}.png`, fullPage: true });
  await ctx.close();
}

// ---- 2. motion on and off -----------------------------------------------------------------
for (const [label, reduced] of [["motion on", "no-preference"], ["reduced motion", "reduce"]]) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: reduced });
  const page = await ctx.newPage();
  await open(page, BASE);
  await page.waitForTimeout(1200);
  const running = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").length);
  check(`${label}: ${reduced === "reduce" ? "nothing moves" : "the page moves a little"}`, reduced === "reduce" ? running === 0 : running > 0, `${running} running`);
  const visible = await page.evaluate(() => [...document.querySelectorAll(".rise, .pop")].every((e) => getComputedStyle(e).opacity !== "0"));
  check(`${label}: everything is visible`, visible);
  await ctx.close();
}

// ---- 3. slow network ----------------------------------------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 360, height: 640 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 400, downloadThroughput: (400 * 1024) / 8, uploadThroughput: (400 * 1024) / 8 });
  const t = Date.now();
  await open(page, BASE, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForSelector("#scan-website", { state: "visible", timeout: 60000 });
  const ms = Date.now() - t;
  check("slow 3G: the scan box is usable within 8 seconds", ms <= 8000, `${(ms / 1000).toFixed(1)}s`);
  await ctx.close();
}

// ---- 4. one real journey for each audience ------------------------------------------------
const journeys = [
  {
    name: "business with a website",
    audience: "business",
    fill: async (p) => { await p.fill("#scan-website", "tossvisibilityos.com"); },
    expect: async (p) => {
      await p.waitForSelector("text=What to fix, in order", { timeout: 60000 }).catch(() => {});
      const t = await p.innerText("body");
      return { ok: /out of 100/.test(t) && /already working/i.test(t), t };
    },
  },
  {
    name: "business on Instagram or WhatsApp",
    audience: "social",
    fill: async (p) => {
      await p.fill("#scan-name", "Ada's Hair Studio"); await p.fill("#scan-city", "Lagos"); await p.fill("#scan-category", "Hair salon");
      await p.fill("#scan-instagram", "@adashairstudio"); await p.fill("#scan-whatsapp", "0803 123 4567");
    },
    expect: async (p) => {
      await p.waitForSelector("text=Start here", { timeout: 60000 }).catch(() => {});
      const t = await p.innerText("body");
      return { ok: /Start here/.test(t) && /Google Business Profile/i.test(t) && /Instagram[^.]*your word/i.test(t) && /points are waiting/i.test(t) && !/Add a website of your own[\s\S]{0,5}\n0 out of 100/.test(t), t };
    },
  },
  {
    name: "a person (creator)",
    audience: "personal",
    fill: async (p) => {
      await p.fill("#scan-name", "Ada Creates"); await p.fill("#scan-category", "Photographer");
      await p.fill("#scan-instagram", "@adacreates");
    },
    expect: async (p) => {
      await p.waitForSelector("text=Start here", { timeout: 60000 }).catch(() => {});
      const t = await p.innerText("body");
      return { ok: /Start here/.test(t) && /bio/i.test(t) && /one-page site/i.test(t) && !/Google Business Profile|customers walk|opening hours|WhatsApp Business/i.test(t), t };
    },
  },
];

for (const [label, width, height, touch] of [SCREENS[1], SCREENS[6]]) {
  for (const j of journeys) {
    const ctx = await browser.newContext({ viewport: { width, height }, hasTouch: touch, isMobile: touch });
    const page = await ctx.newPage();
    const started = Date.now();
    try {
      await open(page, BASE);
      await page.click(`[data-audience="${j.audience}"]`);
      await j.fill(page);
      // Like a visitor on a weak connection: if the safety check is slow the page says so, and they press again.
      let pressed = 0;
      for (;;) {
        await page.click("button[type=submit]");
        pressed++;
        const slow = page.waitForSelector("text=press the button again", { timeout: 60000 }).then(() => "slow", () => "waiting");
        const went = page.waitForURL(/\/scan\/[0-9a-f]{32}/, { timeout: 60000 }).then(() => "went", () => "no");
        const first = await Promise.race([slow, went]);
        if (first === "went" || (await page.url().match(/\/scan\/[0-9a-f]{32}/))) break;
        if (pressed >= 3) throw new Error("the scan did not start after three presses");
      }
      if (pressed > 1) console.log(`NOTE  ${j.name} on ${label}: pressed ${pressed} times because the safety check was slow`);
      const r = await j.expect(page);
      const slug = `${j.audience}_${width}`;
      await page.screenshot({ path: `${OUT}/result_${slug}.png`, fullPage: true });
      const noScroll = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
      check(`${j.name} on ${label}: result is right for this audience`, r.ok, r.ok ? `${((Date.now() - started) / 1000).toFixed(0)}s` : r.t.slice(0, 300).replace(/\n+/g, " | "));
      check(`${j.name} on ${label}: result has no sideways scroll`, noScroll);
    } catch (e) {
      check(`${j.name} on ${label}: journey completes`, false, String(e.message).slice(0, 200));
    }
    await ctx.close();
  }
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length} of ${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
