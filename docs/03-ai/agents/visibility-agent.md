# Visibility Agent

- **Package:** `@toss/visibility-agent`
- **Status:** Planned. Manifest exists, no source. This spec is the contract for implementation.

## Purpose

Given a `Business` record in Visibility OS, measure its online visibility, write a `VisibilityScore` row, and generate prioritized `ActionItem`s a non-technical owner can act on.

## Trigger and cadence

- On business creation (first score).
- Scheduled re-score (target: weekly per business; cadence per plan tier is a product decision owned by [../../04-product/visibility-os.md](../../04-product/visibility-os.md)).
- Manual re-run from the dashboard (idempotent).

## Inputs

A `businessId`. The agent reads the Business row (name, category, city, Google Place ID, socials, website URL) via the shared Prisma schema. Zod-validated; missing critical fields produce ActionItems ("add your Google Business Profile"), not crashes.

## Outputs

- One `VisibilityScore` row: `total`, `googleScore`, `socialScore`, `websiteScore`, `reviewCount`, `avgRating`. Append-only.
- Zero or more `ActionItem` rows, each with a title a business owner understands, ordered by expected impact.
- A structured run log (JSON) with run id, duration, token spend.

## Tools and data access

- Google Places/Business data for the profile and reviews (API choice is an implementation decision; record it in an ADR because it has cost and quota consequences).
- HTTP checks of the business website (reachability, HTTPS, basic SEO signals, mobile viewport).
- Social presence checks (Instagram handle resolves, posting recency if accessible).
- Database: read Business, write VisibilityScore and ActionItem. Nothing else.

## Model and budget

- Scoring math is deterministic code, not model output. The model writes explanations and ActionItem phrasing only.
- Default model: a fast, cheap Claude tier; per-run hard cap and monthly cap set in config before first deploy.

## Guardrails

- Never contacts the business or any third party; read-only against the outside world.
- Scores must be reproducible: same inputs, same subscores. Model text may vary; numbers may not.
- Rate-limits external APIs and backs off; a quota failure degrades to partial scores with an honest `ActionItem` note.

## Failure behavior

A failed run writes no partial score rows (transaction), logs the failure with the run id, and leaves the previous score visible in the product.

## Open questions

- Exact scoring formula and weights (product decision, blocks implementation).
- Google data source: official Places API vs third-party. Cost per 1,000 businesses matters.
