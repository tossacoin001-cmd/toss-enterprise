# Changelog

Notable changes to the Toss Enterprise OS, newest first. The detailed record is the Conventional Commit history; this file only keeps the milestones.

## 2026-07-06

- Enterprise OS top-level layout adopted ([ADR-0008](docs/01-architecture/decisions/0008-enterprise-os-top-level-layout.md)): full folder skeleton with scoped READMEs, plus `PROJECT.md`, this changelog, and root entry points `AI_CONTEXT.md`, `ENGINEERING.md`, `STACK.md`, `ROADMAP.md`.
- Visibility OS scoring MVP live in production: database wiring, scoring v1, audit flow ([ADR-0007](docs/01-architecture/decisions/0007-supabase-postgres-and-in-app-scoring-v1.md)).
- Visibility OS brand design system and a real landing page.
- Auth routes pinned in code, immune to corrupted env values.
- Database migration path fixed: migrations run through the non-pooling URL.

## 2026-07-05

- Phase 0 complete: honest toolchain (pnpm plus Turborepo, single lockfile), CI quality gate across the whole workspace, per-folder READMEs.
- Knowledge Brain built: company docs, ADRs 0001 to 0006, engineering and AI standards, implementation phases, first repository audit.
- Agent scaffolds compile: visibility, sales, and audit agents.

## Earlier

- Marketing website (`apps/website`) live on Vercel.
- Visibility OS app structure created with landing page and layout.
