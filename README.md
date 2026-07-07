# Toss Enterprise

## AI Growth Operating System

Toss Enterprise is an AI-native platform that helps businesses:

- Increase visibility
- Generate leads
- Automate operations
- Improve conversions
- Track growth metrics

This repository is the **single source of truth** for the entire Toss Enterprise ecosystem. Code, architecture, business operating system, AI agents, standards, and operations all live here. If a decision is not written down here, it does not exist.

## Business Operating System

Six engines run the company: **Brand**, **Growth**, **Delivery**, **Operations**, **AI Core**, and the **Knowledge Brain**. The engine model is owned by [docs/00-company/vision-and-strategy.md](docs/00-company/vision-and-strategy.md); the Knowledge Brain itself is [docs/](docs/README.md).

## Initial MVP

| Piece | Status |
|---|---|
| Website Audit Tool | Live as scoring v1 inside Visibility OS |
| AI Chat Assistant | Planned (Toss AI) |
| Lead Capture System | Planned |
| CRM Dashboard | Planned |
| Automated Follow-Up | Planned (Automation Engine) |

What is live right now: [PROJECT.md](PROJECT.md). Product detail: [docs/04-product/](docs/04-product/).

## Non-negotiables

No undocumented features. No duplicate logic. No hardcoded secrets. No breaking architecture decisions without documentation. These bind through [AGENTS.md](AGENTS.md), the canonical contract for all work in this repo.

## What lives here

| Path | What it is |
|---|---|
| `apps/website` | Toss Enterprise marketing site (live, Vercel) |
| `apps/visibility-os` | Visibility OS, SaaS that scores and improves local business visibility (live, scoring MVP) |
| `agents/` | Standalone AI agents (visibility, sales, audit) |
| `packages/`, `services/` | Shared code and backend services. Populated when first needed |
| `docs/` | The Knowledge Brain: all architecture, standards, SOPs, and decisions |
| `assets/` | Branding and portfolio assets |
| Everything else | The Enterprise OS skeleton: each folder's README states its scope. Full map: [docs/01-architecture/monorepo.md](docs/01-architecture/monorepo.md) |

## Start here

1. **AI assistants and new contributors:** read [AGENTS.md](AGENTS.md) first, then [AI_CONTEXT.md](AI_CONTEXT.md) for company context.
2. **Documentation map:** [docs/README.md](docs/README.md)
3. **System architecture:** [docs/01-architecture/system-overview.md](docs/01-architecture/system-overview.md)
4. **Execution plan:** [docs/implementation-phases.md](docs/implementation-phases.md)
5. **Milestones:** [CHANGELOG.md](CHANGELOG.md)

## Quickstart

```bash
pnpm install
pnpm --filter @toss/website dev        # marketing site, port 3000
pnpm --filter @toss/visibility-os dev  # Visibility OS, port 3001
```

Package manager is **pnpm only**. See [docs/02-engineering/engineering-standards.md](docs/02-engineering/engineering-standards.md) before writing code.

## Company

- Contact: tossacoin001@gmail.com
- WhatsApp: +234 808 791 9951
- Location: Remote, global. Primary market: Nigeria and West Africa, expanding outward.
