import { readFileSync } from "node:fs";
const r = JSON.parse(readFileSync("raw-results-v2.json", "utf8"));
const pct = (n, d) => d ? `${n}/${d} (${Math.round(100 * n / d)}%)` : "n/a";
const q = (arr, p) => arr.length ? [...arr].sort((a, b) => a - b)[Math.min(arr.length - 1, Math.floor(p * arr.length))] : null;
const loaded = r.filter((x) => x.a);
console.log("sites:", r.length, "| page loaded + parsed:", loaded.length);
console.log("\n== outcome by site");
for (const x of r.sort((a, b) => a.kind.localeCompare(b.kind))) {
  const a = x.a;
  console.log(String(x.totalMs ?? "-").padStart(5) + "ms", (x.page?.status ?? x.page?.error ?? "?").toString().slice(0, 22).padEnd(22), x.kind.padEnd(22), x.url.replace("https://", "").slice(0, 42).padEnd(42),
    a ? `title:${a.title ? "y" : "N"} desc:${a.description >= 20 ? "y" : "N"} vp:${a.viewport ? "y" : "N"} tel:${a.tel} wa:${a.whatsapp} ph:${a.phonesInText} soc:${Object.keys(a.social).join(",") || "-"} ld:${a.jsonLd.join("/") || "-"} chars:${a.textChars}${a.jsRenderedSuspect ? " JS?" : ""}` : "");
}
const t = r.map((x) => x.totalMs).filter(Boolean);
console.log("\n== latency (this PC, Lagos): p50", q(t, .5), "p90", q(t, .9), "max", Math.max(...t));
console.log("page-only ms p50", q(r.map((x) => x.ms?.page).filter(Boolean), .5), "p90", q(r.map((x) => x.ms?.page).filter(Boolean), .9));
console.log("\n== signal hit rates among loaded pages");
const sig = {
  "title": (a) => !!a.title, "meta description >=20": (a) => a.description >= 20, "viewport": (a) => a.viewport, "canonical": (a) => a.canonical,
  "lang attr": (a) => a.lang, "og:image": (a) => a.ogImage, "favicon link": (a) => a.favicon, "has h1": (a) => a.h1 > 0,
  "JSON-LD present": (a) => a.jsonLd.length > 0, "LocalBusiness-ish schema": (a) => a.jsonLd.some((t) => /LocalBusiness|Organization|Store|Dentist|Restaurant|Spa|Hospital/i.test(t)),
  "tel: link": (a) => a.tel > 0, "WhatsApp link": (a) => a.whatsapp > 0, "phone in visible text": (a) => a.phonesInText > 0, "mailto link": (a) => a.mailto > 0,
  "any social link": (a) => Object.keys(a.social).length > 0, "instagram link": (a) => !!a.social.instagram, "facebook link": (a) => !!a.social.facebook, "tiktok link": (a) => !!a.social.tiktok,
  "JS-rendered suspect": (a) => a.jsRenderedSuspect,
};
for (const [k, f] of Object.entries(sig)) console.log(k.padEnd(28), pct(loaded.filter((x) => f(x.a)).length, loaded.length));
console.log("robots.txt", pct(r.filter((x) => x.robots).length, r.length), "| sitemap.xml", pct(r.filter((x) => x.sitemap).length, r.length));
const certs = r.filter((x) => x.cert?.daysLeft != null);
console.log("TLS read ok", pct(certs.length, r.filter((x) => x.url.startsWith("https")).length), "| expiring <30d:", certs.filter((x) => x.cert.daysLeft < 30).map((x) => x.url).join(", ") || "none", "| not authorized:", certs.filter((x) => !x.cert.authorized).map((x) => x.url).join(", ") || "none");
console.log("\n== failures"); for (const x of r.filter((x) => !x.a)) console.log(" ", x.url, "->", JSON.stringify(x.page));
