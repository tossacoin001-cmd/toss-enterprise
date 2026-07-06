# Implementation Phases

This document owns the ordered execution plan. Phases are sequential; a phase is done when its exit criteria pass, and no feature work jumps ahead of an incomplete earlier phase without a written exception in this file. Product rationale lives in [04-product/roadmap.md](04-product/roadmap.md).

## Phase 0: Make the repo honest (repo hygiene, no features)

The monorepo currently lies about itself. Fix the lies before building on them. Findings behind these items: [audits/2026-07-05-repository-audit.md](audits/2026-07-05-repository-audit.md).

- [ ] Replace `package-lock.json` with a committed `pnpm-lock.yaml`; delete the npm lockfile and the `.npmrc` npm workarounds (`legacy-peer-deps`, retry tuning) once pnpm is the real installer.
- [ ] Rewrite root `package.json`: remove the npm `workspaces` field (pnpm-workspace.yaml is authoritative), convert scripts to turbo (`turbo build`, `turbo lint`, `turbo type-check`, `turbo dev`), add a `packageManager` field pinning pnpm.
- [ ] Convert both `vercel.json` files off npm: root and visibility-os currently run `npm install`/`npm run ...` with legacy-peer-deps. Use pnpm (corepack) install and build commands. Verify on preview deploys; this config has a breakage history.
- [ ] Align Node versions: `.nvmrc` says 20.18.0, CI uses 22, engines say >=20. Pick one (recommend 22 LTS everywhere) and pin it in all three places.
- [ ] Give `agents/*` stub `src/index.ts` files and `tsconfig.json` (they have neither) so workspace-wide `build`/`type-check` pass.
- [ ] Add an ESLint config to `apps/visibility-os` (its `lint` script currently has no config and checks nothing).
- [ ] Fix `apps/visibility-os/.env.example`: rename `SVIX_SECRET` to `CLERK_WEBHOOK_SECRET` (the name the code actually reads). Create the missing `apps/website/.env.example` with its six `NEXT_PUBLIC_*` vars.
- [ ] Remove unused dependencies: `@anthropic-ai/sdk` and `recharts` from visibility-os; `@radix-ui/react-dialog` and `@supabase/ssr` from website (re-verify with grep before removing).
- [ ] Delete dead public assets in `apps/website/public/`: zero-byte `logo.png`, unreferenced `logo.svg`, and create-next-app leftovers (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`).
- [ ] Replace boilerplate app READMEs (website: default create-next-app text; visibility-os: describes the wrong product) with thin pointers to the docs.
- [ ] CI: remove the `develop` trigger, delete the `deploy-website` job (Vercel GitHub integration owns deploys, per ci-cd.md), make the quality gate run turbo tasks across all packages.
- [ ] Verify both Vercel projects still deploy from a preview branch after the above.
- [ ] Add `LICENSE` decision (private/proprietary notice) and root `.editorconfig` if desired.

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
