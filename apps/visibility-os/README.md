# @toss/visibility-os

Visibility OS: a SaaS that scores a local business's online visibility (Google Business Profile, social presence, website) and turns the gaps into an action plan. **In development; Phase 1 (auth, onboarding, dashboard shell, data model) is deployed. Scoring is not implemented yet.**

- Product doc (owns the loop, current state, pending decisions): [docs/04-product/visibility-os.md](../../docs/04-product/visibility-os.md)
- Data model: [prisma/schema.prisma](prisma/schema.prisma), registry in [docs/01-architecture/data-architecture.md](../../docs/01-architecture/data-architecture.md)
- Scoring will be computed by [@toss/visibility-agent](../../agents/visibility-agent/) (spec-first, not implemented)
- Env vars: see [.env.example](.env.example); note the webhook secret is `CLERK_WEBHOOK_SECRET`

```bash
pnpm --filter @toss/visibility-os dev     # http://localhost:3001
pnpm --filter @toss/visibility-os build   # runs prisma generate first
```

Next.js 16 App Router, React 19, Tailwind CSS 4, Clerk (auth), Prisma + Postgres, deployed on Vercel. Before contributing, read [AGENTS.md](../../AGENTS.md).
