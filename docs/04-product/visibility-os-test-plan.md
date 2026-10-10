# Visibility OS: full test specification

- **Status:** Written 2026-10-10, before any instant-scan code. 151 tests specified; 11 already run for real; 4 verified once by hand; 136 waiting for their build slice.
- **Plan this tests:** [visibility-os-instant-scan-plan.md](visibility-os-instant-scan-plan.md). Test rules: [testing-strategy.md](../02-engineering/testing-strategy.md).
- **Where the tests live:** the 11 running tests are in `apps/visibility-os/tests/` (`scoring.test.ts`, `scoring-properties.test.ts`, `ssrf.test.ts`, and others). The other 140 are written as `it.todo` in [instant-scan.todo.test.ts](../../apps/visibility-os/tests/instant-scan.todo.test.ts): they show up as "todo" on every run and become real tests in their slice. Both this page and that file are generated from one list so they cannot disagree.
- **Rule:** a slice is not done until its rows are real, passing tests. 78 of the 151 are P0 (must pass before launch).

## How to read the tables

- **Pri:** P0 launch blocker, P1 should pass at launch, P2 nice to have.
- **When:** the slice that makes the test possible (S0 to S5 in the plan), or Now.
- **Status:** Running (a real test passes today), Running (known gap) (a test passes *because* a bug exists and turns red the day it is fixed), Verified once, not automated, Specified.

## What has been tested already (2026-10-10)

| Area | Test | Result |
|---|---|---|
| Real sites | 30-site sample, plain fetch, 8s | Only 13 loaded: today's 8s limit mislabels working sites |
| | Same, sequential, 20s plus retry | 21 loaded |
| | Failure causes | Domain missing, expired certificate, self-signed, timeout, 403, 404, 500 all distinguishable |
| | Plain fetch vs real browser | Agreed on 13 of 19; 3 of 16 real sites differ (19%) |
| | Repeatability, 3 runs, 6 sites | Identical every time |
| | Body size cap | 2.5s capped vs 19.3s uncapped on 10 MB |
| Social | Real vs made-up accounts (from Lagos) | Instagram, X, YouTube verifiable; Facebook, TikTok not |
| Bot check | Cloudflare Turnstile with documented test keys | Pass, fail, reused and missing tokens behave correctly |
| Abuse rules | 8 tests on the limit logic | All pass |
| Score | 1,024 input combinations; 500 before/after pairs; repeat runs | Always 0 to 100, never drops after a fix, deterministic |
| Security | 33 dangerous addresses against the real code | 23 blocked; **10 requested**: odd ports (6379, 22, 25, 8443), credentials in URLs, reserved ranges (100.64/10, 198.18/15, 192.0.0.0/24, multicast, broadcast). Encoded as SE-02 to SE-04 |
| Whole journey | Sign-up, onboarding, audit, dashboard, re-run, sign-out, weekly job, unsubscribe, health | Passed against a real local database (2026-10-09) |
| Vercel network (S0) | 18 sites and 12 social probes run during a Vercel build, read back through the API | 13 of 15 real sites loaded (the other two: a genuine 500 and a bot block); page responses p50 0.3s, p90 1.3s, max 4.9s; dead domain and expired certificate classified correctly; YouTube, X and LinkedIn real vs missing distinguishable; **Instagram, Facebook, TikTok are not** (login page for servers); one clinic page needs its head read past 500 KB (EN-25). **S0 result: GO** |

## People and devices to test

| Who | Situation | Tests |
|---|---|---|
| Lagos salon owner | Android on MTN, Instagram only, no website | UB-01, NW-01, NW-02 |
| Restaurant owner | Wix or Squarespace site built with JavaScript | UB-02, EN-16 |
| Clinic | Slow WordPress site | UB-03 |
| Creator or personal brand | Only social accounts | UB-04, NW-06 |
| Diaspora or foreign business | Non-Nigerian number or city | UB-05 |
| Consultant | Scans 20 clients | UB-06 |
| Competitor | Scans a rival | UB-07 |
| Bot or scraper | Rotating addresses | UB-08, AB-05 |
| Sceptic | Is this a scam? | UB-09 |
| Sharer | Posts the result in a WhatsApp group | UB-10, UX-09 |
| Returning owner | Fixes something, rescans, gets the weekly email | UB-11, UB-15 |
| Confused user | Pastes the wrong thing | UB-12, IN-05 |

