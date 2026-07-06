# ADR-0005: Supabase for website, Prisma + Postgres for Visibility OS

- **Status:** Accepted (records the shipped state)
- **Date:** 2026-07-05 (documented retroactively)
- **Deciders:** Founder

## Context

The website needs a trivial store for contact form submissions and notify-me signups; Visibility OS needs a real relational model (users, businesses, score time series, action items) with typed access and migrations. These needs are different sizes.

## Decision

Two stores, one per app, per the one-writer rule in data-architecture.md:

- Website: Supabase, accessed with the JS client and anon key.
- Visibility OS: Postgres accessed exclusively through Prisma; the Prisma schema is the authoritative model.

## Alternatives considered

- **One shared database:** couples deploys and migrations of unrelated products, invites cross-product joins that block future splits. Rejected.
- **Prisma for the website too:** overkill for two tables of form submissions. Rejected.
- **Supabase client for Visibility OS:** loses Prisma's typed model and migration story for a product expected to grow. Rejected.

## Consequences

- Agents needing Visibility OS data reuse the app's Prisma schema rather than defining their own (extraction of the Prisma client into `packages/` becomes necessary the moment the first agent ships; Phase 1 item).
- Two dashboards, two backup stories; retention policy is an open question tracked in data-architecture.md.
- Committed Prisma migration files are still missing (schema only); creating the baseline migration is a Phase 1 blocker before further schema change.
