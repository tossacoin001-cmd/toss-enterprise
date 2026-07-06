# SOP: Adding a New App or Agent Package

How to add a package to the monorepo without breaking the workspace. Trigger: an approved roadmap item needs a new `apps/*`, `agents/*`, or `packages/*` package.

## Steps

1. Confirm the package is approved: it appears in the roadmap or an ADR. If not, stop and write the ADR first.
2. Create the folder under the right workspace root per [../../01-architecture/monorepo.md](../../01-architecture/monorepo.md). Name: `@toss/<kebab-name>` in `package.json`, folder matches the name.
3. Add the four mandatory scripts even if trivial: `build`, `lint`, `type-check`, and `dev` or `start`. Turbo pipelines must never break on a missing script.
4. TypeScript strict config; extend the shared config from `packages/config` once it exists, local `tsconfig.json` until then.
5. If the package needs env vars: create `.env.example` with empty values and register every variable in [../../02-engineering/environments-and-secrets.md](../../02-engineering/environments-and-secrets.md).
6. If it deploys (apps): create the Vercel project, set env vars there, verify a preview deployment before first production deploy. Update [infrastructure.md](../../01-architecture/infrastructure.md)'s topology table.
7. Write the doc: apps get a product doc in `docs/04-product/`, agents get a spec in `docs/03-ai/agents/` (spec must exist before code, per AIOS rules), packages get a section in monorepo.md.
8. Update the component table in [system-overview.md](../../01-architecture/system-overview.md) and the root README table.
9. Run `pnpm install`, then `pnpm --filter @toss/<name> build` and workspace-wide `turbo type-check` to prove nothing broke.

## Done when

The package builds, CI is green, and every table listed above mentions it.
