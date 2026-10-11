# Plan: free instant scan (Phase B)

- **Status:** Approved by the founder 2026-10-10. Assumptions tested, **slice S0 (Vercel network) done: GO with three changes** (see section 3). No product code written yet.
- **Owner:** Founder decides; AI builds slice by slice.
- **Tests:** [visibility-os-test-plan.md](visibility-os-test-plan.md): 150 tests written before any code. Approved by the founder 2026-10-10: slices S0 to S5, the abuse limits, and the principle below.
- **Goal:** anyone, in any niche, can paste a website and get an honest visibility diagnosis in under 20 seconds with no account. The result is the reason to sign up, share, and come back. This is the "think of us first" front door described in [visibility-os.md](visibility-os.md).

## 1. What the visitor experiences

**Founder rule:** a new user uses the product for free first and is asked to sign up only afterwards. No account, no email, no card before the first result. Sign-up is offered after the result, to save it, track it and get the weekly email.

There are **two ways in**, because many owners have no website yet. That gap is exactly what Visibility OS fills:

- **Path A: I have a website.** Paste it (below).
- **Path B: I don't have a website yet** (section 2b). Start from the business name, or a social handle, or a WhatsApp number.

1. **tossvisibilityos.com** has one input: "Paste your website". Optional: business name and city.
2. A short human check (Cloudflare Turnstile), then a progress screen that shows each step as it finishes.
3. A **result page** at `/scan/<unguessable id>`: a score out of 100, the fixes in plain language, and a clear "what we checked / what we could not check" list. What is open and what is saved for sign-up is the founder's open choice (section 9, A or B).
4. **Share**: the page has a link people can send. It is `noindex` and expires in 30 days unless claimed.
5. **Sign up** (7-day trial, no card): the scan is saved to the new account, a business is created pre-filled from it, and weekly monitoring starts. Nobody re-types anything.

Success measures (set targets after the first 100 scans): scans per day, scan to sign-up rate, share-link opens, share of scans that end in "could not check".

## 2. What it checks, and how sure we are

Three states for every finding, never two:

| State | Meaning | Wording rule |
|---|---|---|
| **Found** | We saw it | State it plainly |
| **Not found in your page's HTML** | We looked and it was absent, but sites that add content with JavaScript can hide it from us | Say exactly that; never "you don't have X" |
| **Could not check** | Blocked, slow, or unreachable from our side | Say so; do not penalise the score |

| Area | Check | Method | Confidence |
|---|---|---|---|
| Reachability | Domain exists | DNS (`ENOTFOUND` = domain does not exist) | Certain |
| | Certificate expired or self-signed | TLS error code (`CERT_HAS_EXPIRED`, `DEPTH_ZERO_SELF_SIGNED_CERT`) | Certain, and a strong fix to show |
| | Slow, blocked (403), error (5xx) | Timeout / HTTP status | Uncertain: "could not check", never "your site is down" |
| Basics | HTTPS, title, meta description, mobile viewport, `lang`, favicon, `h1`, canonical, social-share image | Raw HTML | High; description and canonical are often genuinely missing (see hit rates) |
| Local trust | Phone number, tel link, WhatsApp link, email | Raw HTML | Medium: some sites inject these with JavaScript |
| | Business schema (LocalBusiness and similar) | JSON-LD | Medium |
| Discoverability | robots.txt, sitemap.xml | Two small requests | High |
| Social | Which platforms the site links to | Links in the HTML | Medium |
| | X, YouTube and LinkedIn link goes to a real page | HTTP 200 vs 404 | High for X and YouTube; LinkedIn to be confirmed with more handles in S1 |
| | Instagram, Facebook, TikTok | Link present only | **Cannot be verified from Vercel**: they serve a login page to servers (S0) |
| Google | Business Profile, reviews, rating | Places API | **Not in the scan until the key exists**; shown as "connect after sign-up" |
| Speed | Time to first response from our server | Tiered, labelled as measured from our server | Low weight; never a headline finding |

## 2b. Path B: no website yet

For a salon on Instagram, a caterer who takes orders on WhatsApp, a creator, or anyone starting out. They still get a real, honest answer and a plan.

- **Inputs (all optional except one):** business or personal name, city and country, category (or "personal brand"), Instagram, Facebook, TikTok or X handle, WhatsApp number.
- **What is verified:** X, YouTube and LinkedIn handles exist (200 vs 404); the WhatsApp number is valid and a chat link can be built. **Instagram, Facebook and TikTok handles are taken as the owner's word and shown as "link only"**: from Vercel they return the same login page whether the account exists or not (S0 test), so we cannot honestly confirm or deny them. Verified Instagram data would need the owner to connect the account later through Meta's official sign-in. Anything else is shown as "link only" or "could not check".
- **The result leads with "Start here":** an ordered plan, free steps first, each with effort and time. For example: (1) claim your Google Business Profile, (2) set up WhatsApp Business with a catalog, (3) put your phone, area and a link in your Instagram bio, (4) get a one-page site or link page, (5) ask your first 10 customers for a Google review.
- **Scoring is honest, not discouraging:** only verified items count; the page also shows the points available and the fastest first step, never a bare 0.
- **The agency fits in naturally:** one option in the plan is the entry website offer, as a WhatsApp link prefilled with their scan summary, never the only option.
- **Google listing:** cannot be verified until the Places key exists, so it shows as "connect after sign-up" and counts for nothing either way.
- **Later:** when they add a website, they rescan and the history is kept.
- Tests: NW-01 to NW-09 and UB-01, UB-04.

