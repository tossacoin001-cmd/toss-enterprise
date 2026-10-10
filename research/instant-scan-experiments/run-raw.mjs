import { writeFileSync } from "node:fs";
import { SITES } from "./sites.mjs";
import { scan } from "./scan.mjs";

const results = [];
const queue = [...SITES];
// 4 at a time, like a modest serverless fan-out, so a slow site doesn't stall everything.
await Promise.all(Array.from({ length: 4 }, async () => {
  while (queue.length) {
    const [url, kind] = queue.shift();
    const r = await scan(url).catch((e) => ({ url, error: String(e) }));
    r.kind = kind;
    results.push(r);
    console.log(String(r.totalMs ?? "-").padStart(6), "ms", (r.page?.status ?? r.page?.error ?? "ERR").toString().padEnd(18), kind.padEnd(22), url);
  }
}));
writeFileSync("raw-results.json", JSON.stringify(results, null, 1));
console.log("saved", results.length);
