# Changelog

Notable changes to the Toss Enterprise OS, newest first. The detailed record is the Conventional Commit history; this file only keeps the milestones.

## 2026-10-08

- Visibility OS launch readiness: merged the 2026-08-29 audit fixes (no onboarding crash from a shared blank email, SSRF-safe redirect handling in the website audit, Sign Out ends the Clerk session, `middleware.ts` renamed to `proxy.ts`, business detail page). Website audit no longer gives false "not mobile-friendly" or "no search description" results on minified HTML, and a redirect chain can no longer exceed the audit's 8s budget.

## 2026-09-23

- Visibility OS: weekly re-score cron and digest email. Every business is re-scored weekly via a Vercel Cron job, and every owner gets an email every week regardless of whether anything changed: delta-led when something moved, top-open-action-item-led when it didn't ([ADR-0010](docs/01-architecture/decisions/0010-weekly-rescore-cron-and-digest.md)). New shared `@toss/email` package (Resend), extracted from the website's contact-form notifier at its second occurrence.

## 2026-09-22

- Visibility OS: real Google data at onboarding. The free-text Google URL field is replaced with a Places API (New) search; the Google subscore now requires a verified `googlePlaceId`, and `reviewCount`/`avgRating` are populated from live Google data instead of always reading 0 ([ADR-0009](docs/01-architecture/decisions/0009-google-places-api-for-live-google-data.md)).

## 2026-07-06

- Architecture pack created in `architecture/`: ten numbered blueprints mapping the current system to the target AI Growth OS (sprint goal 1).
- Scaffold placeholders: three workflow specs in `workflows/`, three proposed MCP server stubs in `mcp/`, prompt registry in `prompts/`, knowledge sources and corpora format in `knowledge/`. `ENGINEERING.md` gained the standards in brief; `ROADMAP.md` gained the Phase 0 to 4 milestone view.
- Knowledge taxonomy: nineteen numbered domain sections under `knowledge/` (governance to archive), each with a scope README citing its owning doc. Nine role-agent charters added under `agents/` (ceo, coo, cfo, cto, marketing, research, seo, support, automation); charters are README-only until their specs land.
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