**Not checked, and said so on the page:** Google reviews, AI-assistant visibility (phase C, coming soon), content quality, backlinks.

## 3. Evidence from the tests

A 30-site sample: the Toss portfolio (8), Lagos clinics and venues found through directories, large Nigerian sites, and deliberate edge cases. Run from Lagos on a slow connection. Scripts are in [research/instant-scan-experiments/](../../research/instant-scan-experiments/).

| Test | Result | What it means for the plan |
|---|---|---|
| Single 8s attempt (today's app) | Only 13 of 30 sites loaded | Today's app tells owners "Your website is unreachable" after one timeout. That is wrong for at least 8 sites that work, **including three of ours**. |
| Sequential, 20s limit, retry | 21 of 30 loaded; page time p50 3.6s, p90 13s | Per-page limit must be about 15-20s with one retry, and a total scan budget of about 30s |
| Why requests fail | `ENOTFOUND`, `CERT_HAS_EXPIRED`, `SELF_SIGNED`, `CONNECT_TIMEOUT`, 403, 404, 500 are all distinguishable | Classify every failure; only DNS and certificate errors are certain |
| Plain fetch vs real browser (19 pages) | Agreed on 13. Of the 16 real sites, 3 differed (19%): one clinic's Instagram and Facebook links appear only after JavaScript runs, one lost its schema and `h1`, one large site served different content | Plain fetch is right most of the time but can miss JavaScript-added signals. Wording above handles it. A rendering service is a later upgrade, not v1 |
| Repeatability, 3 runs x 6 sites | Identical findings every time | Findings are stable once timing is tiered |
| Download cap, 10 MB file | Current method 19.3s; streaming with a 500 KB cap 2.5s | **The public endpoint must stream with a byte cap.** Today's code downloads the whole body first |
| Cloudflare Turnstile, test keys | Pass, fail, duplicate-token and missing-token all behave as documented | Server-side verification works; needs a free Cloudflare account for real keys |
| Abuse rules (8 tests) | All pass: address spellings collapse to one site, rotating IPs cannot beat the global cap, cached results stay free when the cap is hit, rejected requests use no quota | Rules are sound as written |
| Social existence, real vs fake handle (Lagos) | Instagram worked from a home connection; X and YouTube: 404 for fake; Facebook inconsistent; TikTok bot-challenge page | Superseded by the Vercel result below |
| **S0: from Vercel's network** | 13 of 15 real sites load (87%); page responses p50 0.3s, p90 1.3s, max 4.9s (Lagos: p50 3.6s, p90 13s); domain-missing and expired-certificate classified correctly. Social: YouTube, X, LinkedIn real vs missing differ (200 vs 404); **Instagram real and missing are identical login pages**; Facebook and TikTok likewise | **GO.** Scans will be fast from Vercel. Instagram, Facebook, TikTok are link only; the no-website path leans on the owner's own word for those |
| S0: one clinic site | A 1.2 MB page with its `<title>` after more than 500 KB of inline code returned "no title, no description" with a fixed 500 KB cap (also true of today's audit) | Read until the end of the head section (up to 2 MB), not a fixed byte count. Test EN-25 |

Hit rates across 21 loaded pages: meta description 67%, canonical 48%, social-share image 38%, JSON-LD 24%, phone in text 48%, tel link 29%, WhatsApp link 38%, any social link 38% (Instagram 33%, Facebook 10%), robots.txt 37%, sitemap 30%. In plain terms: most small-business sites genuinely lack structured data, canonical tags and a visible WhatsApp or phone link, which is exactly what the scan can honestly flag.

## 4. How it is built

- **Flow.** `POST /api/scan` verifies Turnstile, applies the limits, stores a scan row, and returns its id. The check runs after the response (`after()`, up to the 60s function limit). The page polls `GET /api/scan/<id>` and shows steps as they complete.
- **Engine v2** is one shared library used by both the scan and the signed-in audit, so the two never disagree: failure classification, one retry on timeout, streamed 500 KB cap, 5-redirect limit, the existing private-network protection on every hop, honest user agent, no JavaScript execution.
- **Data.** `Scan(id, siteKey, url, result, createdAt, expiresAt, visitorHash, claimedByUserId)`. `siteKey` is the canonical host (lowercase, no `www`, no port or trailing dot). Unclaimed scans are deleted after 30 days.
- **Privacy.** No raw IP stored: the visitor hash is `sha256(salt:day:ip)` with a daily-rotating salt. Scan pages are `noindex`. The scan reads only public pages of the site the visitor typed.
- **Score.** Website, contact signals and social links, on the same 0-100 scale, with Google added after sign-up. Reviews and rating enter the score once the Places key exists. Findings that are "could not check" are excluded, not scored zero.

## 5. Abuse limits (tested)

| Rule | Setting |
|---|---|
| Human check | Turnstile on every scan |
| Per browser | 3 fresh sites per day, tracked by a signed cookie |
| Per network | 30 per day per hashed IP. Looser on purpose: many Nigerian mobile users share one carrier address, so a strict per-IP rule would block innocent people |
| Per site | One scan per site per 24 hours, shared by everyone. Repeat requests are free and instant |
| Whole service | 300 new scans per day, then a "busy, try tomorrow" page. Cached results still work |
| Safety | Private-network protection, 500 KB cap, 30s total budget, no JavaScript executed |

Known weakness, accepted: a determined attacker with many addresses could use up the daily cap and show "busy" to honest visitors. Mitigations if it happens: raise the cap (the scan costs nothing but function time), add a per-/24 rule, and alert on cap hits.

## 6. Fixes to the existing audit (same engine, lands with slice 1)

0. ~~Close the three security gaps the tests found (SE-02 to SE-04)~~ **Done 2026-10-11** in the Phase A pull request ([ADR-0013](../01-architecture/decisions/0013-migrations-only-in-production-builds-and-url-safety.md)): ports, credentials, IP addresses, internal names and every reserved range are now rejected, with tests. Still open for S1: resolve once then connect to that address (SE-06).
1. Never write "Your website is unreachable" from one timeout. Retry once, classify, and say "we could not check" unless DNS or the certificate proves it.
2. Stream with a byte cap instead of downloading the whole body.
3. Treat a social-profile URL typed into the website field as a social profile, not a website.

## 7. Build slices

Each slice ships on its own, behind tests, and stops for review.

| Slice | Work | Gate |
|---|---|---|
| **S0 Spike** (done 2026-10-10) | Probe run during a Vercel build and read back from its log (the preview itself is behind Vercel login) | **GO.** Vercel is much faster than Lagos; Instagram, Facebook, TikTok are link only |
| **S1 Engine v2** | Shared library + the section 6 fixes, with the experiment cases as regression tests, the no-website scoring, and the **security hardening found by the 2026-10-10 probe**: only ports 80 and 443, no credentials in URLs, all reserved address ranges blocked, and resolve-once-then-connect | All tests, existing app unchanged for users except fewer false "unreachable" findings |
| **S2 Data and limits** | `Scan` table, limiter backed by the database (the tested rules), Turnstile verify, API | Rule tests against a real database |
| **S3 Pages** | Landing input, progress, result page, share, `noindex`, mobile layout | Browser journey on phone and desktop |
| **S4 Claim and funnel** | Sign-up claims the scan, pre-fills the business, trial starts | Full journey: scan, sign up, dashboard shows the same findings |
| **S5 Observability** | Counters for scans, cache hits, "busy", could-not-check rate; alert on the cap | Health and runbook updated |

The engine ADR (0015) is written in S1 (see [the S1 plan](visibility-os-s1-engine-plan.md)). The plan assumes the Phase A branch is merged first.

## 8. Not tested, and how each is covered

| Untested | Why | Covered by |
|---|---|---|
| Behaviour from Vercel's network at function time | S0 ran in a build container on the same cloud, not in a function | S1 repeats a short probe from a deployed function as its first test |
| LinkedIn profile checks | Not tried | Link-only by default |
| Real Turnstile widget on our domain | Needs a Cloudflare account | Founder creates the free keys; S2 |
| Cookie tracking on real Nigerian mobile browsers | Needs real devices | S3 device pass; limits fail open per browser, closed per network |
| Rendering service for JavaScript-built sites | Costs money and adds a vendor | Honest wording now; revisit when scans show the need |
| Platform terms of use for social checks | Legal read, not technical | Low volume, honest user agent, 24-hour cache, only profiles the site itself links to. Drop the check if a platform objects |

## 9. Decisions needed from the founder

1. ~~Approve slices S0 to S5, with S0 as the go/no-go.~~ Done: approved, S0 passed.
2. Create a free Cloudflare account and a Turnstile site for tossvisibilityos.com (needed for S2).
3. Confirm the three limits: 3 per browser per day, 30 per network, 300 per day overall.
4. ~~Choose how the first scan opens.~~ **Decided: A** (founder, 2026-10-10). The first scan shows the whole result. Sign-up is offered afterwards, to save it, track it, get the weekly email, and later Google reviews and competitors. Nobody is asked to sign up before their first result.
5. Done: S0 to S5 approved, the abuse limits confirmed, Cloudflare account created (Turnstile site for tossvisibilityos.com still to create).
