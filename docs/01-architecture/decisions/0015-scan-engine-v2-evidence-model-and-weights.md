# ADR-0015: Scan engine v2: three-state evidence, honest failures, fixed weights

- **Status:** Accepted
- **Date:** 2026-10-11
- **Deciders:** Founder (approved instant-scan slices S0 to S5 and "first scan shows everything"), implemented by AI

## Context

The old audit (`lib/scoring.ts`) had three problems found in the 2026-10-10 probes:

- One 8-second timeout reported a working site as "unreachable" and scored it 0. Weekly emails then showed drops that were network noise.
- It read only 500 KB of a page, so a page with large inline styles lost its title and was called untitled.
- Any text typed as an Instagram handle scored a perfect social score. Nothing was verified.

The free instant scan shows a result to strangers with no sign-up. A wrong accusation there ends trust at once, so the engine must be able to say "we could not check" and mean it.

## Decision

1. **Every check ends in one of three states:** `found`, `missing`, `could_not_check`. Only the first two touch a score. A part we could not check is left out of the score; it is never counted as zero.
2. **Failures are classified.** Only some are certain (a domain that does not exist, an expired or untrusted certificate, a non-page file, a redirect loop). Timeouts, refused connections, blocks (403, 429), bot-check pages and maintenance pages are `could_not_check`, are retried once, and never use certain-sounding words. Tests enforce the wording.
3. **Fixed weights:** website checks add up to exactly 100 points (reachable 25, https 15, title 10, description 10, phone-friendly 8, contact 8, business details 6, speed 6, main heading 4, main address 4, page list 4); social checks add up to exactly 100 (present 40, linked from the website 30, verified 30). A score is earned points divided by the points that could be checked. `possible` is always 200 so a business with no website sees "points available", not a bare zero.
4. **Social verification only where a server can honestly tell:** X, YouTube and LinkedIn (200 versus 404 from Vercel). Instagram, Facebook and TikTok show the same login page either way, so they are never requested and never called missing. Verdicts are cached for 24 hours (10 minutes for "unknown").
5. **Pages built with JavaScript get the benefit of the doubt.** When a page looks JavaScript-built, an absence is flagged `js_built` and the wording says it may be added by script.
6. **Safe fetching:** one URL-safety module, manual redirects with per-hop DNS and address checks, streamed capped reads (head up to 2 MB, then 500 KB more), nesting limit 300 so a hostile page cannot stall parsing, and a total time budget.
7. **A path for people with no website:** a Start here plan (free steps first), a WhatsApp chat link built from their number, and the Google listing as "connect after sign-up", never a failure.
8. **`scoreBusiness` uses the engine** for the website and social parts and keeps its public shape. When a part could not be checked, the last known score is kept so one bad moment does not move it.

## Consequences

- Scores change for existing businesses: some go up (a working site no longer scores 0 after one slow visit), some go down (a typed Instagram handle alone no longer earns 100). Documented in the changelog.
- A business with only an Instagram handle shows a lower social score than before until it links the account from a website; this is honest, and the wording explains it.
- 332 engine tests and the existing 242 keep the behaviour fixed; wording is audited as data (banned words, jargon, reading grade 9 or below).

## Alternatives considered

- **Fetch with a real browser for every scan.** Rejected for cost and speed; the JavaScript caveat is the honest middle path. Revisit with data from real scans.
- **Treat unknown as missing.** Rejected: it is exactly the false accusation this ADR exists to stop.
