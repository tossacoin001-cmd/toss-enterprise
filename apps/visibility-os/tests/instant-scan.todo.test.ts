// Test specification for the Visibility OS instant scan and surrounding system.
// Source of truth: docs/04-product/visibility-os-test-plan.md (generated from the same list).
// Each todo is a written test with no product code behind it yet. It appears as
// "todo" in the run and becomes a real test in the slice named in its id's table row.
import { describe, it } from "vitest";

describe("IN: Input and URL handling", () => {
  it.todo("IN-01 [P0] [S2] Bare domain, www, http/https, trailing path, upper case and trailing dot all map to one site key");
  it.todo("IN-02 [P1] [S2] International domain names are accepted and normalised");
  it.todo("IN-03 [P0] [S3] Empty, whitespace, over-long (>2000 chars) and non-URL text get a friendly message, never an error page");
  it.todo("IN-04 [P0] [S1] localhost, single-label hosts and IP addresses get a clear message: enter your website address, not an IP");
  it.todo("IN-05 [P0] [S1] A social profile URL typed as the website (Instagram, Facebook, TikTok, X, LinkedIn, YouTube) is routed to the social path, not scanned as a website");
  it.todo("IN-06 [P2] [S3] Common typos (.con, missing dot, http//) get a did-you-mean suggestion and are never silently corrected");
  it.todo("IN-07 [P2] [S1] Link-in-bio pages (linktr.ee, bio.link) are scanned but labelled as a link page, not a website");
  it.todo("IN-08 [P1] [S3] Emoji, look-alike unicode and right-to-left text in the name field are stored safely and shown escaped");
  it.todo("IN-09 [P1] [S3] Business name and city are optional; the scan works without them");
});

describe("NW: Visitors with no website yet (the gap we fill)", () => {
  it.todo("NW-01 [P0] [S3] A visitor with no website can start from name, city and category, plus optional social handles and WhatsApp number, with no sign-up");
  it.todo("NW-02 [P0] [S1] The no-website result leads with Start here: ordered plain-language steps, free steps first, each with effort and time");
  it.todo("NW-03 [P0] [S1] Only verifiable items are scored; anything not checkable yet (Google listing before the key exists) shows as connect later, never as a failure");
  it.todo("NW-04 [P1] [S1] Instagram, Facebook and TikTok handles are accepted as self-reported and shown as link only (cannot be verified from Vercel); X, YouTube and LinkedIn handles are verified when the platform answers 200 vs 404");
  it.todo("NW-05 [P1] [S1] WhatsApp numbers validate for +234, 0803, 0701 style, with spaces and dashes, and international numbers; a wa.me link is built");
  it.todo("NW-06 [P1] [S3] Individuals and personal brands are supported, with wording that fits (no customers walk in)");
  it.todo("NW-07 [P1] [S4] The result offers the agency's entry website offer as one option, as a WhatsApp link prefilled with the scan summary, never the only option");
  it.todo("NW-08 [P1] [S3] The score never shows a bare discouraging 0: it shows what is verified, points available and the fastest first step");
  it.todo("NW-09 [P1] [S4] A visitor who later builds a website can add it and rescan; history is kept");
});

