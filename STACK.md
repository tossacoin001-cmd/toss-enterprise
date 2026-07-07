# Stack

This file is the stack at a glance. Each choice is owned by an ADR in [docs/01-architecture/decisions/](docs/01-architecture/decisions/); change the ADR before changing the stack.

| Layer | Choice | Why (ADR) |
|---|---|---|
| Monorepo | pnpm + Turborepo, Node 20+ | [ADR-0001](docs/01-architecture/decisions/0001-pnpm-turborepo-monorepo.md) |
| Framework | Next.js 16 (App Router), React 19, TypeScript 5.8, Tailwind CSS 4 | [ADR-0002](docs/01-architecture/decisions/0002-nextjs-app-router-on-vercel.md) |
| Hosting | Vercel, one project per app | [ADR-0002](docs/01-architecture/decisions/0002-nextjs-app-router-on-vercel.md) |
| Auth | Clerk (Visibility OS) | [ADR-0003](docs/01-architecture/decisions/0003-clerk-for-visibility-os-auth.md) |
| Payments | Flutterwave payment links (website) | [ADR-0004](docs/01-architecture/decisions/0004-flutterwave-for-payments.md) |
| Data | Supabase (website), Prisma + Postgres (Visibility OS) | [ADR-0005](docs/01-architecture/decisions/0005-supabase-and-prisma-data-split.md), [ADR-0007](docs/01-architecture/decisions/0007-supabase-postgres-and-in-app-scoring-v1.md) |
| AI | Anthropic Claude via `@anthropic-ai/sdk`, Vercel AI SDK | [ADR-0006](docs/01-architecture/decisions/0006-anthropic-claude-for-agents.md) |

Deliberate choices that look unusual are still deliberate: Clerk not NextAuth, Flutterwave not Stripe. Do not "correct" the code back to an old plan.
