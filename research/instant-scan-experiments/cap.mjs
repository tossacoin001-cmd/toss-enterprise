const url = process.argv[2];
async function naive() { const t = Date.now(); const r = await fetch(url, { signal: AbortSignal.timeout(60000) }); const s = (await r.text()).slice(0, 500_000); return { ms: Date.now() - t, kept: s.length }; }
async function capped(limit = 500_000) {
  const t = Date.now(); const r = await fetch(url, { signal: AbortSignal.timeout(60000) });
  const reader = r.body.getReader(); let got = 0; const chunks = [];
  while (got < limit) { const { done, value } = await reader.read(); if (done) break; chunks.push(value); got += value.length; }
  await reader.cancel(); return { ms: Date.now() - t, readBytes: got, declaredLength: r.headers.get("content-length") };
}
console.log("naive :", JSON.stringify(await naive()));
console.log("capped:", JSON.stringify(await capped()));
