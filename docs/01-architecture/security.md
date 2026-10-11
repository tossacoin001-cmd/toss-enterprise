# Security

This document owns the security baseline for all Toss Enterprise systems. Incident handling lives in [../05-operations/incident-response.md](../05-operations/incident-response.md).

## Secrets

1. No secret ever enters git: not in code, not in docs, not in commit messages, not in `.env` files (only `.env.example` with empty values is committed).
2. Secrets live in exactly two places: Vercel project environment settings and GitHub Actions secrets. Local copies stay in untracked `.env.local`.
3. Rotation: if a secret may have leaked (pasted in chat, committed then reverted, shared over WhatsApp), rotate it the same day. A reverted commit is still a leak.
4. Registry of which variables exist: [../02-engineering/environments-and-secrets.md](../02-engineering/environments-and-secrets.md).

## Authentication and authorization

- Visibility OS: Clerk handles identity. Server-side code must derive the user from Clerk's server helpers, never trust client-supplied IDs. Route protection via `proxy.ts` (Next.js 16's name for middleware).
- Webhooks: every inbound webhook must verify its signature (Clerk via Svix secret). Unverified webhook handlers are a launch blocker.
- The website has no auth; its Supabase access uses the anon key with row-level security expected on any table the client can touch. Confirm RLS is enabled on contact/notify tables (open question below).

## Application rules

- All user input is validated with Zod at the API boundary before it touches a database.
- No raw SQL (standing rule from AGENTS.md); Prisma and Supabase clients only.
- API routes return generic error messages; details go to server logs only.
- Payment amounts and links are never constructed from client input; Flutterwave links are fixed, server-known values.
- Server-side fetches of a user-supplied URL (Visibility OS's website audit and, later, the public instant scan) go through `apps/visibility-os/lib/url-safety.ts` ([ADR-0013](decisions/0013-migrations-only-in-production-builds-and-url-safety.md)) and must stay guarded on every hop, not just the first request: only `http`/`https`; only the scheme's own port (80 or 443), so we cannot be used to probe other machines; no credentials in the URL; no IP addresses of any kind; no local or internal names (`.local`, `.internal`, `.lan` and similar); and after DNS, no address in any IANA special-use range, IPv4 or IPv6 (`isBlockedIp`, built on Node's `BlockList`, failing closed). Redirects are followed manually (`safeFetch`, not `redirect: "follow"`) and each hop is re-checked. Known remaining gap: the address is checked and then fetched again, so a hostile DNS server could answer differently the second time (test SE-06, planned with the instant-scan engine). Any new outbound fetch of user input needs the same treatment and the cases in `tests/url-safety.test.ts` and `tests/ssrf.test.ts`.

## Dependency and supply chain

- Single lockfile policy (pnpm) once Phase 0 lands; lockfile changes get reviewed like code.
- New dependencies need a reason in the PR description. Prefer well-known, maintained packages.
- Dependabot or `pnpm audit` in CI: planned, Phase 1.

## Data protection

- PII (client names, emails, phone numbers) per [data-architecture.md](data-architecture.md): stays in its owning store, never in logs, prompts, or fixtures.
- AI agents must not send customer PII to third-party APIs beyond what the task strictly requires, and never into training-enabled endpoints. See [../03-ai/ai-operating-system.md](../03-ai/ai-operating-system.md).

## Open questions

- Is RLS enabled on the website's Supabase tables? Verify and record.

## Resolved

- Clerk webhook Svix verification: **confirmed implemented** in `apps/visibility-os/app/api/webhooks/clerk/route.ts` (signature checked, rejects on failure). Verified in the 2026-07-05 audit. Remaining task: confirm `CLERK_WEBHOOK_SECRET` is set in the production Vercel env (the `.env.example` misnames it `SVIX_SECRET`).