describe("EN: Scan engine checks", () => {
  it.todo("EN-01 [P0] [S1] Failure classification: ENOTFOUND, expired certificate, self-signed, connect timeout, refused, 403, 404, 429 and 5xx each map to the right state and wording");
  it.todo("EN-02 [P0] [S1] One timeout never produces unreachable: retry once, then could not check");
  it.todo("EN-03 [P0] [S1] Redirects: at most 5 hops, loops stop, a move to another domain is noted, http to https upgrade is scored correctly");
  it.todo("EN-04 [P0] [S1] The body is streamed and stops at 500 KB: a 10 MB file and an endless stream neither hang nor exhaust memory");
  it.todo("EN-05 [P1] [S1] Non-HTML responses (PDF, image, JSON, zip) give a not-a-web-page finding with no parse crash");
  it.todo("EN-06 [P1] [S1] Character sets (UTF-8, ISO-8859-1, Windows-1252) and gzip or brotli bodies are parsed");
  it.todo("EN-08 [P1] [S1] JSON-LD: array, @graph, nested, invalid JSON and huge blobs; LocalBusiness subtypes recognised");
  it.todo("EN-09 [P1] [S1] Nigerian phone formats in text (+234 803, 0803, 0701, spaced, dashed, in brackets) are found and not confused with years or prices");
  it.todo("EN-10 [P1] [S1] WhatsApp links recognised: wa.me, api.whatsapp.com, whatsapp://, with text parameters");
  it.todo("EN-11 [P1] [S1] Social link extraction ignores share buttons and tracking parameters and picks the owner's profile, not a post");
  it.todo("EN-12 [P0] [S1] Social verification from Vercel (S0 result): YouTube, X and LinkedIn answer 404 for a missing account and 200 for a real one; Instagram, Facebook and TikTok serve a login page to servers, so they are link only; any block is could not check; never says an Instagram, Facebook or TikTok account does not exist");
  it.todo("EN-13 [P1] [S1] robots.txt and sitemap.xml detection ignores HTML pages served with status 200 (soft 404)");
  it.todo("EN-14 [P1] [S1] Certificate days left read; under 30 days and expired are flagged; nothing read on plain http");
  it.todo("EN-16 [P0] [S1] Pages built with JavaScript (almost no HTML text, many scripts) get a may-be-built-with-JavaScript note and softened absence findings");
  it.todo("EN-17 [P0] [S1] Bot-blocked sites (403, challenge or CAPTCHA pages) are detected and reported as could not check");
  it.todo("EN-18 [P2] [S1] Parked or placeholder domains are detected as no real site yet");
  it.todo("EN-19 [P2] [S1] Maintenance pages and login-only sites are reported honestly");
  it.todo("EN-20 [P2] [S1] Non-English sites: language attribute respected; title and description wording does not assume English");
  it.todo("EN-21 [P0] [S1] The same site scanned three times gives identical findings");
  it.todo("EN-22 [P1] [S4] The same site produces non-contradicting facts in the scan and in the TE-OS Audit agent");
  it.todo("EN-23 [P0] [S2] A total budget of 30s: partial results are returned with the unfinished checks marked could not check");
  it.todo("EN-24 [P1] [S2] Parallel checks stay within function memory and concurrency limits");
  it.todo("EN-25 [P0] [S1] Head tags are found even when the head is huge: read until the end of the head section (up to 2 MB), then up to 500 KB of body. A 1.2 MB page with its title after 500 KB must not be reported as having no title (S0 finding on richmonddentalng.com)");
});

describe("SC: Scoring", () => {
  it.todo("SC-03 [P0] [S1] Could not check findings are excluded from the score, not scored as zero");
  it.todo("SC-04 [P1] [S1] Weights are documented and sum to 100; changing them requires a decision record");
  it.todo("SC-06 [P1] [S1] Fixes are ordered by priority then effort; the top 3 are the highest-impact things the visitor can do themselves");
  it.todo("SC-07 [P0] [S4] The scan score and the dashboard score agree for the same site");
  it.todo("SC-08 [P1] [S1] No-website scoring counts verified items only and shows points available");
});

describe("AB: Limits and abuse", () => {
  it.todo("AB-01 [P0] [S2] Every spelling of a site collapses to one key (prototype tests ported)");
  it.todo("AB-02 [P0] [S2] Visitor hash is stable within a day, differs across days and people, and never contains the IP");
  it.todo("AB-03 [P0] [S2] Per-visitor limit: three new sites, the fourth is refused, allowed again after 24 hours");
  it.todo("AB-04 [P0] [S2] A repeat scan of a site is free and instant for everyone and uses no quota");
  it.todo("AB-05 [P0] [S2] Rotating addresses cannot beat the global cap");
  it.todo("AB-06 [P0] [S2] Cached results are still served when the global cap is hit");
  it.todo("AB-07 [P0] [S2] A refused request uses no quota");
  it.todo("AB-08 [P1] [S2] Stale cache (older than 24 hours) refreshes on the next scan");
  it.todo("AB-09 [P0] [S2] Per-browser cookie limit of 3 a day; clearing cookies falls back to the per-network limit of 30");
  it.todo("AB-10 [P0] [S2] 25 different people behind one carrier address are not blocked under normal use");
  it.todo("AB-11 [P1] [S2] The day boundary uses one fixed timezone (WAT) and resets once, including around clock changes");
  it.todo("AB-12 [P0] [S2] Two simultaneous scans of the same new site produce one fetch and both get the result");
  it.todo("AB-13 [P0] [S2] Turnstile: valid, invalid, expired, reused and missing tokens are each handled with a friendly retry (documented test keys)");
  it.todo("AB-14 [P0] [S2] If Turnstile itself is down the scan fails closed with a friendly try-again message");
  it.todo("AB-15 [P0] [S2] Global cap reached: busy page, cached results still served, alert raised");
  it.todo("AB-16 [P0] [S2] Only the address header set by Vercel is trusted; a spoofed forwarding header does not change the visitor identity");
  it.todo("AB-17 [P1] [S2] A scan makes no paid API calls");
  it.todo("AB-18 [P0] [S2] Scan ids are unguessable (at least 128 bits); guessing yields identical 404s");
  it.todo("AB-19 [P1] [S3] Scraping result pages is rate-limited; a shared page exposes only public website information");
});

