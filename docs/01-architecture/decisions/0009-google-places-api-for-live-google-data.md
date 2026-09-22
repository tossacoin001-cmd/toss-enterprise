# ADR-0009: Google Places API (New) for live Google data, in-app

- **Status:** Accepted
- **Date:** 2026-09-22
- **Deciders:** Founder (2026-09-20 planning session), implemented by AI per that direction

## Context

`googleScore` v1 (ADR-0007) awarded 60 of 100 Google points for any non-empty string
typed into a free-text "Google Business URL" field; nothing was verified against Google,
and `reviewCount`/`avgRating` on `VisibilityScore` stayed 0 forever. The founder decided
Visibility OS must show real, live data to justify a subscription ("solve real-time
problems, not just hand out audit reports"), and set this as the first build step toward
a paid launch.

`Business.googlePlaceId` already existed in the schema, unused, reserved for this.
ADR-0007 and `docs/03-ai/agents/visibility-agent.md` framed live Google data as the
future `@toss/visibility-agent` package's job ("Phase 2"), gated on that package's
infrastructure (hosting, scheduling, budgets) existing first. Waiting for that would keep
the dashboard showing "Reviews 0" indefinitely with no agent infra yet built.

## Decision

1. **Places API (New)** (`places.googleapis.com`), not the legacy Places API or a
   third-party data provider. Google-official, and the same source the founder already
   priced out (~$25-40 per 1,000 Place Details calls for `rating`/`userRatingCount`;
   Autocomplete is effectively free when bundled into a Details call via a session token).
2. **Built directly into the app now** (`lib/google-places.ts`,
   `app/api/places/autocomplete`, `lib/scoring.ts`), not gated behind the
   `@toss/visibility-agent` package. The agent's future role narrows to owning the
   *scheduled* re-score cadence (weekly, per its spec); it will call the same
   `scoreBusiness()` path this ADR introduces, not a separate implementation.
3. **Server-proxied, no client-exposed key.** The browser never sees
   `GOOGLE_PLACES_API_KEY`; a new authenticated route
   (`app/api/places/autocomplete`) calls Google server-side. This also means no Google
   Maps JS SDK dependency for what is, from the browser's point of view, just a debounced
   text search.
4. **Session tokens thread from the onboarding search through the first score run.** The
   client generates one token per search, sends it with every autocomplete keystroke, and
   again with the score call that immediately follows onboarding, so that one Place
   Details call closes the session at its bundled rate. Later manual re-runs (and the
   future agent's scheduled runs) call Place Details as a normal, separately billed
   request — there is no prior autocomplete session to bundle into by then.
5. **Score stability over data freshness.** The 60-point Google subscore is earned by
   having a verified `googlePlaceId` (a real selection from Google's own database), not by
   the live Details fetch succeeding. `reviewCount`/`avgRating` best-effort update from
   that fetch and otherwise hold their last known value. A rate-limited or briefly down
   Google API must never change a customer's score.

## Alternatives considered

- **Google Maps JavaScript API `Autocomplete` widget, loaded client-side:** requires a
  browser-restricted public key and pulls in the full Maps JS SDK for a plain text
  search. Rejected for key-exposure surface and bundle weight the server-proxy avoids.
- **Wait for `@toss/visibility-agent` to own this (as ADR-0007 originally framed it):**
  blocks real Google data on agent infrastructure that does not exist yet. Rejected by
  the founder on 2026-09-20; the schema fields were reserved for exactly this, and the
  agent can adopt the same code path later for scheduling.
- **Refresh Place Details on a fixed schedule only, never on manual re-run:** cheaper, but
  contradicts the "real-time" product requirement and the existing "Re-run Audit" UX,
  which already re-runs the full scoring pipeline on demand.

## Consequences

- New required env var `GOOGLE_PLACES_API_KEY` (server-only); documented in
  `docs/02-engineering/environments-and-secrets.md` and `apps/visibility-os/.env.example`.
  Without it, autocomplete returns no suggestions and Google scoring behaves exactly as it
  does today (0 points, same action item) — no crash, no blocked launch.
- Every score run (onboarding + manual re-run, and later the agent's scheduled runs) now
  makes one live Google Places Details call when a business has a `googlePlaceId`. This is
  a real, ongoing cost the founder has already priced and accepted; it scales with re-score
  frequency, which is a lever available later (plan-tier cadence limits) if volume grows.
- `docs/04-product/visibility-os.md`'s "What does not exist yet" and pending-decisions
  sections are updated in the same change; the "Google data source and cost ceiling"
  decision this ADR makes was the blocker recorded there.
