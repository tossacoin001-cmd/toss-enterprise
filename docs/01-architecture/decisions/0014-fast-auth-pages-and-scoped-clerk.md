# ADR-0014: Prerendered auth pages and Clerk loaded only where needed

- **Status:** Accepted
- **Date:** 2026-10-11
- **Deciders:** Founder (asked for sign-up speed first, 2026-10-11), implemented by AI

## Context

Measured on the live site from Lagos on 2026-10-11 (five cold visits, then repeated header checks):

- The home page is prerendered and served from the nearest Vercel edge (`X-Vercel-Cache: HIT`).
- **`/sign-up` is built by a server on every visit**: `Cache-Control: private, no-store`, `X-Vercel-Cache: MISS`, handled by a function in Washington (`iad1`). Time to first byte ranged from 0.3s to 9.2s depending on whether a cold function had to start. Median time to a visible form was 2.5s, but one visit in five took 4.7s to 8.8s, and the first visit after idle took about 10s.
- **Clerk's login library loads on every page, including the home page**, because the provider wraps the whole app. A visitor who only wants to scan a website downloads about 436 KB and makes about 27 requests (3 to Clerk) for nothing. That works against "sells itself in seconds", the first-scan data budget (400 KB), and the coming public scan page.
- Clerk's own script tag is already near the top of the page head (checked in the generated HTML), so its download is not waiting behind the app's scripts as first assumed.

## Decision

1. **Prerender `/sign-in` and `/sign-up`** with `generateStaticParams` for the bare path. They are served from the edge on every visit, so a cold function can no longer slow the first impression. Sub-steps (for example verify-email) are still built on demand; they come after the user has started.
2. **Mount `ClerkProvider` only in the route groups that need Clerk** (`(auth)`, `(dashboard)`, `onboarding`), not in the root layout. The home page and the future public scan pages carry no login code. Pages that make signed-in API calls keep the provider, because Clerk's script is also what refreshes the 60-second session token; without it a long form such as onboarding would fail its first save.
3. **No extra preload (tested and dropped).** The first design preloaded Clerk's script and pinned its version. Inspecting the generated page showed Clerk already writes its own `<script async>` tag near the top of the page head, so the browser starts that download at once; a preload would only duplicate it and a version pin would add a failure mode. Not shipped.
4. **Show a skeleton form immediately** (`ClerkLoading`) so the page is never an empty box while Clerk loads.
5. **Measure the database distance.** `/api/health` now sends a `Server-Timing` header with the probe time. It reveals nothing else, and lets us decide the function region with evidence instead of a guess.

## Alternatives considered

- **Move functions to a region near Lagos.** Helps signed-in pages but depends on where the database is, which we cannot read. Deferred until the Server-Timing numbers exist. It does not help the prerendered auth pages.
- **Replace Clerk's form with our own.** Would remove the third-party script but means owning password and email-code flows, and a security-sensitive rewrite. Rejected for now.
- **Do nothing and rely on the monitor to keep the function warm.** Does not help the first visitor after idle, who is the one we most need to win.

## Consequences

- Sign-in and sign-up should load from the edge in about 0.3s with a visible form frame at once. Target (test QL-04): form interactive in 3s or less at the median from Lagos; the p90 depends on Clerk's own servers and is tracked, not promised.
- The home page loses about 250 KB and 3 requests. A test guards that Clerk is not reintroduced in the root layout.
- Any new page that makes signed-in `fetch` calls must sit under a layout with the provider.
- Key-less builds (CI) render a plain message on the auth pages instead of failing, since they are now prerendered.

## Result (measured on production, 2026-10-11, after deploy)

Nine cold visits to `/sign-up` from Lagos, before and after:

| | Before (5 visits) | After (9 visits) |
|---|---|---|
| Form visible, median | 2.5s | 2.0s |
| Form visible, worst | 8.8s (about 10s after idle) | 2.7s |
| First paint, worst | 6.4s | 1.2s |
| Cache | `MISS`, built in Washington on every visit | `HIT` from the Cape Town edge |

The target (form visible within 3s) holds on every measured visit. The database answers in about 8 ms once connected (the `Server-Timing` header), so it sits in the same region as the app's servers; moving the servers toward Lagos would make signed-in pages slower, not faster. The remaining time is Clerk's own script and two API calls.
