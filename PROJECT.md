# Toss Enterprise: Project State

This file owns the at-a-glance current state of the company OS. It is a snapshot with links; details live in the linked docs. Last updated: 2026-07-06.

## Live

- `apps/website`: Toss Enterprise marketing site, on Vercel.
- `apps/visibility-os`: Visibility OS scoring MVP in production (scoring v1, audit flow, database wiring). See [ADR-0007](docs/01-architecture/decisions/0007-supabase-postgres-and-in-app-scoring-v1.md).

## In development

- Visibility OS beyond the scoring MVP, per [docs/implementation-phases.md](docs/implementation-phases.md).
- Agents (`agents/`): compiling spec-first scaffolds, no runtime behavior yet.

## Planned

- The Enterprise OS folders created in [ADR-0008](docs/01-architecture/decisions/0008-enterprise-os-top-level-layout.md) are scoped but empty. Each folder's README states what will live there.

## Start here

1. [AGENTS.md](AGENTS.md): the contract for all work in this repo.
2. [docs/README.md](docs/README.md): the Knowledge Brain map.
3. [docs/implementation-phases.md](docs/implementation-phases.md): the ordered execution plan.
4. [CHANGELOG.md](CHANGELOG.md): notable changes, newest first.
