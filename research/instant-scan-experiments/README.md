# Instant-scan experiments (2026-10-10)

Throwaway scripts that tested the assumptions behind the free instant scan before any product code was written. The plan and the results are in [docs/04-product/visibility-os-instant-scan-plan.md](../../docs/04-product/visibility-os-instant-scan-plan.md). Not part of the pnpm workspace and not production code.

To rerun, copy this folder somewhere outside the repo and:

```bash
npm init -y && npm i cheerio@1.0.0 playwright-core@1.48.2
node run-raw.mjs            # raw fetch scan of the 30-site sample -> raw-results.json
node rerun.mjs              # retry failures sequentially, 20s limit -> raw-results-v2.json
node analyse-raw.mjs        # hit rates, latency (edit the input file name inside)
node rendered.mjs           # raw fetch vs real browser (needs Chrome; path inside)
node classify.mjs           # why requests fail (DNS, certificate, timeout, HTTP status)
node cap.mjs <big-file-url> # naive full download vs streamed 500 KB cap
node repeat.mjs             # same site 3 times: are the findings identical?
node --test limiter.test.mjs # abuse-limit decision rules
```

Results depend on the network you run them from. These were run from Lagos on a slow, flaky connection; a Vercel datacenter will differ, which is why the plan starts with a spike on a Vercel preview.
