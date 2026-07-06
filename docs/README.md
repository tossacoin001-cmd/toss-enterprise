# The Knowledge Brain

`docs/` is the single source of truth for Toss Enterprise. Every decision, standard, process, and piece of institutional knowledge lives here. If it is not written here, it is not decided.

## Map

| Section | Owns | Start with |
|---|---|---|
| [00-company/](00-company/) | Vision, strategy, Business Operating System | [vision-and-strategy.md](00-company/vision-and-strategy.md) |
| [01-architecture/](01-architecture/) | System design, monorepo, data, infra, security, ADRs | [system-overview.md](01-architecture/system-overview.md) |
| [02-engineering/](02-engineering/) | Code standards, git, testing, CI/CD, environments | [engineering-standards.md](02-engineering/engineering-standards.md) |
| [03-ai/](03-ai/) | AI Operating System, agents, prompts, MCP servers | [ai-operating-system.md](03-ai/ai-operating-system.md) |
| [04-product/](04-product/) | Product specs and roadmap | [portfolio.md](04-product/portfolio.md) |
| [05-operations/](05-operations/) | Deployment, monitoring, incidents, SOPs | [deployment.md](05-operations/deployment.md) |
| [06-brand/](06-brand/) | Brand system, voice, writing rules | [brand-system.md](06-brand/brand-system.md) |
| [implementation-phases.md](implementation-phases.md) | The ordered execution plan for everything above | itself |
| [audits/](audits/) | Point-in-time repository audits (findings only; actions go to the phases doc) | [2026-07-05-repository-audit.md](audits/2026-07-05-repository-audit.md) |

## Rules of the Brain

1. **One home per fact.** Each piece of knowledge has exactly one owning document. Other docs link to it, never restate it.
2. **Decisions get ADRs.** Anything with alternatives that were rejected goes in [01-architecture/decisions/](01-architecture/decisions/). Docs describe the current state; ADRs describe why.
3. **Docs ship with the change.** A PR that makes a doc stale must update that doc.
4. **Current state is marked honestly.** Docs distinguish "Current" from "Target". Aspirations are never written as if they exist.
5. **Open questions are recorded.** Unresolved items live under an "Open questions" heading in the owning doc, not in someone's head.
6. **Writing style** follows [06-brand/brand-system.md](06-brand/brand-system.md): plain language, short sentences, no em-dashes.

## Document conventions

- Markdown only. Mermaid for diagrams (GitHub renders them).
- File names: kebab-case. Section folders are numbered to force reading order.
- Every doc starts with one sentence saying what it owns.
- Status labels where relevant: `Live`, `In development`, `Planned`, `Deprecated`.
