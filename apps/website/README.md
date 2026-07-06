# @toss/website

The Toss Enterprise marketing site: services, pricing, portfolio, retainer builder, and contact. **Live in production.** Its job is converting visitors into booked calls, paid projects, and retainers.

- Product doc (owns scope and conversion paths): [docs/04-product/website.md](../../docs/04-product/website.md)
- Canonical contact/payment endpoints: [lib/config.ts](lib/config.ts) (change them there, nowhere else)
- Env vars: see [.env.example](.env.example) and [docs/02-engineering/environments-and-secrets.md](../../docs/02-engineering/environments-and-secrets.md)

```bash
pnpm --filter @toss/website dev     # http://localhost:3000
pnpm --filter @toss/website build
```

Next.js 16 App Router, React 19, Tailwind CSS 4, Supabase (forms), deployed on Vercel. Before contributing, read [AGENTS.md](../../AGENTS.md).
