# agents/

Headless AI workers. Agents are plain Node.js packages: invoked (CLI, cron, or queue), do their work, exit. They never serve HTTP to end users and never run their own database migrations.

Every agent is **spec-first**: its contract lives in [docs/03-ai/agents/](../docs/03-ai/agents/) before any code. Rules binding all agents (human-approved outbound, PII minimization, money read-only, attributable runs, token budgets): [docs/03-ai/ai-operating-system.md](../docs/03-ai/ai-operating-system.md). The organization design is [architecture/03-ai-organization.md](../architecture/03-ai-organization.md).

## Product agents (workspace packages, scaffolds)

| Agent | Purpose | Status |
|---|---|---|
| [visibility-agent/](visibility-agent/) | Score businesses, generate action items | Scaffold, spec drafted, Phase 2 |
| [audit-agent/](audit-agent/) | Free visibility audits for prospects | Scaffold, spec drafted, Phase 3 |
| [sales-agent/](sales-agent/) | Qualify leads, draft replies | Scaffold, spec drafted, Phase 4 |

## Role agents (charters only, no packages yet)

| Agent | Mission | Engine |
|---|---|---|
| [ceo-agent/](ceo-agent/) | Strategy decision support, weekly priorities | All (oversight) |
| [coo-agent/](coo-agent/) | Operations oversight, SOP adherence | Operations |
| [cfo-agent/](cfo-agent/) | Finance visibility, read-only money | Operations |
| [cto-agent/](cto-agent/) | Architecture drift and dependency review | AI Core, Operations |
| [marketing-agent/](marketing-agent/) | Brand-voice content drafting | Brand, Growth |
| [research-agent/](research-agent/) | Distilled research into knowledge/12_research | Growth, AI Core |
| [seo-agent/](seo-agent/) | Search visibility (boundary with audit-agent TBD) | Growth |
| [support-agent/](support-agent/) | Support triage and reply drafting | Delivery |
| [automation-agent/](automation-agent/) | Workflow building and repair | Operations |

A charter folder holds only a README; it becomes a workspace package (with `package.json`, `build`/`lint`/`type-check` scripts per the monorepo rule) only when its spec lands and its phase arrives. Build order and timing: [docs/implementation-phases.md](../docs/implementation-phases.md).
