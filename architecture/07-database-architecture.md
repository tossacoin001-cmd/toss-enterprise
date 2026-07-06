# 07. Database Architecture

This blueprint owns the data architecture: where data lives, how schema changes ship, and where the data layer is heading. The current split is decided in [ADR-0005](../docs/01-architecture/decisions/0005-supabase-and-prisma-data-split.md) and [ADR-0007](../docs/01-architecture/decisions/0007-supabase-postgres-and-in-app-scoring-v1.md).

## Current state

- One Supabase Postgres instance. Website uses the Supabase client; Visibility OS uses Prisma.
- Migrations are committed in `apps/visibility-os` and applied by `prisma migrate deploy` during the Vercel build, over `POSTGRES_URL_NON_POOLING`.
- Operational gotchas (recorded the hard way): `prisma migrate` hangs on the transaction pooler URL, use the non-pooling URL; the free-tier database suspends after 7 idle days and a bare "Schema engine error:" means it is suspended.

## Target design

| Addition | Purpose | Gate |
|---|---|---|
| pgvector extension | Embedding index for the machine knowledge layer ([04-knowledge-brain.md](04-knowledge-brain.md)) | ADR required |
| Cloudflare R2 | Object storage: reports, exports, assets too big for Postgres | ADR required |
| `database/` tooling | Seeds, backup and restore scripts, data utilities | Build when first needed |

## Rules

1. Schema and migrations stay with the owning app; `database/` never holds migrations.
2. Raw SQL is banned in app code (AGENTS.md); Prisma or the Supabase client only.
3. New stores (queues, caches, search) each need an ADR; one Postgres is the default until it measurably is not enough.

## Open questions

- Paid Supabase tier timing (removes the suspend problem).
- Backup cadence and restore drill: undefined until `database/` tooling exists.
