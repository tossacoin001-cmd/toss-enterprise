# Repository Audit: 2026-07-05

Point-in-time audit of the full repository. Findings live here; the corresponding actions are scheduled in [../implementation-phases.md](../implementation-phases.md) (Phase 0 and 1 were updated from this audit). Verdict: the structure is right, the products are real, and nothing needs to move; the debt is concentrated in package management honesty, dead weight, and missing verification (tests, lint coverage, monitoring).

## Keep (healthy, leave alone)

- Monorepo shape: `apps/` + `agents/` + `docs/` + `assets/` matches the approved layout in monorepo.md. No restructuring needed.
- `apps/website`: live, revenue-bearing, conversion paths centralized in `lib/config.ts` (good pattern).
- `apps/visibility-os` core: Clerk middleware route protection, Prisma singleton (`lib/db.ts`), and the Clerk webhook handler, which correctly verifies Svix signatures and handles create/update/delete.
- Prisma schema: clean model (User, Business, VisibilityScore append-only, ActionItem), proper indexes and cascades.
- `.prettierrc`, `.gitignore` (comprehensive, nothing stray is tracked), `turbo.json` task graph.
- Conventional Commits discipline in history.
- `assets/branding/` as canonical logo home (website `public/` copies are legitimate deploy copies, hashes match).
- The `docs/` Knowledge Brain and root contracts (AGENTS.md, CLAUDE.md, README.md).

## Move

Almost nothing physically moves. The only relocations, both already scheduled:

- `@anthropic-ai/sdk` out of `apps/visibility-os` dependencies (unused there; AI work belongs to `agents/*`).
- Shared visibility-check logic (when built) into `packages/`, per the second-occurrence rule. Nothing exists to move yet.

## Delete

- `package-lock.json` (353 KB npm lockfile in a pnpm repo; replace with committed `pnpm-lock.yaml`).
- npm workarounds: `legacy-peer-deps` and retry settings in `.npmrc` once pnpm is the real installer.
- CI `deploy-website` job (double deploy path; Vercel GitHub integration owns deploys) and the dead `develop` branch trigger.
- Unused dependencies: `@anthropic-ai/sdk`, `recharts` (visibility-os); `@radix-ui/react-dialog`, `@supabase/ssr` (website). Verified unreferenced by grep.
- Dead assets in `apps/website/public/`: `logo.png` (zero bytes), `logo.svg`, and the create-next-app leftovers `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`. All verified unreferenced.
- Boilerplate/stale READMEs: `apps/website/README.md` is untouched create-next-app output; `apps/visibility-os/README.md` describes a different product ("infrastructure visibility") and npm commands. Rewrite both as thin pointers to `docs/`.

## Technical debt (ranked)

1. **Package manager schizophrenia (highest).** pnpm is mandated, yet: root scripts run npm workspaces, root `vercel.json` runs `npm install`/`npm run build`, visibility-os `vercel.json` runs `npm install --legacy-peer-deps`, `.npmrc` carries npm workarounds, and the only lockfile is npm's. Deploys are effectively unpinned (no lockfile Vercel respects), so builds are not reproducible.
2. **CI is dishonest.** `pnpm install --frozen-lockfile` cannot pass without `pnpm-lock.yaml`; quality gates only cover `apps/website` because root scripts route there.
3. **Agents are phantom packages.** No `src/`, no `tsconfig.json`; any workspace-wide task breaks on them.
4. **visibility-os lint is a no-op.** `lint: eslint` with no eslint config file in the package.
5. **Env var mismatch.** Code reads `CLERK_WEBHOOK_SECRET`; `.env.example` says `SVIX_SECRET`. Anyone provisioning from the example breaks webhooks silently.
6. **API validation is manual.** `/api/businesses` hand-checks fields (Zod is not even a dependency), the GET swallows DB errors into an empty-array response, and the 3-business limit is hardcoded rather than plan-derived.
7. **Version drift.** `.nvmrc` 20.18.0, `engines >=20`, CI Node 22, no `packageManager` field.
8. **No committed Prisma migrations** (schema only, `db:push` workflow): production schema state is unreproducible.
9. **Missing `apps/website/.env.example`** despite the app consuming six env vars.

## Missing documentation

Largely closed by the 2026-07-05 docs build (42 files). Remaining gaps, all recorded as open questions in their owning docs: RLS status on Supabase tables, custom domain mapping, Visibility OS scoring formula and pricing tiers, agent hosting choice. Plus the two stale app READMEs listed under Delete.

## Missing architecture

- No shared `packages/` layer yet (config/tsconfig/eslint sharing; then core). Scheduled Phase 1.
- Agent runtime architecture (scheduling, run attribution, budgets) specified in docs but has no reference implementation.
- No decision on Google data source for scoring (blocks Phase 2; needs an ADR).

## Missing tooling

- No `packageManager` pin, no corepack usage.
- No shared ESLint/tsconfig presets (`packages/config`).
- No `.editorconfig`.
- No pre-commit hook (lint-staged + prettier) even as opt-in.
- No dependency update automation (Renovate or Dependabot).

## Missing automation

- No post-deploy smoke checks.
- No scheduled agent runner (nothing to run yet, but no cron/queue substrate chosen either).
- No automation for BOS metrics (all manual).
- `automation/` (n8n exports) approved in the layout but empty by design; fine.

## Missing testing

Zero tests of any kind. Priority order already defined in testing-strategy.md: webhook handler first, scoring math second, website forms third, CTA link resolution fourth, Playwright smoke fifth. No test runner is wired at any level.

## Missing security

- Unverified RLS on the website's Supabase tables (anon key is public by design; RLS is the only guard).
- No dependency audit in CI (`pnpm audit` or equivalent).
- No `SECURITY.md` disclosure policy (low priority at this scale, note only).
- No secret scanning in CI (gitleaks or GitHub push protection; enable push protection at minimum).
- Positive finding: no secret patterns found in the tracked tree; webhook signature verification is implemented.

## Missing CI/CD

- Quality gate must become workspace-wide turbo tasks with a real pnpm lockfile.
- Remove deploy job + `develop` trigger (see Delete).
- Add: test step (once tests exist), dependency audit step, and later post-deploy smoke.
- No preview-deploy verification convention is enforced for the fragile `vercel.json` files beyond documentation.

## Missing AI infrastructure

- The three agents: specs exist, zero implementation (no src, no tsconfig).
- No prompt modules, no shared brand-voice fragment, no eval harness.
- No MCP servers configured or built; policy doc exists with an empty approved-servers table.
- No token budget or run-attribution scaffolding (both are AIOS launch requirements for the first agent).
- No `ANTHROPIC_API_KEY` provisioning recorded per environment.

## Modernization plan

The plan is the updated [../implementation-phases.md](../implementation-phases.md). Summary of what this audit changed there: Phase 0 gained the dead-weight deletions, Vercel config pnpm conversion, env-example fixes, Node/packageManager pinning, visibility-os eslint config, and README rewrites; Phase 1 gained Zod adoption in visibility-os API routes and secret scanning/dependency audit in CI.
