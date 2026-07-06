# Infrastructure

This document owns hosting, deployment topology, and runtime configuration. Operational procedures (how to deploy, roll back) live in [../05-operations/deployment.md](../05-operations/deployment.md).

## Topology

| Workload | Runs on | Config | Notes |
|---|---|---|---|
| `apps/website` | Vercel project (production) | root `vercel.json` routes the GitHub integration to `apps/website` | Live |
| `apps/visibility-os` | Vercel project (separate) | `apps/visibility-os/vercel.json` | Deploy config has a history of breakage; change with care |
| `agents/*` | Not deployed yet | n/a | Target: scheduled Node processes (Railway, Fly.io, or GitHub Actions cron). ADR required at build time |
| Databases | Supabase (website), Postgres via `DATABASE_URL` (visibility-os) | env vars | See [data-architecture.md](data-architecture.md) |

## Runtime versions

- Node: `>=20` per root `engines`; CI uses Node 22. `.nvmrc` is authoritative for local dev.
- pnpm 9 (CI pins it via `pnpm/action-setup`).
- Next.js 16, React 19, TypeScript 5.8.

## Deployment triggers

- Push to `main` triggers both the Vercel GitHub integration and the CI deploy job in `.github/workflows/ci.yml`. This is a known redundancy: two systems can deploy the website. Phase 0 of [../implementation-phases.md](../implementation-phases.md) picks one and disables the other.
- There is no staging environment. `develop` branch is referenced in CI triggers but has no deploy target.

## Environment variables

The authoritative registry of variables and where to set them is [../02-engineering/environments-and-secrets.md](../02-engineering/environments-and-secrets.md). Rules: every variable appears in the owning app's `.env.example`, secrets exist only in Vercel project settings and GitHub Actions secrets.

## Cost posture

Everything currently runs on free or low tiers (Vercel hobby/pro, Supabase free, Clerk free). Before any component would exceed a free tier, record the decision and the monthly cost in an ADR.

## Open questions

- Custom domains: which domains are attached to each Vercel project (record when confirmed; the operator holds this knowledge today).
- Agent hosting choice (pending first agent implementation).
