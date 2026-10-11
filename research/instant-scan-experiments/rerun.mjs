import { readFileSync, writeFileSync } from "node:fs";
import { scan } from "./scan.mjs";
const prev = JSON.parse(readFileSync("raw-results.json", "utf8"));
const failed = prev.filter((x) => !x.a);
const out = prev.filter((x) => x.a);
// Sequential, 20s limit, one retry: separates "site is bad" from "this network is bad".
globalThis.fetch = ((orig) => (u, o = {}) => orig(u, { ...o, signal: AbortSignal.timeout(20000) }))(globalThis.fetch);
for (const f of failed) {
  let r, attempts = 0;
  do { attempts++; r = await scan(f.url).catch((e) => ({ url: f.url, page: { error: String(e) } })); } while (!r.a && attempts < 2 && !/fetch failed|ENOTFOUND/.test(JSON.stringify(r.page)));
  r.kind = f.kind; r.attempts = attempts; out.push(r);
  console.log(String(r.totalMs ?? "-").padStart(6) + "ms", attempts + "x", (r.page?.status ?? r.page?.error ?? "?").toString().slice(0, 40).padEnd(40), f.url);
}
writeFileSync("raw-results-v2.json", JSON.stringify(out, null, 1));