describe("SE: Security", () => {
  it.todo("SE-05 [P0] [S1] A redirect to a blocked address or non-standard port mid-chain is stopped");
  it.todo("SE-06 [P1] [S1] RISK: the address is checked, then fetched again (a gap for DNS rebinding); resolve once and connect to that address");
  it.todo("SE-07 [P0] [S3] Title, description and handles containing script tags, quotes, HTML or huge strings render as text and store safely");
  it.todo("SE-08 [P1] [S3] Scan pages send frame-ancestors, content security, referrer policy and noindex headers");
  it.todo("SE-09 [P1] [S2] Scan requests need a valid Turnstile token and a same-origin request");
  it.todo("SE-10 [P0] [S2] Site key, URL and name never reach the database unparameterised");
  it.todo("SE-11 [P0] [S4] Only the holder of the scan id can claim it; a second claim is blocked; a claim cannot overwrite another user's business");
  it.todo("SE-12 [P0] [S2] Secrets never appear in responses or logs; error pages show a reference, never a stack trace");
  it.todo("SE-14 [P0] [Now] Cron and webhook endpoints refuse missing or wrong secrets (verified locally)");
  it.todo("SE-15 [P1] [S1] Outbound requests identify as TossVisibilityBot with a contact URL, within planned volume, cached 24 hours");
  it.todo("SE-16 [P1] [S3] No endpoint redirects to a user-supplied URL");
});

describe("PV: Privacy and legal", () => {
  it.todo("PV-01 [P0] [S2] No raw IP address is stored in the database or logs; the visitor hash rotates daily");
  it.todo("PV-02 [P0] [S2] Unclaimed scans are purged after 30 days (fake clock); claimed scans are kept");
  it.todo("PV-03 [P0] [S3] Scan pages are noindex and absent from the sitemap");
  it.todo("PV-04 [P0] [S3] Privacy notice and terms are linked before the scan button; wording follows Nigeria Data Protection Act practice (needs a legal read)");
  it.todo("PV-05 [P1] [S4] The data deletion request works end to end");
  it.todo("PV-06 [P1] [S3] Cookie notice covers non-essential cookies only; the limit cookie is essential and explained");
  it.todo("PV-07 [P0] [S3] An email address is never required before a result; if asked afterwards it is optional and says why");
});

describe("UX: Pages and experience", () => {
  it.todo("UX-01 [P0] [S3] A first-time visitor completes a scan with no sign-up and no email, and never meets a sign-up wall before the first result");
  it.todo("UX-02 [P1] [S3] The progress screen shows real steps and never a spinner for more than 3 seconds without a step changing");
  it.todo("UX-03 [P0] [S3] Result page renders for every state: normal, partial, all could-not-check, blocked site, dead domain, expired certificate, no-website path, busy, rate-limited");
  it.todo("UX-04 [P0] [S1] Wording audit: banned phrases (down, unreachable, you don't have) appear only where the evidence is certain; checked over all copy");
  it.todo("UX-05 [P0] [S3] Phones (360x640, 390x844): no sideways scroll, tap targets of 44px or more, readable without zoom");
  it.todo("UX-06 [P1] [S3] Usable on throttled 3G, page weight under 250 KB, no layout shift while polling");
  it.todo("UX-07 [P2] [S3] The result page is server-rendered and readable without JavaScript and in data-saver browsers");
  it.todo("UX-08 [P1] [S3] Accessibility: keyboard use, labels, contrast of 4.5:1, headings for screen readers");
  it.todo("UX-09 [P1] [S3] Sharing on WhatsApp gives a good preview card, and the page opens fast");
  it.todo("UX-10 [P2] [S3] Copy link and share buttons work on Android Chrome, iOS Safari, Samsung Internet and Opera Mini");
  it.todo("UX-11 [P1] [S3] A returning visitor re-scanning within 24 hours sees the saved result with how long ago; rescan opens after 24 hours");
  it.todo("UX-12 [P0] [S3] The sign-up offer appears after the result, is dismissible, and the result stays visible");
  it.todo("UX-13 [P0] [S3] Decision A (founder, 2026-10-10): the first scan shows the whole result with nothing locked; sign-up is offered after, to save, track and get the weekly email");
  it.todo("UX-14 [P1] [S3] Empty and error states are friendly and give a next step (retry, WhatsApp)");
  it.todo("UX-15 [P1] [S3] Brand and voice follow docs/06-brand with no overclaiming");
});

