# Visibility OS market upgrade: Phase 0 baseline and checklist

Written 2026-10-23 from the working tree at the tip of `feat/readiness-and-watch` (PR #18, stacked on PR #17), which sits on `origin/main` at `b12a6e8`. Owner of the plan: [visibility-os.md](visibility-os.md). This page records what the code does today so each later claim can be checked against it.

## Starting state

- `origin/main` is `b12a6e8` (the handoff baseline). Two reviewed-but-unmerged PRs add work this upgrade builds on, so this branch (`feat/market-upgrade`) starts from their tip rather than from `main`:
  - PR #17: confirm a missing domain with an independent resolver, share card, safety headers, self-scan example.
  - PR #18: readiness score label, "not measured yet" list, next level, weekly watch (findings kept each week, compared next week).
- Working tree clean, `pnpm-workspace.yaml` unchanged, `pnpm@9.15.9` pinned in the root `package.json`.
- Last full run on the PR #18 branch: 886 tests passed, 179 `it.todo` (the instant-scan specification, deliberately unwritten), type-check and lint clean. CI is billing-locked, so every check is run locally.

## Feature matrix (each line verified against the files named)

Status key: **S** implemented in source and tested · **U** implemented, unverified in production · **P** partial · **M** missing.

| Area | Status | Evidence |
|---|---|---|
| Public instant scan, rate limits, saved results | S | `lib/scan`, `lib/scan-limits`, `app/api/scan`, `tests/engine`, `tests/scan-limits` |
| Three audience routes (website, Instagram/WhatsApp, individual) | S | `components/scan/ScanBox.tsx`, `lib/scan-ui/request.ts` |
| Scan result page, share card, private headers | S | `app/scan/[id]/page.tsx`, `app/opengraph-image.tsx`, `next.config.ts` |
| Clerk auth, onboarding, dashboard, businesses, settings | S | `app/(auth)`, `app/onboarding`, `app/(dashboard)` |
| Weekly cron and digest | U | `vercel.json` (daily 07:00 UTC), `lib/weekly-process.ts`; no record of a successful production run or delivered email exists in the repo |
| Weekly watch (changes since last week) | S in code, U in production | `lib/value/changes.ts`, `lib/run-weekly-score.ts` (PR #18) |
| Action items generated from findings | P | `lib/scoring.ts` creates them; `lib/run-weekly-score.ts` deletes PENDING and recreates, so an IN_PROGRESS item for the same finding can be duplicated |
| Action status change (pending, in progress, done) | **M** | No route changes an `ActionItem`; dashboard lists only 5 non-done items; the product doc lists it as unfinished |
| Scan claim after sign-up | **M** | `Scan.claimedByUserId` exists and nothing reads or writes it (`grep` finds no use) |
| Score history and reports | **M** | Sidebar links `/reports` and `/ai-audit` as "soon"; no route exists |
| Business limit by plan | P | `app/api/businesses/route.ts` hard-codes 3; onboarding page repeats it; no plan check |
| Trial, entitlements, billing | **M** | `User.plan` enum exists and is never changed; settings page lists USD prices ($29, $79, $199) that no one decided and nothing sells |
| Business membership or roles | M | Owner-only (`Business.userId`); out of scope unless needed |
| Edit business details | M | `PATCH /api/businesses/[id]` only connects a Google listing |
| Account export and deletion | M | Clerk `user.deleted` webhook deletes the row; no in-app export or deletion |
| Anonymous scan retention cleanup | **M** | `Scan.expiresAt` is set to 30 days; nothing deletes expired rows, while the privacy page promises deletion |
| Google data in the signed-in score | U | `lib/google-places.ts`; works only when `GOOGLE_PLACES_API_KEY` is set; public copy says "connect after sign-up" |

## Defects confirmed in source (not assumed)

1. **A real zero is treated as "no scan".** `DashboardClient.tsx:65` is `score?.total ?? 0`; the "Re-run Audit" button is hidden when the score is 0 (`currentScore > 0`) and the "Run your first audit" banner shows when it is 0. `businesses/page.tsx:83` does the same.
2. **"AI audit" is not AI.** Dashboard empty state, onboarding copy, settings plan lists and the sidebar say "AI audit", "AI action items", "AI-generated tasks". Scoring is deterministic (`lib/scoring.ts`, `lib/scan`). Nothing calls a model.
3. **Settings shows invented prices and features** (`settings/page.tsx` `PLAN_DETAILS`): $0/$29/$79/$199, "API access", "White-label reports", "Auto monthly reports". None exists.
4. **Dead-end navigation:** Reports and AI Audit appear in the sidebar as "soon".
5. **Action duplication on rescan** (see matrix).
6. **Anonymous scans never expire** in the database.
7. **Review and rating cells show a dash for "no data" but the Google/Social cells show the stored 0** when no Google listing or handle exists, which reads as a failing grade rather than "not checked".
8. **Dark green and gold workspace** with 10px uppercase gold labels at 25 to 50 percent opacity, serif numerals, glow buttons and inline literal colours throughout `app/(dashboard)` and `components`. Fails the handoff's daylight-legibility direction.
9. The Clerk webhook secret and the Resend sending domain are listed in the docs as unconfirmed in production; the weekly watch promise depends on the second.

## Ordered checklist

Each item ships with tests written first. Items marked ★ are the first slice.

**Phase 1: design foundation and honest states**
- ★ 1.1 Honest score states: absent versus genuine zero versus partial versus stale; stop `?? 0`; remove "AI" claims; navigation without dead ends.
- 1.2 Semantic design tokens for an ivory workspace and a small shared component set (Button, Notice, StatusBadge, EmptyState, PageHeader); apply to dashboard, businesses, settings, onboarding shell.
- 1.3 Dashboard ordered around the next three actions, freshness, comparable change, progress.

**Phase 2: complete the action loop**
- ★ 2.1 Stable action keys, owner-checked status updates (pending, in progress, done, reopen), completion time and note, reconciliation on rescan (no duplicates, no lost notes).
- 2.2 Action plan page with status and category filters.
- 2.3 Scan claim after sign-up (authorised, replay-safe, bound to the signed-in user) and onboarding that starts from it.
- 2.4 Reports: dated history with coverage and scoring version, comparable change, printable report, account export.

**Phase 3: commercial and operational readiness**
- 3.1 Entitlements: one plan-policy source, trial lifecycle (start once, exact end), states, server enforcement, truthful settings.
- 3.2 Billing building blocks behind confirmed configuration: webhook verification, event de-duplication, amount/currency/plan validation, subscription states. Checkout stays unavailable until prices and provider keys are confirmed.
- 3.3 Data controls: business edit, account deletion and export, anonymous-scan cleanup job.
- 3.4 Reliable weekly run: durable run record, duplicate-send protection, stale-data display.

**Phase 4: release candidate**
- Mobile and keyboard journey, accessibility and contrast checks, ADRs, environment docs, changelog, preview and PR.

## Blockers and owner decisions (recorded, not guessed)

- Prices, plan limits and the Flutterwave activation: unconfirmed, so checkout stays unavailable.
- Rollout rule for existing accounts' trial: default chosen in 3.1 (a trial starts once, at the account's first visit after release; nobody is expired retroactively). Owner may change it.
- Resend sending domain verification and `CLERK_WEBHOOK_SECRET` in production: unconfirmed; the digest and the watch cannot be called live until both are.
- Production release: not part of this handoff.
