# Engineering

This file is the root entry point to engineering practice: the standards in brief, with links to the owning docs in [docs/02-engineering/](docs/02-engineering/). When this brief and an owning doc disagree, the owning doc wins.

## The non-negotiables (owned by [AGENTS.md](AGENTS.md))

pnpm only. TypeScript strict. Conventional Commits. No secrets in the repo. Docs ship with the change. No new top-level structure without an ADR.

## Standards in brief

- **Types:** strict mode, no `any` (use `unknown` and narrow), no `@ts-ignore` without an inline reason. Zod validates every external input: request bodies, webhooks, env parsing, third-party responses.
- **Next.js 16:** App Router only, Server Components by default, data access on the server, secret-bearing clients never imported into client components. Next.js 16 differs from AI training data; check `node_modules/next/dist/docs/` when unsure.
- **Data:** no raw SQL, Prisma or the Supabase client only. Schema and migrations live with the owning app.
- **Hygiene:** no `console.log` in production paths, no dead code or commented-out blocks, Prettier formats everything and is never debated in review. Comments explain constraints and non-obvious why, never restate the code.
- **Naming:** kebab-case modules, PascalCase React component files, booleans read as predicates, functions are verbs.
- **Errors:** every `catch` handles meaningfully or rethrows with context; swallowed errors are bugs. User-facing failures always say what to do next.
- **Definition of done:** builds, lint and type-check pass, relevant tests pass, affected docs updated in the same commit, verified in a running app.

## Where the full standards live

| Topic | Doc |
|---|---|
| Code style, framework rules, definition of done | [docs/02-engineering/engineering-standards.md](docs/02-engineering/engineering-standards.md) |
| Git and PR process | [docs/02-engineering/git-workflow.md](docs/02-engineering/git-workflow.md) |
| Testing strategy | [docs/02-engineering/testing-strategy.md](docs/02-engineering/testing-strategy.md) |
| CI/CD | [docs/02-engineering/ci-cd.md](docs/02-engineering/ci-cd.md) |
| Environments and secrets | [docs/02-engineering/environments-and-secrets.md](docs/02-engineering/environments-and-secrets.md) |
| Monorepo layout and dependency rules | [docs/01-architecture/monorepo.md](docs/01-architecture/monorepo.md) |
