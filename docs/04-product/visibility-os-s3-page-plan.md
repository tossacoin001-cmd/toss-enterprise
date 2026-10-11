# Visibility OS: S3 plan, the scan page

Status: built (2026-10-11). 101 tests pass; checked end to end in a real browser on a phone-sized screen. Privacy and terms are drafts and need a legal read. Part of the [instant scan plan](visibility-os-instant-scan-plan.md); the API it calls is live ([ADR-0016](../01-architecture/decisions/0016-instant-scan-api-limits-and-turnstile.md)).

## What the visitor experiences

1. **Home page, first screen:** one box ("Your website address, like yourbusiness.com"), a link "I do not have a website yet", and a real example result beside it. No sign-up anywhere before the box. The privacy notice and terms are linked just above the button.
2. **Press Check my visibility:** the safety check (Turnstile) runs, the page goes to `/scan/<id>` and shows moving steps ("Opening your website", "Checking how it looks on a phone", ...). It never claims to be finished until the result is there.
3. **Result page** (the whole result, nothing locked, Decision A). In this order:
   1. Title with their name and city (or the website name).
   2. The one most valuable next step, with time and reason.
   3. The score, or for people with no website, "points available" and a Start here plan (free steps first).
   4. Every fix: why it matters, **do it yourself** (2 to 5 plain steps) and **do it for me** (WhatsApp to Toss, message prefilled with their name and the fix).
   5. What went well, and what we could not check (said plainly, "not counted in your score").
   6. Notes: public information only; "may have missed things" for pages built with JavaScript; how old the result is and when a rescan opens.
   7. After all that: the sign-up offer (save, track, weekly email). Dismissible, no email or card needed, the result stays.
4. **Edge screens:** still running, incomplete (retry), busy today, limit reached (points to sign-up, not an error), the human check failed or is down, a typo ("Did you mean example.com?" as a suggestion, never a silent fix).

## Design decisions

- **Logic is separate from looks.** Everything a visitor reads is built by pure functions in `lib/scan-ui` (`buildView`, `progressStep`, `pollDecision`, `didYouMean`, the how-to steps), so the rules are tested fast and the React files only draw them.
- **A finished result is server-rendered** from the database, readable without JavaScript. Only the box and the progress poller are client code. Polling starts at 1 second, slows to 5, pauses when the tab is hidden and gives up after 2 minutes.
- **Progress is honest.** The API only knows running or done, so the steps shown are the checks the scan runs, advancing with time and changing at least every 3 seconds; the words never say done.
- **Turnstile loads only when the scan box is used**, to keep the first page light.
- **Result pages are private:** noindex, no referrer, frame-ancestors none, excluded in robots.txt, never in a sitemap.
- **Do it for me** uses the Toss WhatsApp number already on the home page (2348087919951).

## Open items for the founder

1. **Privacy notice and terms.** Neither page exists yet. I will write plain-language drafts (what is checked, what is kept for 30 days, no address stored, the limit cookie is essential), clearly marked **draft, needs a legal read** under Nigeria Data Protection Act practice.
2. **Example result on the home page** will be a real scan of a Toss site; confirm which one (suggest tossvisibilityos.com).
3. The five-owner comprehension test (XP-06) and real-phone checks (UX-05, UX-06) need real people and devices; they come after the build, before launch.

## Tests (tests/scan-ui/)

| File | Covers |
|---|---|
| view.test.ts | UX-03 (a screen for every result kind, built from the real engine), UX-11, UX-12, UX-13, XP-03, XP-05, XP-07, NW-06, NW-08, BG-01, BG-07, UB-05, UB-07, EN-16 wording, RT-04, UX-02 |
| poll-and-typos.test.ts | RL-04, IN-06 |
| structure.test.ts | UX-01, UX-05, UX-07, UX-08, XP-02, PV-03, PV-04, PV-06, SE-07, SE-08, SE-16, QL-05 |

Browser tests on real phone sizes (UX-05, UX-06, QL-01, QL-02, QL-07) are written when the pages exist.
