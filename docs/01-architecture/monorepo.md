# Monorepo Layout

This document owns the approved repository structure and the rules for changing it. Adding or renaming a top-level folder requires an ADR.

## Approved structure

The full Enterprise OS layout, adopted in [ADR-0008](decisions/0008-enterprise-os-top-level-layout.md). Every folder exists with a README that states its scope; that README is the folder's minimum content.

```
toss-enterprise/
├── AGENTS.md              # canonical AI and contributor contract
├── CLAUDE.md              # Claude Code addendum, points to AGENTS.md
├── README.md              # human entry point
├── PROJECT.md             # at-a-glance current state
├── CHANGELOG.md           # notable changes, newest first
├── .github/               # CI/CD workflows and repo meta
├── .claude/               # Claude Code project configuration
├── .ai/                   # per-tool AI assistant configuration (non-Claude tools)
├── apps/                  # deployable user-facing applications (workspace)
│   ├── website/           # @toss/website       (live)
│   └── visibility-os/     # @toss/visibility-os (live, scoring MVP)
├── packages/              # shared importable code (workspace)
├── services/              # backend services and workers (workspace once first service lands)
├── agents/                # headless AI workers, one package each (workspace)
│   ├── visibility-agent/  # @toss/visibility-agent (scaffold)
│   ├── sales-agent/       # @toss/sales-agent      (scaffold)
│   └── audit-agent/       # @toss/audit-agent      (scaffold)
├── knowledge/             # machine-usable knowledge for agents
├── architecture/          # diagram and schema artifact sources
├── blueprints/            # reusable solution blueprints
├── docs/                  # the Knowledge Brain (see docs/README.md)
├── database/              # cross-app data operations
├── workflows/             # business automation exports (n8n and similar)
├── mcp/                   # MCP servers and configuration
├── prompts/               # shared prompt library
├── tools/                 # internal CLIs you run
├── scripts/               # maintenance and one-off scripts
├── configs/               # shared non-package configuration
├── monitoring/            # dashboards as code, alert rules
├── analytics/             # tracking plans, event schemas
├── security/              # policy as code, scanning, threat models
├── testing/               # cross-app test infrastructure
├── deployment/            # release and environment artifacts
├── infrastructure/        # infrastructure as code
├── research/              # spikes and research notes
├── assets/                # branding and portfolio files
├── templates/             # reusable starter templates
└── roadmap/               # forward planning artifacts
```

`automation/` was superseded by `workflows/` and `clients/` was dropped from the approved list (records will live under `knowledge/` when they exist); both per ADR-0008. `docs/` remains the only home for decisions, standards, and narrative knowledge; the artifact folders link into it, never restate it.

## Naming rules

- Package names: `@toss/<name>`, kebab-case. The folder matches the name without the scope.
- Apps are Next.js App Router projects. Agents are plain Node.js (ESM, `tsx` in dev, `tsc` build to `dist/`).

## Dependency rules

1. `apps/*` may depend on `packages/*` and external npm packages. Never on other apps or on agents.
2. `agents/*` may depend on `packages/*` and external npm packages. Never on apps.
3. `packages/*` may depend only on other packages and external npm packages. No framework lock-in in `packages/core`.
4. Duplicate code found in two apps must be extracted to `packages/` at the second occurrence, not the third.

## Workspace configuration (current truth)

- `pnpm-workspace.yaml` declares `apps/*`, `agents/*`, `packages/*`. This is the authoritative list.
- pnpm is pinned via the `packageManager` field in root `package.json` (corepack-compatible). `pnpm-lock.yaml` is the only lockfile; committing any other lockfile is a defect.
- Root scripts are turbo-driven (`turbo build`, `turbo lint`, `turbo type-check`, `turbo dev`) and run across every workspace package.

## Turborepo

Tasks defined in `turbo.json`: `build`, `dev` (no cache, persistent), `lint`, `type-check`, `clean`. Every new package must implement `build`, `lint`, and `type-check` scripts, even if trivial, so workspace-wide pipelines never break on a missing script.
