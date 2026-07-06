# Engineering Standards

This document owns how code is written in this repository. The git process is in [git-workflow.md](git-workflow.md), testing in [testing-strategy.md](testing-strategy.md).

## Language and types

- TypeScript everywhere, strict mode on. No `any`. If a type is genuinely unknowable, use `unknown` and narrow it.
- No `@ts-ignore` or `@ts-expect-error` without an inline comment stating the reason.
- Zod validates every external input: API request bodies, webhook payloads, env parsing in agents, third-party API responses you rely on.

## Framework rules (Next.js 16)

- App Router only. Server Components by default; add `"use client"` only when the component needs state, effects, or browser APIs.
- Data access happens on the server (Server Components, route handlers, server actions). The Prisma client and any secret-bearing client never import into client components.
- Route handlers under `app/api/` validate input with Zod and return typed JSON. Generic error messages to clients; details to server logs.
- Next.js 16 differs from training data. When unsure, read `node_modules/next/dist/docs/` first (standing rule from AGENTS.md).

## Styling and UI

- Tailwind CSS 4 utility classes. Shared component patterns will live in `packages/ui` once extracted (second-occurrence rule in monorepo.md).
- Animations: Framer Motion. Keep them out of Server Components.
- Follow the brand system ([../06-brand/brand-system.md](../06-brand/brand-system.md)) for all user-visible copy.

## Code hygiene

- No `console.log` in production paths. Agents use a structured logger (chosen when the first agent is built).
- No raw SQL; Prisma or Supabase client only.
- No dead code and no commented-out blocks in committed code; git history is the archive.
- Prettier (with the Tailwind plugin) formats everything: `pnpm format`. Formatting is never debated in review.
- Comments explain constraints and non-obvious "why", never restate the code.

## Naming

- Files: kebab-case for modules, PascalCase for React component files (matches existing `apps/website/components/`).
- Booleans read as predicates (`isLive`, `hasPaid`). Functions are verbs. No abbreviations that are not industry standard.

## Error handling

- Fail loudly in development, degrade gracefully in production.
- Every `catch` either handles the error meaningfully or rethrows with context. Swallowed errors are bugs.
- User-facing failure states (forms, payments) always tell the user what to do next (retry, contact WhatsApp).

## Definition of done

A change is done when: it builds, `lint` and `type-check` pass, tests relevant to the change pass (once the test rig exists), docs affected by the change are updated in the same commit, and the change is verified in a running app, not just by the compiler.
