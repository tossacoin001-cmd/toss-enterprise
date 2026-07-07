# Roadmap

This file is the milestone view of the roadmap. The ordered execution plan with full checklists and exit criteria is owned by [docs/implementation-phases.md](docs/implementation-phases.md); when the two disagree, that doc wins.

## Phases at a glance

| Phase | Milestone | Exit criterion | Status |
|---|---|---|---|
| 0 | Honest repo: pnpm + Turborepo toolchain, CI quality gate, Knowledge Brain | Fresh clone builds green across every package | Done (2026-07-05) |
| 1 | Foundations: test rig (Vitest), uptime monitoring, CI hardening, `packages/config` and `packages/ui` extraction | CI blocks on tests; operator is alerted if prod goes down | In progress |
| 2 | Visibility OS scoring milestone: scoring formula decision, Google data source ADR, `visibility-agent` implemented, agent hosting ADR | A real business onboards and sees a real score unattended | Partially pulled forward (scoring v1 live in-app since 2026-07-06) |
| 3 | Funnel and measurement: `audit-agent`, free audit as lead magnet, analytics and SEO pass, BOS metrics | Every lead source is measurable | Planned |
| 4 | Monetization and scale-out: paid tiers, Flutterwave subscription rail, `sales-agent`, transactional email (Resend), case studies and first templates | A business can pay without operator involvement | Planned |

## Beyond the phases (declared targets, each gated on an ADR)

Toss AI chat assistant, CRM and lead pipeline, workflow engine (n8n), machine knowledge layer (pgvector), object storage (Cloudflare R2), multi-model AI. Designs live in the [architecture/](architecture/) pack; none are scheduled into a phase yet.

## Related views

- What is live right now: [PROJECT.md](PROJECT.md)
- Product portfolio detail: [docs/04-product/](docs/04-product/)
- Quarterly plans and now/next/later board: [roadmap/](roadmap/) (planned)
