# Environments and Secrets

This document owns the registry of environments and every environment variable in the system. Security rules for handling secrets are in [../01-architecture/security.md](../01-architecture/security.md). When you add a variable, add it here and to the owning app's `.env.example` in the same commit.

## Environments

| Environment | What it is | Config lives in |
|---|---|---|
| Local | `.env.local` per app, untracked | developer machine |
| Preview | Vercel preview deployments per branch | Vercel project settings (Preview scope) |
| Production | Vercel production per app | Vercel project settings (Production scope) |
| CI | GitHub Actions | repo secrets |

There is no staging environment; Vercel previews serve that role.

## Variable registry

### apps/website (`@toss/website`)

| Variable | Secret? | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | No (public) | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No (public, RLS-protected) | Supabase anon key |
| `NEXT_PUBLIC_BOOKING_URL` | No | Calendly link override (has code default) |
| `NEXT_PUBLIC_FLUTTERWAVE_URL` | No | Payment page override (has code default) |
| `NEXT_PUBLIC_WHATSAPP` | No | WhatsApp number override (has code default) |
| `NEXT_PUBLIC_EMAIL` | No | Contact email override (has code default) |

### apps/visibility-os (`@toss/visibility-os`)

| Variable | Secret? | Purpose |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | No (public) | Clerk client key |
| `CLERK_SECRET_KEY` | **Yes** | Clerk server key |
| `DATABASE_URL` | **Yes** | Postgres connection string for Prisma |
| `CLERK_WEBHOOK_SECRET` | **Yes** | Clerk webhook signature verification. Note: the code reads `CLERK_WEBHOOK_SECRET`; the app's `.env.example` wrongly says `SVIX_SECRET` (Phase 0 fix) |

### agents/* (when implemented)

| Variable | Secret? | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | **Yes** | Claude API access; separate keys per environment |

### CI (GitHub Actions secrets)

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (website build). The old `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID_WEBSITE` secrets are unused since Phase 0 removed the CI deploy job; delete them from repo settings.

## Rules

1. `NEXT_PUBLIC_*` values are shipped to browsers. Nothing sensitive ever gets this prefix.
2. Every variable has exactly one owning app and appears in that app's `.env.example` with an empty value and a comment.
3. Defaults in code (as in `apps/website/lib/config.ts`) are acceptable only for non-secret, public values.
4. Rotating a secret: update Vercel, update GitHub secrets if used in CI, redeploy, then revoke the old value. Same day as any suspected leak.
