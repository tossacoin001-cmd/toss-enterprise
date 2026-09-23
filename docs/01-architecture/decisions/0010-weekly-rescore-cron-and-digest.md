# ADR-0010: Weekly re-score cron and always-send digest email

- **Status:** Accepted
- **Date:** 2026-09-23
- **Deciders:** Founder (session following the 2026-09-20 planning session), implemented by AI per that direction

## Context

The working order's step 2 is "weekly loop: brief + new-review alerts with
drafted replies + competitor movement." Two of those four pieces need
Google's Business Profile API (full review text, posting replies), which
requires manual Google approval, a verified profile active 60+ days, and
owner OAuth — an external, owner-driven process this build step can't
unblock. This ADR covers what's buildable now: a weekly re-score plus a
digest email, using the count/rating data ADR-0009's Places API integration
already provides.

## Decision

1. **Scheduling stays in the app.** `docs/implementation-phases.md` Phase 2
   and `docs/03-ai/ai-operating-system.md` frame scheduled re-scoring as the
   standalone `@toss/visibility-agent` package's job, deployed separately
   with its own hosting ADR. That package is still a one-line stub. Per the
   precedent ADR-0009 set, this ships as a Vercel Cron job
   (`apps/visibility-os/vercel.json`) hitting a new `GET
   /api/cron/weekly-score` route that calls the existing `scoreBusiness()`
   pipeline via a shared `runAndPersistScore()` helper (now also used by the
   on-demand score route). The formal agent package, with its own hosting,
   remains future work.
2. **Recipient email comes from the database, not a live API call per send.**
   `User.email` was unreliable because `CLERK_WEBHOOK_SECRET` was
   unconfigured in production; the founder chose to fix that root cause
   (Clerk dashboard webhook + Vercel env var — no code change, the handler
   was already correct) over adding an ongoing Clerk API lookup to every
   cron run. A one-time script (`scripts/backfill-user-emails.ts`) fixes
   users who signed up before the webhook existed. A business whose owner
   still has no email on file (webhook not yet configured, or backfill not
   yet run) is skipped and logged, never crashes the batch.
3. **Every business gets a digest email every week, unconditionally** — the
   first draft of this feature skipped weeks with no score movement, which
   the founder rejected: a subscription product that goes silent exactly
   when an owner has stopped checking it gives them no reason to remember it
   exists, which undermines the whole retention loop. A week with real
   movement leads with that movement (score, review count, or rating
   change); a quiet week leads with the single highest-priority open action
   item instead, pulled from the same `ActionItemDraft[]` every score run
   already produces — so a quiet week is never a hollow "nothing happened"
   message, it's a concrete next step.
4. **Email via Resend, in a new shared package `@toss/email`.**
   `apps/website` already had this exact wrapper (client is `null` when
   unconfigured, shared `onboarding@resend.dev` sender needs no domain
   verification). This is the second occurrence of that pattern, which
   `docs/01-architecture/monorepo.md`'s dedup rule requires extracting to
   `packages/`.

## Alternatives considered

- **Skip-silent-weeks digest (the original draft of this ADR):** cheaper to
  reason about (fewer emails), but actively works against the product's
  retention goal — an inactive owner who stops checking the dashboard also
  stops hearing from the product. Rejected by the founder.
- **Live Clerk lookup per send, bypassing the DB column entirely:** more
  resilient to the webhook ever breaking again, but ongoing complexity
  (an API call on every cron run, for every recipient) to route around a
  gap that has a one-time fix. Rejected in favor of fixing the webhook.
- **Build `@toss/visibility-agent` to its full spec now, with its own
  hosting:** more correct per the existing docs, but a much bigger lift
  before any weekly loop ships. Deferred; this cron route calls the same
  scoring pipeline the future agent would, so migrating later is additive,
  not a rewrite.

## Consequences

- New required env vars: `CRON_SECRET` (visibility-os) and `RESEND_API_KEY`
  (both apps now, via `@toss/email`). Documented in
  `docs/02-engineering/environments-and-secrets.md` and both apps'
  `.env.example`.
- `CLERK_WEBHOOK_SECRET` goes from "nice to fix eventually" to a hard
  prerequisite for this feature to reach anyone. The Phase 1 checkbox in
  `docs/implementation-phases.md` stays unchecked here; the owner checks it
  off once the Clerk dashboard step is actually done.
- Every score run (onboarding, manual re-run, and now weekly cron) makes one
  live Google Places Details call per business with a `googlePlaceId`
  (ADR-0009); the weekly cron adds a new recurring instance of that cost,
  now on a fixed schedule instead of only user-triggered.
- `packages/email` is the first package in `packages/`; future shared code
  (e.g. brand tokens, per `packages/README.md`'s planned `@toss/ui`) has a
  precedent to follow.
