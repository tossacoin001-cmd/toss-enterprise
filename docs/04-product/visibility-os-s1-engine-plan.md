# Plan: scan engine v2 (instant-scan slice S1)

- **Status:** Proposed 2026-10-11. Tests are written first (`apps/visibility-os/tests/engine/`), then the engine.
- **Parent plan:** [visibility-os-instant-scan-plan.md](visibility-os-instant-scan-plan.md). Test list: [visibility-os-test-plan.md](visibility-os-test-plan.md) (rows tagged S1).
- **Goal:** one shared engine that tells an owner the truth about their website and social presence, in plain words, and never claims more than the evidence supports. It replaces the website and social checks inside today's audit, so the signed-in dashboard and the future public scan can never disagree.

## 1. What changes for the owner

- **No more false alarms.** Today one 8-second timeout produces "Your website is unreachable" and a score of 0 for the website, even for working sites (8 of 30 in the sample). After S1 a timeout is retried and then reported as "we could not check this from our side", and that part is left out of the score instead of counted as zero.
- **Certain things are said plainly.** A domain that does not exist, an expired certificate, and a certificate that browsers do not trust are all certain, and are the most valuable things we can tell an owner.
- **Every finding teaches.** Each one says what it is, why it matters to customers or money, how to fix it in one line, and how long it takes (test XP-04).
- **More of what matters for local trust:** a visible phone number or WhatsApp link, business details a search engine can read (schema), a canonical address, a heading, and robots and sitemap files.
- **People with no website** get an honest, ordered "Start here" plan, not a bare zero (NW-02, NW-03, SC-08).

## 2. Module layout (`apps/visibility-os/lib/scan/`)

| File | Job |
|---|---|
| `types.ts` | `Finding`, `Evidence` (found / not found in HTML / could not check), `ScanReport` |
| `fetch-page.ts` | Safe fetch: redirects (max 5, each hop re-checked), 15s ceiling, one retry on timeout, streamed read to the end of `<head>` (up to 2 MB) then up to 500 KB more, charset handling, failure classification |
| `analyse-html.ts` | Parse with cheerio into plain signals: title, description, viewport, canonical, `lang`, headings, social-share image, favicon, JSON-LD types, phone/WhatsApp/email, social links, bot-challenge and parked-domain markers, JavaScript-built suspicion |
| `social.ts` | Which links point to a real profile: X, YouTube, LinkedIn by status (200 vs 404); Instagram, Facebook, TikTok are link only |
| `checks.ts` | Turns the page signals and fetch result into findings with points, priority, wording |
| `score.ts` | Weights, exclusion of "could not check", ordering of fixes, no-website scoring |
| `copy.ts` | All customer wording in one place, plus the banned-phrase audit |
| `index.ts` | `runScan(input, deps)`; dependencies (fetch, DNS, clock) are injectable so every case is a fast, offline test |

`lib/scoring.ts` keeps its public shape (`scoreBusiness`, `ActionItemDraft`, `ScoreResult`), so the dashboard, weekly job and email do not change. Its website and social parts call `runScan`; the Google part is untouched.

## 3. Finding model

Every check yields a finding with one of three states, and only the first two count toward the score:

- **found**: we saw it.
- **not found in HTML**: we looked and it was absent. Wording says "we did not find X in your page's HTML" and, for things pages often add with JavaScript (social links, phone, schema), adds that sites built with JavaScript can hide them from us.
- **could not check**: blocked, slow, or unreachable from our side. Never scored, never called a failure.

## 4. Failure classification and wording

