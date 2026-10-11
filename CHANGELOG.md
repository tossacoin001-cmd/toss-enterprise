# Changelog

Notable changes to the Toss Enterprise OS, newest first. The detailed record is the Conventional Commit history; this file only keeps the milestones.

## 2026-10-11

- Instant scan slice S2: data and limits ([ADR-0016](docs/01-architecture/decisions/0016-instant-scan-api-limits-and-turnstile.md)). `POST /api/scan` and `GET /api/scan/<id>` with Cloudflare Turnstile, a `Scan` table, and the approved limits (3 new sites per browser, 30 per network, 300 a day overall, one fresh scan per site per 24 hours shared by everyone; cached results stay free; refused requests use no quota). No network address is stored. Two people scanning the same new site at once cause one scan (checked against a real Postgres). Fails closed if the human check is down. The Turnstile keys are set in Production. 75 new tests.

- Scan engine v2, slice S1 of the instant scan ([ADR-0015](docs/01-architecture/decisions/0015-scan-engine-v2-evidence-model-and-weights.md)). Every check is now found, missing or could-not-check, and only the first two count toward a score, so a slow or blocking site is no longer reported as unreachable and scored 0. Failures are classified (certain versus uncertain) with plain wording audited by tests; pages are read to the end of the head; social links are verified only where a server can honestly tell (X, YouTube, LinkedIn); pages built with JavaScript get the benefit of the doubt; people with no website get a Start here plan and a WhatsApp link. `scoreBusiness` now uses the engine, so scores change: a working site no longer drops to 0 after one slow visit, and a typed Instagram handle alone no longer scores a perfect social score. 332 new engine tests; 574 pass in total.

- Faster sign-in and sign-up ([ADR-0014](docs/01-architecture/decisions/0014-fast-auth-pages-and-scoped-clerk.md)). Measured on the live site: `/sign-up` was rebuilt by a server on every visit (no cache, first byte 0.3s to 9s depending on a cold function), and Clerk's login library loaded on every page including the home page. Now `/sign-in` and `/sign-up` are prerendered and served from the edge with a skeleton form, and Clerk loads only in the sign-in, onboarding and dashboard areas, so the home page carries no login code. `/api/health` also sends a Server-Timing header to measure database distance. A preload idea was tested and dropped because Clerk already places its script tag early in the page. Measured after deploy over 9 cold visits from Lagos: form visible median 2.0s (was 2.5s) and worst 2.7s (was 8.8s); the database answers in about 8 ms from the app's region, so the region stays.
- Visibility OS safety fixes ([ADR-0013](docs/01-architecture/decisions/0013-migrations-only-in-production-builds-and-url-safety.md)). (1) Migrations now run only in production builds: previews share the production database, so a preview build used to migrate production before merge. Migrations must also be expand-only, enforced by a test. (2) One URL-safety module replaces the old checks: only ports 80/443, no credentials, no IP addresses, no internal names, every IANA reserved range blocked (10 of 33 dangerous addresses were still being requested). 203 tests pass, including a test that runs the real Vercel build command for production, preview, development and unknown environments.
- Test specification grown to 194 tests with five experience areas: sells itself in seconds, solves problems as they happen, keeps users updated, belonging, and a quality bar (speed, no dead ends, human errors).

## 2026-10-10

- Instant-scan slice S0 done: GO. Probed 18 sites and 12 social pages from Vercel's network (during a build, read back from the build log). Real sites answer in 0.3s median (Lagos: 3.6s); Instagram, Facebook and TikTok cannot be verified from servers (identical login page), YouTube, X and LinkedIn can; a 1.2 MB page showed that tags must be read to the end of the head, not a fixed 500 KB. Test list now 151.
- Full test specification for Visibility OS written before any instant-scan code: [150 tests](docs/04-product/visibility-os-test-plan.md) across input handling, the no-website path, the scan engine, scoring, abuse limits, security, privacy, pages, funnel, ecosystem, reliability and 15 user-behaviour scenarios. 11 already run (including score properties over 1,024 input combinations); 139 written as `it.todo`. The security probe found 10 of 33 dangerous addresses still requested by the existing audit (odd ports, credentials in URLs, reserved ranges); encoded as known-gap tests. Plan updated with the path for businesses that have no website yet.
- Plan for the free instant scan with no sign-up (Visibility OS phase B), with its assumptions tested before any build: [plan](docs/04-product/visibility-os-instant-scan-plan.md), experiment scripts in [research/instant-scan-experiments/](research/instant-scan-experiments/). Key findings: the current audit wrongly reports working sites as unreachable after one 8s timeout; plain fetch misses JavaScript-added signals on about 1 in 5 real sites; Instagram, X and YouTube links can be verified, Facebook and TikTok cannot.
- Visibility OS Vercel build fixed: the build command now builds workspace packages first (`pnpm --filter "@toss/visibility-os..." build`). Without it, `@toss/email` (a built, gitignored `dist`) could not be resolved, so every Vercel build of the weekly digest work failed even though local builds passed. A test guards the command.
- Visibility OS database reliability ([ADR-0012](docs/01-architecture/decisions/0012-supabase-free-tier-until-first-paying-customer.md)). The free Supabase database had paused, which silently failed every production deploy from 2026-08-29. Restored; added `GET /api/health` (reads the database, 200 or 503) for an uptime monitor, a runbook for database and deploy failures, and a recorded rule to upgrade to Supabase Pro before the first paying customer.
- Visibility OS launch readiness, phase A ([ADR-0011](docs/01-architecture/decisions/0011-daily-time-boxed-weekly-run-and-connect-listing.md)). Onboarding no longer fails when no Google listing is picked (or "Other" country); the weekly run is daily and time-boxed so it cannot time out as users grow; the digest links to the dashboard and has a one-click unsubscribe; a Google listing can be connected after onboarding; friendly error pages; speed check is tiered. First test suite in the repo (Vitest, `apps/visibility-os`), with a regression test per bug.

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
