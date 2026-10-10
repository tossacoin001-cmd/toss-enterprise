# ADR-0011: Daily time-boxed weekly run, one-click unsubscribe, and connecting a Google listing later

- **Status:** Accepted
- **Date:** 2026-10-10
- **Deciders:** Founder (Phase A launch-readiness plan, approved 2026-10-09), implemented by AI per that direction

## Context

A full local end-to-end test on 2026-10-09 (real sign-up through sign-out,
plus the cron route) found problems that block or quietly break a launch:

- **The weekly cron cannot scale.** ADR-0010's single Monday run scored every
  business in one invocation. It took 26s for 4 businesses against Vercel's
  60s limit, so at roughly ten businesses it times out and nobody gets the
  email.
- **Onboarding failed with no Google key.** The form sent
  `googlePlaceId: null` and the API rejected nulls, so every sign-up hit a 400
  until `GOOGLE_PLACES_API_KEY` exists. The "Other" country option also sent a
  code the API rejected.
- **No way to connect a Google listing after onboarding**, while an action item
  told owners to "search above".
- **The weekly email had no link back and no way to opt out.**
- **The speed check was a cliff** (full points up to 3s, none after), so the
  same site scored 100 then 90 on consecutive runs and the digest reported
  drops that were network noise.

## Decision

1. **The cron runs daily and works through whoever is due, in a time box.**
   `GET /api/cron/weekly-score` is scheduled `0 7 * * *`. Each run takes users
   whose `lastDigestAt` is 6+ days old (users never run before become due once
   their account is 6+ days old, so the first email lands at the end of the
   7-day trial, not the day after sign-up), oldest first, three at a time, and
   stops starting new work after 35s. Anyone left is picked up by the next
   daily run. A growing user base therefore degrades to "a day late", not to a
   timed-out job that emails nobody. A user is marked done (`lastDigestAt`)
   only after their email is sent, or when there is nothing deliverable to
   send; a failed send leaves them due so the next run retries instead of
   silently losing the week. The unit of work is the **user**, so a person with
   several businesses gets one email. The orchestration lives in
   `lib/weekly-run.ts` with all I/O injected, so the rules are unit-tested.
2. **One-click unsubscribe.** The email carries a link signed with an HMAC of
   the user id, keyed on `CRON_SECRET` (already required, so no new secret),
   plus `List-Unsubscribe` and `List-Unsubscribe-Post` headers. `GET` only shows
   a confirm button, because mail scanners open links automatically and must
   not unsubscribe anyone; `POST` (also what mail clients send) sets
   `User.digestOptOut`. Opted-out users are still re-scored so their dashboard
   stays fresh; they are only not emailed.
3. **The sender is configurable.** `EMAIL_FROM` overrides the default Resend
   sender once the domain is verified. Unset, the shared
   `onboarding@resend.dev` sender is used, which only delivers to the account
   owner, so launch is gated on verifying the domain and setting this.
4. **Google listing is optional at onboarding and connectable later.** The API
   accepts nulls (`nullish`), the schema moves to `lib/schemas.ts` so it is
   testable, and `PATCH /api/businesses/[id]` connects a listing after
   confirming the place id with Google, then re-scores. Without a Places key the
   onboarding field and the dashboard card show "opens soon" instead of a search
   that can never return results. The "Other" country sends `ZZ`.
5. **Speed is tiered**: full points up to 4s, half up to 8s, none beyond. The
   check runs from a US server, so a hard 3s cutoff penalised sites that are
   fast for Nigerian visitors and flipped scores between identical runs.
6. **Tests exist.** Vitest was added to `apps/visibility-os` (the stack
   `docs/02-engineering/testing-strategy.md` already named), starting with the
   code that decides what owners are told: scoring, the digest, the weekly
   runner, the schema, and unsubscribe tokens. Each bug above has a regression
   test.

## Alternatives considered

- **Fan out one function invocation per business (queue or self-calls).**
  Scales further, but needs a queue or extra infrastructure and failure
  handling for work that today is a few seconds per business. Deferred until the
  daily time box stops being enough; the runner's injected `findDueUsers` /
  `processUser` seam makes that a drop-in change.
- **Keep Monday-only, raise `maxDuration`.** Delays the same failure.
- **Unsubscribe by replying "STOP".** Needs inbound email handling and manual
  action; a signed link is automatic and is what mail providers expect.
- **Make the Google field required.** Fails the no-key launch and shuts out
  online-only businesses.

## Consequences

- One migration: `User.lastDigestAt` and `User.digestOptOut`
  (`20261009000000_user_weekly_run_state`).
- Vercel Cron on a plan that allows daily schedules is required (all plans do).
- New optional env vars `EMAIL_FROM` and `APP_URL` (documented in
  `.env.example` and `docs/02-engineering/environments-and-secrets.md`).
  `CRON_SECRET` now also signs unsubscribe links; rotating it invalidates links
  already sent.
- A user created before this change has `lastDigestAt = null` and so becomes due
  once their account is 6 days old; nobody gets an email the day this deploys.
- Placeholder emails (`<userId>@pending.toss-enterprise.local`) are never
  mailed and are replaced by `scripts/backfill-user-emails.ts`.
- A re-score after a failed send adds a score row per retry day; rows are small
  and the delta shown to the owner is always against the previous row.
- Supersedes ADR-0010 decision 1's Monday schedule and its single-pass batching;
  the rest of ADR-0010 stands.
