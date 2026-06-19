# TOSS-ENTERPRISE — Monorepo

## Structure
```
TOSS-ENTERPRISE/
├── apps/
│   ├── website/          @toss/website     — Main Toss Enterprise site (Next.js 16)
│   ├── visibility-os/    @toss/visibility  — SaaS product
│   └── ai-agents/        @toss/ai-agents   — AI agent dashboard
├── agents/
│   ├── visibility-agent/ @toss/visibility-agent
│   ├── sales-agent/      @toss/sales-agent
│   └── audit-agent/      @toss/audit-agent
├── packages/             — Shared packages (ui, config, utils)
├── clients/              — Client project files (non-code)
├── templates/            — Reusable starter templates
├── docs/                 — SOPs, architecture, prompts
├── automation/n8n/       — Automation workflows
└── assets/               — Branding, portfolio
```

## Package Manager
Always use **pnpm**. Never npm or yarn.

## Commands
```bash
# Run all apps in dev
pnpm dev

# Run one app
pnpm --filter @toss/website dev
pnpm --filter @toss/visibility-agent dev

# Build all
pnpm build

# Install a dep to a specific app
pnpm --filter @toss/website add framer-motion

# Install a dev dep to root
pnpm add -D turbo -w
```

## Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript 5
- **Styling**: TailwindCSS 4 + Shadcn UI
- **Animation**: Framer Motion + GSAP
- **Database**: Supabase + Prisma
- **Auth**: NextAuth v5
- **Payments**: Stripe
- **Email**: Resend
- **AI**: Anthropic (Claude) + Vercel AI SDK
- **Build**: Turborepo
- **Deploy**: Vercel (per-app)

## Code Rules
- pnpm workspaces — all deps installed from root
- Shared code goes in `packages/` (e.g. `packages/ui`, `packages/config`)
- Each app in `apps/` deploys independently to Vercel
- Each agent in `agents/` runs as a standalone Node.js process
- No `any` types, no raw SQL, no `console.log` in production code
