# Toss Enterprise

The operating system of Toss Enterprise: an AI-native company that builds marketing automation, web products, and AI-powered SaaS for growing businesses.

This repository is the **single source of truth** for the company. Code, architecture, business operating system, AI agents, standards, and operations all live here. If a decision is not written down here, it does not exist.

## What lives here

| Path | What it is |
|---|---|
| `apps/website` | Toss Enterprise marketing site (live, Vercel) |
| `apps/visibility-os` | Visibility OS, SaaS that scores and improves local business visibility |
| `agents/` | Standalone AI agents (visibility, sales, audit) |
| `packages/` | Shared code (ui, config, utils). Created when first needed |
| `docs/` | The Knowledge Brain: all architecture, standards, SOPs, and decisions |
| `assets/` | Branding and portfolio assets |

## Start here

1. **AI assistants and new contributors:** read [AGENTS.md](AGENTS.md) first. It is the canonical contract for working in this repo.
2. **Documentation map:** [docs/README.md](docs/README.md)
3. **System architecture:** [docs/01-architecture/system-overview.md](docs/01-architecture/system-overview.md)
4. **Execution plan:** [docs/implementation-phases.md](docs/implementation-phases.md)

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
