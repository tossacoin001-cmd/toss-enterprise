# Database

This folder owns cross-app database operations: seed data, backup and restore tooling, and data scripts. Status: Planned.

App schema and migrations stay with the owning app (Prisma in `apps/visibility-os`). The Supabase and Prisma data split is [ADR-0005](../docs/01-architecture/decisions/0005-supabase-and-prisma-data-split.md); operational gotchas (pooler URLs, suspended databases) live in [docs/05-operations/](../docs/05-operations/).
