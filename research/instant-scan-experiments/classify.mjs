// Why do requests fail? The scan must tell "domain does not exist" (certain) from "slow" or "blocked" (unknown).
const sites = ["https://this-domain-does-not-exist-zz9-toss.com/", "https://expired.badssl.com/", "https://wrong.host.badssl.com/", "https://self-signed.badssl.com/", "http://neverssl.com/", "https://wakamelagos.com/", "https://www.ekohospitals.com/", "https://httpstat.us/503", "https://paystack.com/", "https://airedentalclinic.com/", "https://flutterwave.com/"];
for (const u of sites) {
  const t = Date.now();
  try {
    const r = await fetch(u, { redirect: "follow", signal: AbortSignal.timeout(20000), headers: { "user-agent": "TossVisibilityBot/1.0 (+https://tossvisibilityos.com)" } });
    await r.arrayBuffer();
    console.log(String(Date.now() - t).padStart(6) + "ms", `HTTP ${r.status}`.padEnd(30), u);
  } catch (e) {
    const c = e.cause || {};
    console.log(String(Date.now() - t).padStart(6) + "ms", `${e.name}/${c.code || c.name || "?"}`.padEnd(30), u);
  }
}
