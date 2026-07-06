# Implementation Phases

This document owns the ordered execution plan. Phases are sequential; a phase is done when its exit criteria pass, and no feature work jumps ahead of an incomplete earlier phase without a written exception in this file. Product rationale lives in [04-product/roadmap.md](04-product/roadmap.md).

## Phase 0: Make the repo honest (repo hygiene, no features)

The monorepo currently lies about itself. Fix the lies before building on them. Findings behind these items: [audits/2026-07-05-repository-audit.md](audits/2026-07-05-repository-audit.md).

- [x] Replace `package-lock.json` with a committed `pnpm-lock.yaml`; delete the npm lockfile and the `.npmrc` npm workarounds. (2026-07-05, pnpm 9.15.9 pinned via `packageManager`)
- [x] Rewrite root `package.json`: npm `workspaces` field removed, scripts converted to turbo, `packageManager` pinned. (2026-07-05)
- [x] Convert both `vercel.json` files off npm to pnpm install/build commands. (2026-07-05; preview verification below still pending)
- [x] Align Node versions: 22 everywhere (`.nvmrc`, CI via `node-version-file`; engines stay `>=20` for local flexibility). (2026-07-05)
- [x] Give `agents/*` stub `src/index.ts`, `tsconfig.json`, and READMEs so workspace-wide `build`/`type-check` pass. (2026-07-05)
- [x] Add an ESLint config to `apps/visibility-os`; fixed the pre-existing lint errors it surfaced in both apps (unescaped entities, unused vars, one setState-in-effect in Navbar). (2026-07-05)
- [x] Fix `apps/visibility-os/.env.example` (`CLERK_WEBHOOK_SECRET`) and create `apps/website/.env.example`. (2026-07-05)
- [x] Remove unused dependencies: `@anthropic-ai/sdk`, `recharts` (visibility-os); `@radix-ui/react-dialog`, `@supabase/ssr` (website). (2026-07-05)
- [x] Delete dead public assets in `apps/website/public/` (zero-byte logo.png, logo.svg, five create-next-app SVGs). (2026-07-05)
- [x] Replace boilerplate app READMEs with thin pointers to the docs; add per-folder READMEs across the repo. (2026-07-05)
- [x] CI: `develop` trigger and `deploy-website` job removed; quality gate runs turbo type-check/lint/build across all packages. (2026-07-05)
- [x] Verify Vercel preview deploys are green on PR #1 before merging to main. (2026-07-05: all four projects pass after the root `next` dependency workaround recorded in infrastructure.md. The two remaining red PR checks, GitHub Actions Quality Gate and Prisma Compute Deploy, are pre-existing account-level failures also present on the old main; see owner actions.)
- [x] Vercel cleanup (2026-07-05, via API with owner authorization): `toss-enterprise` project Root Directory set to `apps/website`; duplicate projects `website` and `toss-enterprise-gnw8` deleted; root `vercel.json` and the temporary root `next` dependency removed.
- [ ] Owner actions that remain: resolve the GitHub Actions billing lock so CI can run (GitHub Settings, Billing); configure or uninstall the Prisma GitHub App ("Prisma Compute Deploy" has been failing since before this PR; repo Settings, Integrations).
- [x] Add `LICENSE` (proprietary, all rights reserved) and root `.editorconfig`. (2026-07-05)

**Exit criteria:** fresh clone + `pnpm install` + `pnpm build` + `pnpm type-check` + `pnpm lint` all succeed locally and in CI across every workspace package; production deploys verified unaffected.

## Phase 1: Foundations for product work

- [ ] Prisma baseline migration committed for visibility-os (schema-only today); document the migrate-on-deploy step in deployment.md.
- [ ] Test rig: Vitest wired at the workspace level, first tests per the priority list in [02-engineering/testing-strategy.md](02-engineering/testing-strategy.md) (webhook verification first).
- [ ] Minimum monitoring per [05-operations/monitoring.md](05-operations/monitoring.md): uptime checks on both production URLs, deploy notifications on.
- [ ] Verify and record: RLS status on website Supabase tables, `CLERK_WEBHOOK_SECRET` present in production env, which domains attach to which Vercel projects (open questions in security.md and infrastructure.md).
- [ ] Add Zod to visibility-os and validate `/api/businesses` input with it; stop the GET handler swallowing DB errors into an empty-array response.
- [ ] CI hardening: `pnpm audit` (or equivalent) step, enable GitHub secret push protection, consider Renovate/Dependabot for dependency updates.
- [ ] Create `packages/config` (shared tsconfig/eslint) and move apps onto it; create `packages/core` only when the first shared runtime code appears.

**Exit criteria:** CI blocks on tests; a webhook regression cannot ship silently; the operator gets alerted if production goes down.

## Phase 2: Visibility OS scoring MVP (first real product milestone)

- [ ] Decide the scoring formula and weights; record it in [04-product/visibility-os.md](04-product/visibility-os.md) (it currently blocks everything downstream).
- [ ] ADR for the Google data source (cost per business is the deciding factor).
- [ ] Implement `@toss/visibility-agent` to its spec ([03-ai/agents/visibility-agent.md](03-ai/agents/visibility-agent.md)): deterministic scoring, model-written action items, attributable runs, budget caps.
- [ ] Dashboard renders real scores and action items; onboarding triggers the first score.
- [ ] Agent hosting ADR (cron on which platform) and deployment.

**Exit criteria:** a real business onboards and sees a real score with useful action items within minutes, unattended.

## Phase 3: Funnel and measurement

- [ ] Implement `@toss/audit-agent` to its spec; free audit becomes the website's lead magnet (form + spam control decision).
- [ ] Website analytics and SEO pass ([04-product/website.md](04-product/website.md) targets).
- [ ] BOS metrics: a simple weekly numbers habit backed by whatever instrumentation now exists.

**Exit criteria:** every lead source is measurable; audits go out with human approval and traceable outcomes.

## Phase 4: Monetization and scale-out

- [ ] Visibility OS paid tiers: pricing decision, Flutterwave subscription rail ADR, plan limits enforced.
- [ ] Implement `@toss/sales-agent` to its spec on contact-form leads.
- [ ] Transactional email (Resend) with a verified domain, for reports and product emails.
- [ ] Case study pages; extract first `templates/` from delivered client work.

**Exit criteria:** a business can pay for Visibility OS without operator involvement.

## Standing rule

When reality diverges from this plan, update this file in the same commit as the divergence. An out-of-date plan is worse than no plan.