| What we saw | Meaning | Certainty | What we say |
|---|---|---|---|
| `ENOTFOUND` | The domain does not exist | Certain | "This web address does not exist. Check the spelling, or the domain may have expired." |
| `CERT_HAS_EXPIRED` | Certificate expired | Certain | "Your security certificate has expired, so browsers warn visitors away. Ask your host to renew it." |
| Self-signed, unknown issuer, wrong name | Certificate not trusted | Certain | "Browsers do not trust your site's security certificate..." |
| Timeout twice | Slow or blocked from our side | Uncertain | "We could not reach your site from our side. It may be slow, or it may block automatic visitors. This part is not in your score." |
| `ECONNREFUSED`, reset, `EAI_AGAIN` after retry | Uncertain | Uncertain | Same as above |
| HTTP 403, 429, challenge page (Cloudflare, CAPTCHA) | Blocks automatic visitors | Uncertain | "Your site blocked our check, which is common with protective services. This part is not in your score." |
| HTTP 404 on the home page | Home page missing | Fairly certain | "Your home page address returns 'not found'." |
| HTTP 5xx twice | Server error | Fairly certain | "Your site returned a server error when we visited." |
| Not HTML (PDF, image, JSON) | Not a web page | Certain | "This address is a file, not a web page." |
| Parked or for-sale page | No real site yet | Likely | "This looks like a parked page, not a finished website." |

## 5. Points (the website part, out of 100)

Weights are a decision and are recorded in ADR-0015 when built; changing them later needs a new decision (test SC-04).

| Group | Check | Points |
|---|---|---|
| Reachable and safe | Loads | 25 |
| | HTTPS with a valid certificate (expiring in under 30 days flagged, not penalised) | 15 |
| Basics | Page title | 10 |
| | Search description | 10 |
| | Mobile setting | 8 |
| | Main heading | 4 |
| | Canonical address | 4 |
| Local trust | Visible phone, WhatsApp or email | 8 |
| | Business details a search engine can read (schema) | 6 |
| Discoverability | robots.txt and sitemap.xml | 4 |
| Speed | Tiered, labelled "from our server" | 6 |
| | | **100** |

Overall weights stay Google 40 / website 40 / social 20 for signed-in businesses. The public scan, which has no Google data until the key exists, scores website and social only and says so. "Could not check" groups are removed and the rest are rescaled, so one blocked check cannot tank a score.

**Social (20):** the owner's handle or a link on their site counts as presence (40), a link from their website to it counts as connected (30), and a link that checks out as a live profile counts as verified (30). For Instagram, Facebook and TikTok the verified share is "could not check" and is rescaled away.

## 6. Order of work (tests first)

1. **Write the engine tests** as real, failing tests with HTML fixtures and a scripted fake network: classification, retry, redirects, streamed head-aware reading with huge heads, character sets, non-HTML, JSON-LD shapes, Nigerian phone formats, WhatsApp links, social links, repeatability, scoring rules, wording audit, no-website path.
2. **Build** the modules in the order types, analyse-html, fetch-page, social, checks, score, copy, index.
3. **Wire** `scoreBusiness` to the engine; update the existing scoring tests where the points changed on purpose, and say so in the commit.
4. **Run** the 30-site sample through the engine and compare with the experiment results (plain fetch vs browser); no working site may be called unreachable.
5. **Document** ADR-0015 (engine and weights), update the test list, runbook and changelog.

## 7. Acceptance (rows of the test list)

IN-04, IN-05, NW-02, NW-03, NW-05, NW-04, EN-01 to EN-06, EN-08 to EN-14, EN-16 to EN-21, EN-25, SC-03, SC-04, SC-06, SC-08, XP-04, UX-04, SE-15. When these are real passing tests, S1 is done.

## 8. Risks and how they are handled

- **Existing scores change** because the points change. Acceptable now (one production user); the weekly email reports deltas against the last score, so the first run after the change will show a one-time shift. Documented in ADR-0015.
- **cheerio is a new dependency.** Mature and widely used; it parses leniently like a browser. It does not run JavaScript, which is why the "not found in HTML" wording exists.
- **A bigger read (2 MB head) costs time and memory** on hostile pages. Streamed, hard-capped, tested with an endless stream.
- **Social checks hit other companies' servers.** Only profiles the owner's own site links to, an honest user agent, cached for 24 hours, X, YouTube and LinkedIn only. Dropped for any platform that objects.
