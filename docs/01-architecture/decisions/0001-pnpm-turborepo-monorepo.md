# ADR-0001: pnpm + Turborepo monorepo

- **Status:** Accepted (records a decision already made in commit history, "Restructure as pnpm monorepo + rebuild website")
- **Date:** 2026-07-05 (documented retroactively)
- **Deciders:** Founder

## Context

Toss Enterprise runs multiple apps (marketing site, Visibility OS), multiple agents, and future shared packages. Separate repos would duplicate config, split knowledge, and make it impossible for one AI-assisted operator to see the whole company at once. This repository is explicitly designed to be the company's single source of truth.

## Decision

One monorepo, pnpm workspaces for package management, Turborepo for task orchestration. Workspace globs: `apps/*`, `agents/*`, `packages/*`.

## Alternatives considered

- **Multiple repos:** knowledge fragmentation, config duplication, cross-cutting changes need multiple PRs. Rejected.
- **npm or yarn workspaces:** pnpm is faster, disk-efficient, and strict about phantom dependencies. Rejected.
- **Nx instead of Turborepo:** heavier, more concepts; Turborepo covers current needs (task graph, caching). Rejected for now.

## Consequences

- All installs from root; per-package operations use `pnpm --filter`.
- Every package must implement `build`, `lint`, `type-check` scripts so turbo pipelines never break.
- Follow-up debt (Phase 0): root scripts still call npm, `package-lock.json` must be replaced by `pnpm-lock.yaml`, and the npm `workspaces` field must be removed from root `package.json`.
