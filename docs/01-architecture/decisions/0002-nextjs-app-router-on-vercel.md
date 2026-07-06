# ADR-0002: Next.js App Router on Vercel, one project per app

- **Status:** Accepted (records the stack already in production)
- **Date:** 2026-07-05 (documented retroactively)
- **Deciders:** Founder

## Context

Both user-facing apps need SEO-capable rendering, fast iteration by a solo operator with AI assistance, and zero-ops hosting. The team already ships Next.js daily.

## Decision

All web apps use Next.js 16 App Router with React 19, TypeScript, and Tailwind CSS 4. Each app deploys as its own Vercel project from this monorepo, triggered from `main`.

## Alternatives considered

- **Astro or plain static for the website:** cheaper, but splits the stack in two and the site already uses interactive components (retainer builder, forms, animations). Rejected.
- **Single Vercel project with rewrites:** couples deploys; one bad build takes down both products. Rejected.
- **Self-hosting (VPS, Docker):** operational load a solo operator should not carry today. Rejected.

## Consequences

- Per-app `vercel.json` plus a root `vercel.json` steer the GitHub integration; this config is fragile and changes to it must be tested on a preview deploy first.
- Vendor lock-in to Vercel accepted consciously; revisit if costs grow.
- Next.js 16 is ahead of most AI training data. Contributors (human or AI) must check bundled docs in `node_modules/next/dist/docs/` when uncertain.
