import { scan } from "./scan.mjs";
globalThis.fetch = ((o) => (u, x = {}) => o(u, { ...x, signal: AbortSignal.timeout(25000) }))(globalThis.fetch);
const sites = ["https://luxcatalog.vercel.app/", "https://julie-luxury-spa.vercel.app/", "https://shopluxury-site.vercel.app/", "https://oj-clothings-repo.vercel.app/", "https://www.forno.ng/", "https://femmeng.com/"];
for (const u of sites) {
  const sigs = [];
  for (let i = 0; i < 3; i++) { const r = await scan(u); sigs.push(r.a ? JSON.stringify({ ...r.a, textChars: Math.round(r.a.textChars / 50) }) + `|robots:${r.robots}|sitemap:${r.sitemap}` : "FAIL:" + JSON.stringify(r.page)); }
  const same = sigs.every((s) => s === sigs[0]);
  console.log(same ? "STABLE  " : "UNSTABLE", u);
  if (!same) sigs.forEach((s, i) => console.log("   run", i + 1, s.slice(0, 200)));
}
