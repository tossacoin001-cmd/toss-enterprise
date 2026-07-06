# CLAUDE.md

**Read [AGENTS.md](AGENTS.md) first.** It is the canonical contract for this repository and applies to Claude Code in full. This file only adds what Claude needs day to day; it must never duplicate or contradict AGENTS.md or `docs/`.

## Repo in one paragraph

pnpm + Turborepo monorepo for Toss Enterprise. `apps/website` is the live marketing site (Next.js 16, Tailwind 4, Supabase, Flutterwave payments). `apps/visibility-os` is the Visibility OS SaaS (Next.js 16, Clerk auth, Prisma on Postgres). `agents/` holds standalone AI agent packages (Anthropic SDK + Vercel AI SDK), currently manifests only. `docs/` is the Knowledge Brain and single source of truth.

## Commands

```bash
pnpm install                              # always from root (pnpm is pinned via packageManager)
pnpm --filter @toss/website dev           # marketing site, port 3000
pnpm --filter @toss/visibility-os dev     # Visibility OS, port 3001
pnpm --filter @toss/website add <pkg>     # add a dep to one app
pnpm add -D <pkg> -w                      # add a dev dep to root
pnpm build / pnpm lint / pnpm type-check  # turbo, runs across every workspace package
```

The quality gate (type-check, lint, build across all packages) must stay green; CI enforces it on every push and PR to main.

## Stack (actual, verified against code)

- Next.js 16 (App Router) + React 19 + TypeScript 5.8 + Tailwind CSS 4
- Auth: Clerk (visibility-os). Payments: Flutterwave payment links (website)
- Data: Supabase (website), Prisma + Postgres (visibility-os)
- AI: Anthropic Claude via `@anthropic-ai/sdk` and Vercel AI SDK (agents)
- Build: Turborepo. Deploy: Vercel, one project per app. Node >= 20

If any of this looks different from what you expected (for example NextAuth or Stripe), the ADRs in `docs/01-architecture/decisions/` explain why. Do not "correct" the code back to the old plan.

## Where knowledge lives

| Question | Doc |
|---|---|
| How is the monorepo laid out? | docs/01-architecture/monorepo.md |
| Why was X chosen? | docs/01-architecture/decisions/ |
| Code style, review, testing rules | docs/02-engineering/ |
| Agents, prompts, MCP, AI policy | docs/03-ai/ |
| Products and roadmap | docs/04-product/ |
| Deploys, monitoring, SOPs | docs/05-operations/ |
| Brand, voice, writing rules | docs/06-brand/brand-system.md |
| What to build next | docs/implementation-phases.md |
