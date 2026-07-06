# Toss Enterprise: Master AI Context

This file is the orientation card every AI tool reads first for company context. The binding work contract is [AGENTS.md](AGENTS.md) and this card never overrides it. Facts are marked Current (verified in code or ADRs) or Target (declared by the owner, needs an ADR before implementation).

## Company

Toss Enterprise is an AI-native growth operating system focused on visibility, automation, and revenue growth for businesses.

- **Mission:** help businesses become more visible, more efficient, and more profitable through intelligent systems.
- **Vision:** build Africa's leading AI Growth Operating System.
- **Long-term goal:** transform Toss Enterprise from a service agency into a scalable AI platform company.

Full strategy, market, and positioning are owned by [docs/00-company/vision-and-strategy.md](docs/00-company/vision-and-strategy.md).

## Core products

| Product | Status |
|---|---|
| Visibility OS (visibility scoring and action plans) | Live, scoring MVP |
| Website Audit Engine | Live as scoring v1 inside Visibility OS |
| Business Growth Dashboard | In development (Visibility OS dashboard) |
| Toss AI | Planned |
| CRM & Lead Pipeline | Planned |
| Automation Engine | Planned (n8n, `workflows/`) |
| Toss Academy | Planned |

Product detail is owned by [docs/04-product/](docs/04-product/).

## Architecture

| Layer | Current (verified) | Target (declared, ADR required) |
|---|---|---|
| Frontend | Next.js 16, React 19, Tailwind 4 | same |
| Backend | Node.js / TypeScript | same |
| Database | Supabase Postgres (Prisma in Visibility OS) | same |
| Vector search | none | pgvector |
| Automation | none | n8n |
| Hosting | Vercel, one project per app | same |
| Storage | none | Cloudflare R2 |

Stack facts and their ADRs: [STACK.md](STACK.md).

## AI stack

- **Current:** Anthropic Claude via `@anthropic-ai/sdk` plus Vercel AI SDK ([ADR-0006](docs/01-architecture/decisions/0006-anthropic-claude-for-agents.md)).
- **Target:** multi-model (OpenAI, Claude, Gemini, OpenRouter). Adopting any non-Claude provider supersedes ADR-0006 and needs a new ADR first.

## Engineering principles

Documentation-first, API-first, security-first, modular architecture, no duplicate functionality. Every feature updates documentation; every workflow and every API integration is documented. These bind through [AGENTS.md](AGENTS.md) and [docs/02-engineering/](docs/02-engineering/).

## Current phase

Architecture and Knowledge Brain foundation. Sprint goals:

1. Create the architecture pack (`architecture/`).
2. Create the knowledge brain structure (`knowledge/`, `docs/`).
3. Define AI agents (`agents/`, [docs/03-ai/](docs/03-ai/)).
4. Define workflows (`workflows/`).
5. Prepare the implementation roadmap ([ROADMAP.md](ROADMAP.md)).

The ordered execution plan stays in [docs/implementation-phases.md](docs/implementation-phases.md); what is live right now is in [PROJECT.md](PROJECT.md).

## Definition of done

Code implemented, tests added, documentation updated, [CHANGELOG.md](CHANGELOG.md) updated, architecture still consistent with [docs/01-architecture/](docs/01-architecture/).