**Devices and browsers (real phones for P0 flows):** Android Chrome, iOS Safari, Samsung Internet, Opera Mini and data-saver, a low-end Android on 3G, desktop Chrome and Firefox. **Screen sizes:** 360x640, 390x844, 768, 1280.

## Environments and tools

| Layer | Tool | Notes |
|---|---|---|
| Unit and property | Vitest (running in CI) | Seeded random inputs so failures reproduce |
| Integration | Vitest against a real local Postgres | Local database recipe in the memory notes; needs `pgbouncer=true` with PGlite |
| Browser journeys | Playwright with system Chrome | Clerk testing token plus captcha bypass; slow machines need long timeouts |
| Network behaviour | Throwaway probe on a Vercel preview (S0), then a post-deploy smoke test (S5) | Results from Lagos differ from Vercel |
| Bot check | Cloudflare documented test keys, then real keys | The real widget needs the founder's Turnstile site |
| Email | Resend, Gmail and Yahoo inboxes | After the domain verifies |
| Payments | Paystack test mode | Step 3 |
| Devices | Real phones | The founder's phone plus two borrowed |

## Slice S0: result (2026-10-10): GO, with three changes

The probe ran inside a Vercel build (same cloud and region family as the functions), read back through the build log. Raw rows: [research/instant-scan-experiments/s0-vercel-results.txt](../../research/instant-scan-experiments/s0-vercel-results.txt).

| Go criterion | Result |
|---|---|
| At least 80% of real sites load from Vercel | **Pass**: 13 of 15 (87%). The two misses are a genuine HTTP 500 and a bot block (403) |
| Dead domain and expired certificate classified | **Pass**: domain missing and certificate expired both identified |
| Instagram real vs made-up account distinguishable | **Fail**: identical login page. Instagram becomes link only |
| X and YouTube 200 vs 404 | **Pass** (and LinkedIn also: 200 vs 404, to be confirmed with more handles in S1) |
| No block pages that break the plan | **Mixed**: Instagram, Facebook and TikTok serve a login page to servers, so they are link only; nothing else blocked |

Changes the plan makes because of S0: (1) Instagram, Facebook and TikTok are self-reported and link only, which changes the no-website path (NW-04); (2) tighter timing is realistic (pages answered in 0.3s at the median) but the 15s ceiling stays for slow Nigerian hosts; (3) read until the end of the head section, not a fixed byte count (EN-25).

## Exit criteria per slice

| Slice | Done when |
|---|---|
| S0 | The five go criteria above are answered with numbers |
| S1 | All rows tagged S1 are real tests and pass; the three known gaps flipped from `it.fails` to `it`; existing audit shows no false unreachable on the 30-site sample |
| S2 | All S2 rows pass against a real database; Turnstile test-key matrix passes; 24-hour cache and caps proven with a fake clock |
| S3 | Browser journeys pass on phone and desktop viewports; accessibility scan clean; wording audit passes; a real-phone pass for UB-01 |
| S4 | The scan-to-sign-up journey passes end to end; scan score equals dashboard score |
| S5 | Smoke test runs after each production deploy; events and the daily summary arrive |

## The tests
### IN: Input and URL handling