describe("FN: Funnel and accounts", () => {
  it.todo("FN-01 [P0] [S4] Signing up from a result claims that scan and creates a business pre-filled with name, website and handles");
  it.todo("FN-02 [P0] [Now] Signing up from the homepage with no scan works, and onboarding works with no website or Google listing (verified locally)");
  it.todo("FN-03 [P1] [S4] Claiming while signed in adds a business, and the 3-business limit shows a clear message");
  it.todo("FN-04 [P1] [Later] The 7-day trial starts at sign-up with no card; day-3 and day-6 messages");
  it.todo("FN-05 [P1] [S4] An abandoned sign-up leaves the scan intact until it expires");
  it.todo("FN-06 [P0] [S4] A signed-in user's history and weekly re-score use the same engine and findings");
  it.todo("FN-07 [P1] [S5] Scan to sign-up is attributed without personal data");
});

describe("EC: Ecosystem: Visibility OS, agency website, TE-OS and services", () => {
  it.todo("EC-01 [P1] [S4] The agency website links to the scan and its /work copy matches reality");
  it.todo("EC-02 [P1] [Later] TE-OS Prospector, Audit and outreach drafts can include a scan link that opens a prefilled scan of the prospect's site");
  it.todo("EC-03 [P0] [S4] TE-OS Audit findings and scan findings do not contradict on the same site (two checks: plain fetch and real browser)");
  it.todo("EC-04 [P0] [After domain verified] Resend: SPF, DKIM and DMARC pass; Gmail and Yahoo inbox placement; List-Unsubscribe works");
  it.todo("EC-06 [P0] [Before merge] Clerk production: sign-up works, the webhook creates the user with a real email, and deletion is handled");
  it.todo("EC-07 [P0] [Step 3] Paystack in test mode: trial to paid, failed payment, cancel and refund");
  it.todo("EC-08 [P1] [S4] WhatsApp deep links with prefilled text open correctly on phones and desktop");
  it.todo("EC-09 [P0] [Now] Daily run: due-user selection, time box and no double send (verified locally)");
  it.todo("EC-10 [P0] [After merge] Health endpoint and uptime monitor: stop the database and confirm the alert arrives");
  it.todo("EC-11 [P0] [S2] Database unreachable: scan page shows a friendly try-again, health returns 503, no data loss");
});

describe("RL: Reliability and performance", () => {
  it.todo("RL-01 [P0] [S3] End-to-end scan p90 of 20s or less from Vercel (S0 measured page responses p50 0.3s, p90 1.3s, max 4.9s)");
  it.todo("RL-02 [P1] [S5] 50 simultaneous scans: no errors and memory stays within limits");
  it.todo("RL-03 [P0] [S2] Function timeout mid-scan: the row is marked incomplete, the page shows partial results, no stuck spinner");
  it.todo("RL-04 [P1] [S3] Polling stops on completion and backs off; no request storms");
  it.todo("RL-05 [P2] [S2] A database write failure still returns the scan (not stored) with a notice");
  it.todo("RL-06 [P0] [Before each deploy] Migrations applied forward on a copy of production data; rollback plan written");
  it.todo("RL-07 [P0] [S5] Post-deploy smoke test: home, sign-in, health, and a scan of a fixed site");
  it.todo("RL-08 [P1] [Now] Error pages carry a reference id and no stack traces (built, verified)");
});

