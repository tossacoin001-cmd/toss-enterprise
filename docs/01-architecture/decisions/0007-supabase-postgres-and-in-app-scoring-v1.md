# ADR-0007: Supabase Postgres integration envs and in-app scoring v1

- **Status:** Accepted
- **Date:** 2026-07-06
- **Deciders:** Founder (authorized), implemented by AI per that direction

## Context

Visibility OS was deployed but non-functional: Prisma read `DATABASE_URL`, which nothing set (the Vercel + Supabase integration provides `POSTGRES_PRISMA_URL` and friends), no schema had ever been migrated, and no scoring existed, so the dashboard displayed an empty shell. The founder directed that the product be made real so work can proceed to the next builds.

## Decision

1. **Database wiring:** Prisma reads the integration's own env names: `POSTGRES_PRISMA_URL` (pooled, queries) and `POSTGRES_URL` (session pooler, migrations via `directUrl`; the direct host is IPv6-only and unreachable from Vercel builds). No `DATABASE_URL` alias to maintain.
2. **Migrations are code and run in the pipeline:** a committed baseline migration plus `prisma migrate deploy` in the Vercel build command for visibility-os. Nobody applies migrations by hand against production (this was attempted during implementation and correctly blocked by policy; the pipeline path is the rule).
3. **Scoring v1 lives in the app**, not the agent: deterministic checks needing no external API keys (website reachability, HTTPS, title, meta description, viewport, response time; Google and social profile completeness), triggered on onboarding and on demand from the dashboard. Weights: Google 40%, website 40%, social 20%.

## Alternatives considered

- **Wait for the visibility-agent (per its spec) to own all scoring:** blocks the product on agent infrastructure (hosting ADR, scheduling, budgets) while the dashboard stays empty. Rejected for v1; the agent remains the owner of scheduled re-scoring and live Google/social data in Phase 2, writing the same score fields.
- **AI-generated action items now (ANTHROPIC_API_KEY exists in prod):** rejected for v1; deterministic findings with hand-written plain-language copy are reproducible and free. The model earns its place when findings need business-specific phrasing (agent work).
- **Renaming envs in Vercel instead of in the schema:** requires copying secret values around; pointing the schema at the names that already exist is safer.

## Consequences

- The scoring formula in `apps/visibility-os/lib/scoring.ts` is now product behavior; changing weights or checks changes customer-visible scores and belongs in the product doc.
- Server-side fetches of user-supplied URLs are SSRF-guarded (`isSafeExternalUrl`); any new outbound fetch of user input must use the same guard.
- `googleScore` v1 measures profile completeness, not live Google data; the agent upgrade replaces its meaning without a schema change. reviewCount and avgRating stay 0 until then.
- The Clerk webhook remains unconfigured in production (`CLERK_WEBHOOK_SECRET` missing); the lazy user-upsert in the businesses API covers user creation until the owner adds the webhook in the Clerk dashboard.