| ID | Pri | When | Method | Status | What must be true |
|---|---|---|---|---|---|
| IN-01 | P0 | S2 | unit | Specified | Bare domain, www, http/https, trailing path, upper case and trailing dot all map to one site key |
| IN-02 | P1 | S2 | unit | Specified | International domain names are accepted and normalised |
| IN-03 | P0 | S3 | unit + e2e | Specified | Empty, whitespace, over-long (>2000 chars) and non-URL text get a friendly message, never an error page |
| IN-04 | P0 | S1 | unit | Specified | localhost, single-label hosts and IP addresses get a clear message: enter your website address, not an IP |
| IN-05 | P0 | S1 | unit + e2e | Specified | A social profile URL typed as the website (Instagram, Facebook, TikTok, X, LinkedIn, YouTube) is routed to the social path, not scanned as a website |
| IN-06 | P2 | S3 | unit | Specified | Common typos (.con, missing dot, http//) get a did-you-mean suggestion and are never silently corrected |
| IN-07 | P2 | S1 | unit | Specified | Link-in-bio pages (linktr.ee, bio.link) are scanned but labelled as a link page, not a website |
| IN-08 | P1 | S3 | unit + e2e | Specified | Emoji, look-alike unicode and right-to-left text in the name field are stored safely and shown escaped |
| IN-09 | P1 | S3 | unit | Specified | Business name and city are optional; the scan works without them |

### NW: Visitors with no website yet (the gap we fill)

| ID | Pri | When | Method | Status | What must be true |
|---|---|---|---|---|---|
| NW-01 | P0 | S3 | e2e | Specified | A visitor with no website can start from name, city and category, plus optional social handles and WhatsApp number, with no sign-up |
| NW-02 | P0 | S1 | unit + review | Specified | The no-website result leads with Start here: ordered plain-language steps, free steps first, each with effort and time |
| NW-03 | P0 | S1 | unit | Specified | Only verifiable items are scored; anything not checkable yet (Google listing before the key exists) shows as connect later, never as a failure |
| NW-04 | P1 | S1 | integration | Specified | Instagram, Facebook and TikTok handles are accepted as self-reported and shown as link only (cannot be verified from Vercel); X, YouTube and LinkedIn handles are verified when the platform answers 200 vs 404 |
| NW-05 | P1 | S1 | unit | Specified | WhatsApp numbers validate for +234, 0803, 0701 style, with spaces and dashes, and international numbers; a wa.me link is built |
| NW-06 | P1 | S3 | review | Specified | Individuals and personal brands are supported, with wording that fits (no customers walk in) |
| NW-07 | P1 | S4 | e2e | Specified | The result offers the agency's entry website offer as one option, as a WhatsApp link prefilled with the scan summary, never the only option |
| NW-08 | P1 | S3 | review | Specified | The score never shows a bare discouraging 0: it shows what is verified, points available and the fastest first step |
| NW-09 | P1 | S4 | e2e | Specified | A visitor who later builds a website can add it and rescan; history is kept |

### EN: Scan engine checks

| ID | Pri | When | Method | Status | What must be true |
|---|---|---|---|---|---|
| EN-01 | P0 | S1 | unit (mocked) | Specified | Failure classification: ENOTFOUND, expired certificate, self-signed, connect timeout, refused, 403, 404, 429 and 5xx each map to the right state and wording |
| EN-02 | P0 | S1 | unit | Specified | One timeout never produces unreachable: retry once, then could not check |
| EN-03 | P0 | S1 | unit | Specified | Redirects: at most 5 hops, loops stop, a move to another domain is noted, http to https upgrade is scored correctly |
| EN-04 | P0 | S1 | integration | Specified | The body is streamed and stops at 500 KB: a 10 MB file and an endless stream neither hang nor exhaust memory |
| EN-05 | P1 | S1 | unit | Specified | Non-HTML responses (PDF, image, JSON, zip) give a not-a-web-page finding with no parse crash |
| EN-06 | P1 | S1 | unit | Specified | Character sets (UTF-8, ISO-8859-1, Windows-1252) and gzip or brotli bodies are parsed |
| EN-07 | P0 | Now | unit | Running | Meta tag parsing variants: quoted, unquoted, any order, upper case, duplicates (24 tests exist and stay green) |
| EN-08 | P1 | S1 | unit | Specified | JSON-LD: array, @graph, nested, invalid JSON and huge blobs; LocalBusiness subtypes recognised |
| EN-09 | P1 | S1 | unit | Specified | Nigerian phone formats in text (+234 803, 0803, 0701, spaced, dashed, in brackets) are found and not confused with years or prices |
| EN-10 | P1 | S1 | unit | Specified | WhatsApp links recognised: wa.me, api.whatsapp.com, whatsapp://, with text parameters |
| EN-11 | P1 | S1 | unit | Specified | Social link extraction ignores share buttons and tracking parameters and picks the owner's profile, not a post |
| EN-12 | P0 | S1 | integration | Specified | Social verification from Vercel (S0 result): YouTube, X and LinkedIn answer 404 for a missing account and 200 for a real one; Instagram, Facebook and TikTok serve a login page to servers, so they are link only; any block is could not check; never says an Instagram, Facebook or TikTok account does not exist |
| EN-13 | P1 | S1 | unit | Specified | robots.txt and sitemap.xml detection ignores HTML pages served with status 200 (soft 404) |
| EN-14 | P1 | S1 | integration | Specified | Certificate days left read; under 30 days and expired are flagged; nothing read on plain http |
| EN-15 | P1 | Now | unit | Running | Speed tiers (4s full, 8s half), labelled as measured from our server and never a headline finding (tests exist) |
| EN-16 | P0 | S1 | unit | Specified | Pages built with JavaScript (almost no HTML text, many scripts) get a may-be-built-with-JavaScript note and softened absence findings |
| EN-17 | P0 | S1 | unit | Specified | Bot-blocked sites (403, challenge or CAPTCHA pages) are detected and reported as could not check |
| EN-18 | P2 | S1 | unit | Specified | Parked or placeholder domains are detected as no real site yet |
| EN-19 | P2 | S1 | unit | Specified | Maintenance pages and login-only sites are reported honestly |
| EN-20 | P2 | S1 | unit | Specified | Non-English sites: language attribute respected; title and description wording does not assume English |
| EN-21 | P0 | S1 | integration | Specified | The same site scanned three times gives identical findings |
| EN-22 | P1 | S4 | integration | Specified | The same site produces non-contradicting facts in the scan and in the TE-OS Audit agent |
| EN-23 | P0 | S2 | integration | Specified | A total budget of 30s: partial results are returned with the unfinished checks marked could not check |
| EN-24 | P1 | S2 | load | Specified | Parallel checks stay within function memory and concurrency limits |
| EN-25 | P0 | S1 | unit + integration | Specified | Head tags are found even when the head is huge: read until the end of the head section (up to 2 MB), then up to 500 KB of body. A 1.2 MB page with its title after 500 KB must not be reported as having no title (S0 finding on richmonddentalng.com) |

### SC: Scoring

| ID | Pri | When | Method | Status | What must be true |
|---|---|---|---|---|---|
| SC-01 | P0 | Now | property | Running | The score is always an integer from 0 to 100 for any combination of inputs (thousands of random combinations) |
| SC-02 | P0 | Now | property | Running | Monotonic: fixing an issue never lowers the score |
| SC-03 | P0 | S1 | unit | Specified | Could not check findings are excluded from the score, not scored as zero |
| SC-04 | P1 | S1 | unit | Specified | Weights are documented and sum to 100; changing them requires a decision record |
| SC-05 | P0 | Now | unit | Running | Same inputs give the same score (deterministic) |
| SC-06 | P1 | S1 | unit | Specified | Fixes are ordered by priority then effort; the top 3 are the highest-impact things the visitor can do themselves |
| SC-07 | P0 | S4 | integration | Specified | The scan score and the dashboard score agree for the same site |
| SC-08 | P1 | S1 | unit | Specified | No-website scoring counts verified items only and shows points available |

### AB: Limits and abuse

| ID | Pri | When | Method | Status | What must be true |
|---|---|---|---|---|---|
| AB-01 | P0 | S2 | unit | Specified | Every spelling of a site collapses to one key (prototype tests ported) |
| AB-02 | P0 | S2 | unit | Specified | Visitor hash is stable within a day, differs across days and people, and never contains the IP |
| AB-03 | P0 | S2 | unit | Specified | Per-visitor limit: three new sites, the fourth is refused, allowed again after 24 hours |
| AB-04 | P0 | S2 | unit | Specified | A repeat scan of a site is free and instant for everyone and uses no quota |
| AB-05 | P0 | S2 | unit | Specified | Rotating addresses cannot beat the global cap |
| AB-06 | P0 | S2 | unit | Specified | Cached results are still served when the global cap is hit |
| AB-07 | P0 | S2 | unit | Specified | A refused request uses no quota |
| AB-08 | P1 | S2 | unit | Specified | Stale cache (older than 24 hours) refreshes on the next scan |
| AB-09 | P0 | S2 | integration | Specified | Per-browser cookie limit of 3 a day; clearing cookies falls back to the per-network limit of 30 |
| AB-10 | P0 | S2 | unit | Specified | 25 different people behind one carrier address are not blocked under normal use |
| AB-11 | P1 | S2 | unit | Specified | The day boundary uses one fixed timezone (WAT) and resets once, including around clock changes |
| AB-12 | P0 | S2 | integration | Specified | Two simultaneous scans of the same new site produce one fetch and both get the result |
| AB-13 | P0 | S2 | integration | Specified | Turnstile: valid, invalid, expired, reused and missing tokens are each handled with a friendly retry (documented test keys) |
| AB-14 | P0 | S2 | integration | Specified | If Turnstile itself is down the scan fails closed with a friendly try-again message |
| AB-15 | P0 | S2 | integration | Specified | Global cap reached: busy page, cached results still served, alert raised |
| AB-16 | P0 | S2 | integration | Specified | Only the address header set by Vercel is trusted; a spoofed forwarding header does not change the visitor identity |
| AB-17 | P1 | S2 | unit | Specified | A scan makes no paid API calls |
| AB-18 | P0 | S2 | unit | Specified | Scan ids are unguessable (at least 128 bits); guessing yields identical 404s |
| AB-19 | P1 | S3 | integration | Specified | Scraping result pages is rate-limited; a shared page exposes only public website information |

### SE: Security

| ID | Pri | When | Method | Status | What must be true |
|---|---|---|---|---|---|
| SE-01 | P0 | Now | unit | Running | Loopback, private, link-local, cloud metadata, IPv6, hex/decimal/octal and IPv4-mapped addresses, and names that resolve to them, are blocked (23 of 33 probes blocked today) |
| SE-02 | P0 | S1 | unit | Running (known gap) | FINDING: only ports 80 and 443 may be contacted (today 6379, 22, 25 and 8443 are requested) |
| SE-03 | P1 | S1 | unit | Running (known gap) | FINDING: credentials in a URL (user:pass@host) are rejected (today they are sent) |
| SE-04 | P0 | S1 | unit | Running (known gap) | FINDING: all reserved ranges are blocked: 100.64/10, 198.18/15, 192.0.0.0/24, 224/4, 240/4, 255.255.255.255 (today they are requested) |
| SE-05 | P0 | S1 | unit | Specified | A redirect to a blocked address or non-standard port mid-chain is stopped |
| SE-06 | P1 | S1 | integration | Specified | RISK: the address is checked, then fetched again (a gap for DNS rebinding); resolve once and connect to that address |
| SE-07 | P0 | S3 | unit + e2e | Specified | Title, description and handles containing script tags, quotes, HTML or huge strings render as text and store safely |
| SE-08 | P1 | S3 | integration | Specified | Scan pages send frame-ancestors, content security, referrer policy and noindex headers |
| SE-09 | P1 | S2 | integration | Specified | Scan requests need a valid Turnstile token and a same-origin request |
| SE-10 | P0 | S2 | unit | Specified | Site key, URL and name never reach the database unparameterised |
| SE-11 | P0 | S4 | integration | Specified | Only the holder of the scan id can claim it; a second claim is blocked; a claim cannot overwrite another user's business |
| SE-12 | P0 | S2 | integration | Specified | Secrets never appear in responses or logs; error pages show a reference, never a stack trace |
| SE-13 | P0 | Now | unit | Running | Unsubscribe tokens: tampered, wrong user and empty are refused (tests exist) |
| SE-14 | P0 | Now | integration | Verified once, not automated | Cron and webhook endpoints refuse missing or wrong secrets (verified locally) |
| SE-15 | P1 | S1 | integration | Specified | Outbound requests identify as TossVisibilityBot with a contact URL, within planned volume, cached 24 hours |
| SE-16 | P1 | S3 | integration | Specified | No endpoint redirects to a user-supplied URL |

### PV: Privacy and legal

| ID | Pri | When | Method | Status | What must be true |
|---|---|---|---|---|---|
| PV-01 | P0 | S2 | integration | Specified | No raw IP address is stored in the database or logs; the visitor hash rotates daily |
| PV-02 | P0 | S2 | unit | Specified | Unclaimed scans are purged after 30 days (fake clock); claimed scans are kept |
| PV-03 | P0 | S3 | integration | Specified | Scan pages are noindex and absent from the sitemap |
| PV-04 | P0 | S3 | manual | Specified | Privacy notice and terms are linked before the scan button; wording follows Nigeria Data Protection Act practice (needs a legal read) |
| PV-05 | P1 | S4 | manual | Specified | The data deletion request works end to end |
| PV-06 | P1 | S3 | manual | Specified | Cookie notice covers non-essential cookies only; the limit cookie is essential and explained |
| PV-07 | P0 | S3 | e2e | Specified | An email address is never required before a result; if asked afterwards it is optional and says why |

### UX: Pages and experience

| ID | Pri | When | Method | Status | What must be true |
|---|---|---|---|---|---|
| UX-01 | P0 | S3 | e2e | Specified | A first-time visitor completes a scan with no sign-up and no email, and never meets a sign-up wall before the first result |
| UX-02 | P1 | S3 | e2e | Specified | The progress screen shows real steps and never a spinner for more than 3 seconds without a step changing |
| UX-03 | P0 | S3 | e2e + visual | Specified | Result page renders for every state: normal, partial, all could-not-check, blocked site, dead domain, expired certificate, no-website path, busy, rate-limited |
| UX-04 | P0 | S1 | unit | Specified | Wording audit: banned phrases (down, unreachable, you don't have) appear only where the evidence is certain; checked over all copy |
| UX-05 | P0 | S3 | e2e | Specified | Phones (360x640, 390x844): no sideways scroll, tap targets of 44px or more, readable without zoom |
| UX-06 | P1 | S3 | e2e | Specified | Usable on throttled 3G, page weight under 250 KB, no layout shift while polling |
| UX-07 | P2 | S3 | e2e | Specified | The result page is server-rendered and readable without JavaScript and in data-saver browsers |
| UX-08 | P1 | S3 | automated + manual | Specified | Accessibility: keyboard use, labels, contrast of 4.5:1, headings for screen readers |
| UX-09 | P1 | S3 | manual | Specified | Sharing on WhatsApp gives a good preview card, and the page opens fast |
| UX-10 | P2 | S3 | device | Specified | Copy link and share buttons work on Android Chrome, iOS Safari, Samsung Internet and Opera Mini |
| UX-11 | P1 | S3 | e2e | Specified | A returning visitor re-scanning within 24 hours sees the saved result with how long ago; rescan opens after 24 hours |
| UX-12 | P0 | S3 | e2e | Specified | The sign-up offer appears after the result, is dismissible, and the result stays visible |
| UX-13 | P0 | S3 | e2e | Specified | What is open or locked matches the founder's decision (A: nothing locked on first scan, B: top 3) - pending |
| UX-14 | P1 | S3 | e2e | Specified | Empty and error states are friendly and give a next step (retry, WhatsApp) |
| UX-15 | P1 | S3 | review | Specified | Brand and voice follow docs/06-brand with no overclaiming |

### FN: Funnel and accounts

| ID | Pri | When | Method | Status | What must be true |
|---|---|---|---|---|---|
| FN-01 | P0 | S4 | e2e | Specified | Signing up from a result claims that scan and creates a business pre-filled with name, website and handles |
| FN-02 | P0 | Now | e2e | Verified once, not automated | Signing up from the homepage with no scan works, and onboarding works with no website or Google listing (verified locally) |
| FN-03 | P1 | S4 | e2e | Specified | Claiming while signed in adds a business, and the 3-business limit shows a clear message |
| FN-04 | P1 | Later | e2e | Specified | The 7-day trial starts at sign-up with no card; day-3 and day-6 messages |
| FN-05 | P1 | S4 | integration | Specified | An abandoned sign-up leaves the scan intact until it expires |
| FN-06 | P0 | S4 | e2e | Specified | A signed-in user's history and weekly re-score use the same engine and findings |
| FN-07 | P1 | S5 | integration | Specified | Scan to sign-up is attributed without personal data |

### EC: Ecosystem: Visibility OS, agency website, TE-OS and services

| ID | Pri | When | Method | Status | What must be true |
|---|---|---|---|---|---|
| EC-01 | P1 | S4 | e2e | Specified | The agency website links to the scan and its /work copy matches reality |
| EC-02 | P1 | Later | integration | Specified | TE-OS Prospector, Audit and outreach drafts can include a scan link that opens a prefilled scan of the prospect's site |
| EC-03 | P0 | S4 | integration | Specified | TE-OS Audit findings and scan findings do not contradict on the same site (two checks: plain fetch and real browser) |
| EC-04 | P0 | After domain verified | manual | Specified | Resend: SPF, DKIM and DMARC pass; Gmail and Yahoo inbox placement; List-Unsubscribe works |
| EC-05 | P1 | Now | unit | Running | The weekly email reports changes and links to the dashboard (tests exist) |
| EC-06 | P0 | Before merge | manual | Specified | Clerk production: sign-up works, the webhook creates the user with a real email, and deletion is handled |
| EC-07 | P0 | Step 3 | integration | Specified | Paystack in test mode: trial to paid, failed payment, cancel and refund |
| EC-08 | P1 | S4 | device | Specified | WhatsApp deep links with prefilled text open correctly on phones and desktop |
| EC-09 | P0 | Now | integration | Verified once, not automated | Daily run: due-user selection, time box and no double send (verified locally) |
| EC-10 | P0 | After merge | manual | Specified | Health endpoint and uptime monitor: stop the database and confirm the alert arrives |
| EC-11 | P0 | S2 | manual | Specified | Database unreachable: scan page shows a friendly try-again, health returns 503, no data loss |

### RL: Reliability and performance

| ID | Pri | When | Method | Status | What must be true |
|---|---|---|---|---|---|
| RL-01 | P0 | S3 | load | Specified | End-to-end scan p90 of 20s or less from Vercel (S0 measured page responses p50 0.3s, p90 1.3s, max 4.9s) |
| RL-02 | P1 | S5 | load | Specified | 50 simultaneous scans: no errors and memory stays within limits |
| RL-03 | P0 | S2 | integration | Specified | Function timeout mid-scan: the row is marked incomplete, the page shows partial results, no stuck spinner |
| RL-04 | P1 | S3 | e2e | Specified | Polling stops on completion and backs off; no request storms |
| RL-05 | P2 | S2 | integration | Specified | A database write failure still returns the scan (not stored) with a notice |
| RL-06 | P0 | Before each deploy | manual | Specified | Migrations applied forward on a copy of production data; rollback plan written |
| RL-07 | P0 | S5 | e2e | Specified | Post-deploy smoke test: home, sign-in, health, and a scan of a fixed site |
| RL-08 | P1 | Now | integration | Verified once, not automated | Error pages carry a reference id and no stack traces (built, verified) |

### AN: Measurement

| ID | Pri | When | Method | Status | What must be true |
|---|---|---|---|---|---|
| AN-01 | P1 | S5 | integration | Specified | Events: scan_started, scan_completed, scan_could_not_check, cap_hit, rate_limited, signup_from_scan, with no personal data |
| AN-02 | P1 | S5 | manual | Specified | A daily summary of those counts reaches the founder |

### UB: User behaviour scenarios

| ID | Pri | When | Method | Status | What must be true |
|---|---|---|---|---|---|
| UB-01 | P0 | S3 | device | Specified | Lagos salon owner on Android and MTN, Instagram only, no website: finishes the no-website path in under 2 minutes and understands the first step |
| UB-02 | P0 | S1 | integration | Specified | Restaurant on Wix or Squarespace (JavaScript-heavy): not wrongly told it has no phone or social links |
| UB-03 | P0 | S1 | integration | Specified | Clinic on a slow WordPress site (over 10s): told it is slow, never told it is down |
| UB-04 | P1 | S3 | e2e | Specified | Personal brand or creator with only social accounts gets a useful path |
| UB-05 | P1 | S3 | review | Specified | Diaspora or foreign business (non-Nigerian number or city): no Nigeria-only assumptions in wording |
| UB-06 | P1 | S3 | e2e | Specified | Consultant scanning 20 clients in a row: the limit message points to sign-up, not an error |
| UB-07 | P2 | S3 | review | Specified | A competitor scans a rival: allowed, and the page says it shows public information only |
| UB-08 | P0 | S2 | integration | Specified | A bot rotating addresses meets Turnstile and the global cap; honest visitors are still served from cache |
| UB-09 | P1 | S3 | review | Specified | The sceptic (is this a scam?) sees who we are, what we check, what we store, and no card asked |
| UB-10 | P1 | S3 | load | Specified | An owner shares the result in a WhatsApp group and 30 people open it: fast, and no extra scans run |
| UB-11 | P1 | S4 | e2e | Specified | An owner fixes something and rescans the next day, then sees the improvement after signing up |
| UB-12 | P0 | S3 | e2e | Specified | A user pastes the wrong thing (a Facebook link, a phone number, a Google Maps link) and is directed to the right path |
| UB-13 | P1 | S3 | e2e | Specified | A connection that drops mid-scan: reopening the scan link shows the result |
| UB-14 | P2 | S3 | device | Specified | Data Saver and Opera Mini behave acceptably |
| UB-15 | P1 | Now | integration | Specified | A returning user a week later gets the weekly email and lands on the dashboard |