describe("AN: Measurement", () => {
  it.todo("AN-01 [P1] [S5] Events: scan_started, scan_completed, scan_could_not_check, cap_hit, rate_limited, signup_from_scan, with no personal data");
  it.todo("AN-02 [P1] [S5] A daily summary of those counts reaches the founder");
  it.todo("AN-03 [P0] [S5] The funnel is measured with targets: visitors who finish a scan 35% or more, finishers who sign up 12% or more, signed-up users who return within 7 days 40% or more; targets are revisited after the first 100 scans");
  it.todo("AN-04 [P1] [S5] Time to first result and the share of scans ending in could not check are tracked, so a slow or blocked period is noticed within a day");
});

describe("XP: Sells itself: understood and valuable in seconds", () => {
  it.todo("XP-01 [P0] [S3] From the home page to the first result in 3 steps or fewer and 20 seconds or less on a mid-range Android on 3G");
  it.todo("XP-02 [P0] [S3] The first screen of the home page shows a real example result and one obvious action, with no scrolling and no sign-up");
  it.todo("XP-03 [P0] [S3] Plain language: every customer-facing sentence reads at grade 7 or below, and technical words (meta, canonical, schema, SEO) never appear without a plain explanation first");
  it.todo("XP-04 [P0] [S1] Every finding carries what it is, why it matters to customers or money, how to fix it in one line, and how long it takes");
  it.todo("XP-05 [P1] [S3] Every fix offers do it yourself (5 steps or fewer) and do it for me (WhatsApp prefilled with the finding)");
  it.todo("XP-06 [P1] [S3] Five real owners shown a result are asked what to do first: at least 4 of 5 answer correctly within 30 seconds, unaided");
  it.todo("XP-07 [P1] [S3] The first screen of the result names the single most valuable next step before any list or score detail");
  it.todo("XP-08 [P1] [S3] Zero explanation needed: no screen needs a tutorial, tooltip or video to make the first scan work");
});

describe("RT: Solves problems as they happen (real time)", () => {
  it.todo("RT-01 [P0] [S5] Watch: for signed-in businesses a certificate expiring in 30, 14 and 7 days, and a site that goes down, trigger an alert instead of waiting for the weekly email");
  it.todo("RT-02 [P0] [S5] No false alarms: a site is called down only after two failed checks a few minutes apart, from a classified cause; transient timeouts never alert (fake clock)");
  it.todo("RT-03 [P1] [S5] Alert hygiene: at most one alert per issue per day, no alerts in quiet hours (WAT night), opt out per alert type");
  it.todo("RT-04 [P1] [S3] The scan shows results as each check finishes; the first result appears within 3 seconds");
  it.todo("RT-05 [P1] [S4] After a fix, a rescan shows the gain at once: You fixed X, plus 6 points");
  it.todo("RT-06 [P1] [Later] When the Google connection exists: a new review or rating change is surfaced within 24 hours with a drafted reply");
});

describe("UP: Keeps users updated", () => {
  it.todo("UP-01 [P0] [S4] A What's new feed in the app lists real changes in plain words, marks unread items and shows them after login");
  it.todo("UP-02 [P0] [S4] Email cadence: welcome with what happens next, a day-3 progress note, a day-6 trial note, then the weekly digest; never more than one email a day; each type can be switched off");
  it.todo("UP-03 [P1] [S4] The notifications bell shows real items (score change, fix recorded, new feature), never a static placeholder");
  it.todo("UP-04 [P1] [Later] WhatsApp updates: explicit opt-in, an approved template, one-tap stop");
  it.todo("UP-05 [P1] [S5] A public status page link in the footer shows whether the service is up (the uptime monitor's page)");
  it.todo("UP-06 [P1] [S3] Coming-soon features (AI visibility, competitors, review replies) show a notify-me button; requests are counted and shown to the founder");
});

