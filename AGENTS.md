# AGENTS.md: The Contract for AI Work in This Repository

This file is the canonical entry point for every AI assistant (Claude Code, Codex, Gemini CLI, Cursor, Windsurf, and any future tool) and every human contributor. Read it fully before changing anything.

## The prime directive

This repository is the operating system of Toss Enterprise. The `docs/` tree is the Knowledge Brain and the single source of truth.

1. **Never leave an undocumented decision.** Any choice of technology, structure, or process gets an ADR in `docs/01-architecture/decisions/` before or alongside the change.
2. **Never duplicate functionality or knowledge.** Search `docs/` and the codebase first. Extend or link, do not copy. Shared code goes in `packages/`.
3. **Never create hidden knowledge.** If you learned something needed to do the work (a quirk, a constraint, an external dependency), write it into the relevant doc in the same change.
4. **Docs and code ship together.** A change that makes a doc wrong must update that doc in the same commit.

## Required reading order

1. This file.
2. [docs/README.md](docs/README.md), the documentation map.
3. The doc that owns your area (see map). Examples:
   - Touching code: [docs/02-engineering/engineering-standards.md](docs/02-engineering/engineering-standards.md)
   - Touching architecture: [docs/01-architecture/system-overview.md](docs/01-architecture/system-overview.md)
   - Touching AI agents: [docs/03-ai/ai-operating-system.md](docs/03-ai/ai-operating-system.md)
   - Deploying: [docs/05-operations/deployment.md](docs/05-operations/deployment.md)

## Hard rules

- **pnpm only.** Never npm or yarn. All installs from the repo root.
- **TypeScript strict.** No `any`, no `@ts-ignore` without an inline reason, no raw SQL (use Prisma or the Supabase client), no `console.log` in production paths.
- **Conventional Commits.** `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `ci:`. Scope with the package name when useful, for example `feat(visibility-os): ...`.
- **No secrets in the repo.** Env vars only. Every new variable is added to the app's `.env.example` and documented in [docs/02-engineering/environments-and-secrets.md](docs/02-engineering/environments-and-secrets.md).
- **Do not invent structure.** The approved layout is in [docs/01-architecture/monorepo.md](docs/01-architecture/monorepo.md). New top-level folders require an ADR.
- **Next.js 16 warning:** this repo uses Next.js 16, which has breaking changes versus older training data. Check `node_modules/next/dist/docs/` before writing Next.js code you are not sure about.
- **Writing style:** follow [docs/06-brand/brand-system.md](docs/06-brand/brand-system.md) for all copy and docs. Notably: no em-dashes, use plain punctuation.

## Current state honesty

The repo has known gaps (missing pnpm lockfile, npm-based root scripts, empty agent packages, zero tests). They are catalogued in [docs/implementation-phases.md](docs/implementation-phases.md) Phase 0. Do not silently work around a known gap; fix it as its phase directs, or note the workaround in the doc.

## When you are unsure

Do not guess and do not invent. Check `docs/`. If the answer is not there, that is a documentation bug: ask the owner (tossacoin001@gmail.com) or record the open question in the relevant doc under an "Open questions" heading.
