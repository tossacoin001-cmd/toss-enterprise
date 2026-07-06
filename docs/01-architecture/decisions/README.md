# Architecture Decision Records

Every significant decision gets an ADR: technology choices, structural changes, process changes with alternatives. If you rejected an option, that is a decision worth recording.

## Process

1. Copy [template.md](template.md) to `NNNN-short-kebab-title.md` (next number in sequence).
2. Status is one of: `Proposed`, `Accepted`, `Superseded by ADR-XXXX`, `Rejected`.
3. ADRs are immutable once accepted. Changing your mind means a new ADR that supersedes the old one.
4. Link the ADR from the doc that describes the affected area.

## Index

| # | Title | Status |
|---|---|---|
| [0001](0001-pnpm-turborepo-monorepo.md) | pnpm + Turborepo monorepo | Accepted |
| [0002](0002-nextjs-app-router-on-vercel.md) | Next.js App Router on Vercel, one project per app | Accepted |
| [0003](0003-clerk-for-visibility-os-auth.md) | Clerk for Visibility OS auth | Accepted |
| [0004](0004-flutterwave-for-payments.md) | Flutterwave for payments | Accepted |
| [0005](0005-supabase-and-prisma-data-split.md) | Supabase for website, Prisma+Postgres for Visibility OS | Accepted |
| [0006](0006-anthropic-claude-for-agents.md) | Anthropic Claude + Vercel AI SDK for agents | Accepted |
| [0007](0007-supabase-postgres-and-in-app-scoring-v1.md) | Supabase Postgres integration envs, in-app scoring v1 | Accepted |
