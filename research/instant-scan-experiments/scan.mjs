// Throwaway prototype of the instant-scan engine's RAW (no-browser) checks.
// This is the only thing that can run on a Vercel serverless function, so its
// accuracy against a real browser render is the key thing to measure.
import * as cheerio from "cheerio";
import tls from "node:tls";

const UA = "TossVisibilityBot/1.0 (+https://tossvisibilityos.com)";
const SOCIAL = {
  instagram: /instagram\.com\/(?!p\/|reel\/|explore|accounts)([A-Za-z0-9._]{2,30})/i,
  facebook: /facebook\.com\/(?!sharer|share|dialog|tr\?|plugins)([A-Za-z0-9.\-_/]{2,80})/i,
  tiktok: /tiktok\.com\/@([A-Za-z0-9._]{2,30})/i,
  x: /(?:twitter|x)\.com\/(?!intent|share|home)([A-Za-z0-9_]{2,30})/i,
  linkedin: /linkedin\.com\/(?:company|in)\/([A-Za-z0-9\-_%]{2,60})/i,
  youtube: /youtube\.com\/(?:@|channel\/|c\/|user\/)([A-Za-z0-9\-_.]{2,60})/i,
};
const NG_PHONE = /(?:\+?234|0)[\s-]?[789][01]\d[\s-]?\d{3}[\s-]?\d{4}/g;

async function timed(fn) {
  const t = Date.now();
  try { return { ok: true, value: await fn(), ms: Date.now() - t }; }
  catch (e) { return { ok: false, error: String(e.message || e).slice(0, 80), ms: Date.now() - t }; }
}

async function get(url, ms = 8000) {
  const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(ms), headers: { "user-agent": UA, accept: "text/html,*/*" } });
  const body = (await res.text()).slice(0, 500_000);
  return { status: res.status, finalUrl: res.url, body, headers: Object.fromEntries(res.headers) };
}

function certDays(host) {
  return new Promise((resolve, reject) => {
    const s = tls.connect({ host, port: 443, servername: host, rejectUnauthorized: false, timeout: 5000 }, () => {
      const c = s.getPeerCertificate();
      const ok = s.authorized;
      s.end();
      resolve({ daysLeft: c?.valid_to ? Math.round((Date.parse(c.valid_to) - Date.now()) / 86400000) : null, authorized: ok });
    });
    s.on("error", reject);
    s.on("timeout", () => { s.destroy(); reject(new Error("tls timeout")); });
  });
}

export function analyse(html, finalUrl) {
  const $ = cheerio.load(html);
  const text = $("body").text().replace(/\s+/g, " ").trim();
  const links = $("a[href]").map((_, a) => $(a).attr("href")).get();
  const social = {};
  for (const [name, re] of Object.entries(SOCIAL)) {
    const hit = links.find((h) => re.test(h));
    if (hit) social[name] = hit.match(re)[1].replace(/\/+$/, "");
  }
  const ld = [];
  $('script[type="application/ld+json"]').each((_, s) => {
    try { const j = JSON.parse($(s).text()); (Array.isArray(j) ? j : [j, ...(j["@graph"] || [])]).forEach((n) => n && n["@type"] && ld.push([].concat(n["@type"]).join("/"))); } catch {}
  });
  const imgs = $("img").length;
  const imgsNoAlt = $("img").filter((_, i) => !($(i).attr("alt") || "").trim()).length;
  return {
    title: ($("title").first().text() || "").trim().slice(0, 80),
    description: ($('meta[name="description" i]').attr("content") || "").trim().length,
    viewport: $('meta[name="viewport" i]').length > 0,
    canonical: !!$('link[rel="canonical"]').attr("href"),
    lang: !!$("html").attr("lang"),
    ogImage: !!$('meta[property="og:image"]').attr("content"),
    favicon: $('link[rel~="icon"]').length > 0,
    h1: $("h1").length,
    jsonLd: ld,
    tel: links.filter((h) => /^tel:/i.test(h)).length,
    mailto: links.filter((h) => /^mailto:/i.test(h)).length,
    whatsapp: links.filter((h) => /wa\.me|api\.whatsapp\.com|whatsapp:\/\//i.test(h)).length,
    phonesInText: (text.match(NG_PHONE) || []).length,
    social,
    imgs, imgsNoAlt,
    textChars: text.length,
    scripts: $("script").length,
    // heuristic: very little server-rendered text but many scripts = probably JS-rendered
    jsRenderedSuspect: text.length < 300 && $("script").length >= 3,
  };
}

export async function scan(url) {
  const t0 = Date.now();
  const u = new URL(url);
  const page = await timed(() => get(url));
  const out = { url, ms: {}, page: page.ok ? { status: page.value.status, finalUrl: page.value.finalUrl } : { error: page.error } };
  out.ms.page = page.ms;
  if (page.ok && page.value.status < 400) {
    const a = await timed(async () => analyse(page.value.body, page.value.finalUrl));
    out.a = a.value; out.ms.parse = a.ms;
  }
  const [robots, sitemap, cert] = await Promise.all([
    timed(() => get(`${u.origin}/robots.txt`, 5000)),
    timed(() => get(`${u.origin}/sitemap.xml`, 5000)),
    u.protocol === "https:" ? timed(() => certDays(u.hostname)) : Promise.resolve({ ok: false, error: "http", ms: 0 }),
  ]);
  out.robots = robots.ok ? robots.value.status === 200 && !/<html/i.test(robots.value.body) : null;
  out.sitemap = sitemap.ok ? sitemap.value.status === 200 && /<urlset|<sitemapindex/i.test(sitemap.value.body) : null;
  out.cert = cert.ok ? cert.value : { error: cert.error };
  out.ms.extras = Math.max(robots.ms, sitemap.ms, cert.ms);
  out.totalMs = Date.now() - t0;
  return out;
}
