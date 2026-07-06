# Monorepo Layout

This document owns the approved repository structure and the rules for changing it. Adding or renaming a top-level folder requires an ADR.

## Approved structure

```
toss-enterprise/
├── AGENTS.md              # canonical AI and contributor contract
├── CLAUDE.md              # Claude Code addendum, points to AGENTS.md
├── README.md              # human entry point
├── apps/                  # deployable user-facing applications
│   ├── website/           # @toss/website      (live)
│   └── visibility-os/     # @toss/visibility-os (in development)
├── agents/                # headless AI workers, one package each
│   ├── visibility-agent/  # @toss/visibility-agent (planned)
│   ├── sales-agent/       # @toss/sales-agent      (planned)
│   └── audit-agent/       # @toss/audit-agent      (planned)
├── packages/              # shared code, created on first real need
│   # planned: ui/ (shared components), config/ (tsconfig, eslint), core/ (types, utils)
├── docs/                  # the Knowledge Brain (see docs/README.md)
├── assets/                # branding and portfolio files
│   └── branding/
├── automation/            # planned: n8n and other workflow exports
├── clients/               # planned: non-code client records
├── templates/             # planned: reusable starter templates
└── .github/workflows/     # CI/CD
```

`automation/`, `clients/`, and `templates/` are approved but intentionally not created until they have content. Empty folders are noise.

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