describe("BG: Belonging: users feel part of it", () => {
  it.todo("BG-01 [P0] [S3] Personal from the first screen: the business name and city appear throughout, never a generic placeholder");
  it.todo("BG-02 [P1] [S4] Progress is visible: score history, weeks improving, and a celebration when a fix lands, in warm and understated words");
  it.todo("BG-03 [P1] [S4] Founding members (the first 30) see a founding mark, keep the locked price for 12 months, and have a direct WhatsApp line to the founder; benefits persist");
  it.todo("BG-04 [P1] [S4] One-tap Was this useful? on every finding and a request-a-feature box; answers are stored and summarised for the founder weekly; What's new says You asked, we built");
  it.todo("BG-05 [P1] [S5] Community proof only when true: aggregate counts (for example businesses scanned this month) appear only from real data and only above a minimum of 50; below that they are hidden, never invented");
  it.todo("BG-06 [P2] [S4] Share your progress: a card or link such as My score rose from 41 to 63, opened by friends without a sign-up");
  it.todo("BG-07 [P1] [S3] Voice is warm, respectful and plain, never condescending (copy review against docs/06-brand)");
  it.todo("BG-08 [P2] [S4] Each week shows what the product did for you: This week we checked 14 things");
});

describe("QL: Quality bar: fast, seamless, no dead ends", () => {
  it.todo("QL-01 [P0] [S3] Performance budget on a mid-range Android over 4G: Lighthouse performance 90 or more, accessibility and best practices 95 or more, largest content under 2.5s, layout shift 0.1 or less, first-load script 170 KB or less");
  it.todo("QL-02 [P0] [S3] No dead ends: a crawler follows every link and presses every button on every page; none is a 404 or does nothing, and every disabled control says why");
  it.todo("QL-03 [P0] [S3] Every failure has a human message, a next step and a reference: stop the database, make Clerk time out, throttle the network, and look at each screen");
  it.todo("QL-04 [P0] [S3] Sign-up form visible within 3 seconds at p90 from Lagos (it takes 9 to 18 seconds today; needs the region fix) and takes 3 fields or fewer");
  it.todo("QL-05 [P1] [S3] The first scan journey transfers 400 KB or less, because data is expensive");
  it.todo("QL-06 [P1] [S3] Accessibility to WCAG AA, large text, screen reader pass");
  it.todo("QL-07 [P1] [S3] Visual snapshots of the key screens at 360, 390, 768 and 1280 pixels");
  it.todo("QL-08 [P1] [S3] Every interactive element has hover, focus, disabled and loading states");
  it.todo("QL-09 [P2] [S5] Installable to the home screen with an icon; the last result opens offline");
});

describe("UB: User behaviour scenarios", () => {
  it.todo("UB-01 [P0] [S3] Lagos salon owner on Android and MTN, Instagram only, no website: finishes the no-website path in under 2 minutes and understands the first step");
  it.todo("UB-02 [P0] [S1] Restaurant on Wix or Squarespace (JavaScript-heavy): not wrongly told it has no phone or social links");
  it.todo("UB-03 [P0] [S1] Clinic on a slow WordPress site (over 10s): told it is slow, never told it is down");
  it.todo("UB-04 [P1] [S3] Personal brand or creator with only social accounts gets a useful path");
  it.todo("UB-05 [P1] [S3] Diaspora or foreign business (non-Nigerian number or city): no Nigeria-only assumptions in wording");
  it.todo("UB-06 [P1] [S3] Consultant scanning 20 clients in a row: the limit message points to sign-up, not an error");
  it.todo("UB-07 [P2] [S3] A competitor scans a rival: allowed, and the page says it shows public information only");
  it.todo("UB-08 [P0] [S2] A bot rotating addresses meets Turnstile and the global cap; honest visitors are still served from cache");
  it.todo("UB-09 [P1] [S3] The sceptic (is this a scam?) sees who we are, what we check, what we store, and no card asked");
  it.todo("UB-10 [P1] [S3] An owner shares the result in a WhatsApp group and 30 people open it: fast, and no extra scans run");
  it.todo("UB-11 [P1] [S4] An owner fixes something and rescans the next day, then sees the improvement after signing up");
  it.todo("UB-12 [P0] [S3] A user pastes the wrong thing (a Facebook link, a phone number, a Google Maps link) and is directed to the right path");
  it.todo("UB-13 [P1] [S3] A connection that drops mid-scan: reopening the scan link shows the result");
  it.todo("UB-14 [P2] [S3] Data Saver and Opera Mini behave acceptably");
  it.todo("UB-15 [P1] [Now] A returning user a week later gets the weekly email and lands on the dashboard");
});
