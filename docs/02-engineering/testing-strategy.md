# Testing Strategy

This document owns how correctness is verified. Honest current state: **there are no tests in this repository today.** This doc defines the target and the order in which it gets built (scheduled in [../implementation-phases.md](../implementation-phases.md)).

## Principles

1. Test behavior, not implementation. A test that breaks on refactor without a behavior change is a bad test.
2. Test where the money is: payments routing, webhook verification, scoring math, and form submission come first. Marketing page markup comes last or never.
3. Every bug fixed gets a regression test in the same PR, once the rig exists.

## Target stack

| Layer | Tool | Applies to |
|---|---|---|
| Unit and component | Vitest + Testing Library | packages, lib code, scoring logic, React components with logic |
| API and integration | Vitest against route handlers with a test database | visibility-os API routes, webhook handlers |
| End-to-end smoke | Playwright | critical paths: website contact form, pricing CTA links resolve, visibility-os sign-up and onboarding |
| Static | TypeScript strict + ESLint | everything, already partially wired |

## Priority order (what to test first when the rig lands)

1. Clerk webhook handler: signature verification, user mirror create/update.
2. Visibility score computation (once the visibility-agent implements it): pure functions, exhaustively unit tested.
3. `apps/website` contact and notify forms: submission path to Supabase.
4. Pricing page CTAs: every button resolves to the canonical Flutterwave or Calendly URL from `lib/config.ts`.
5. Playwright smoke on production URLs after deploy (post-deploy check, see ci-cd.md).

## Gates

- CI blocks merge on: type-check, lint, unit/integration tests (once present).
- Coverage numbers are not a goal. The priority list above is the goal.

## Open questions

- Test database strategy for Prisma (dedicated Postgres schema vs SQLite; decide when building, record in an ADR if non-obvious).
