# agents/

Headless AI workers. Agents are plain Node.js packages: invoked (CLI, cron, or queue), do their work, exit. They never serve HTTP to end users and never run their own database migrations.

Every agent is **spec-first**: its contract lives in [docs/03-ai/agents/](../docs/03-ai/agents/) before any code. Rules binding all agents (human-approved outbound, PII minimization, money read-only, attributable runs, token budgets): [docs/03-ai/ai-operating-system.md](../docs/03-ai/ai-operating-system.md).

| Agent | Purpose | Status |
|---|---|---|
| [visibility-agent/](visibility-agent/) | Score businesses, generate action items | Scaffold, spec drafted |
| [audit-agent/](audit-agent/) | Free visibility audits for prospects | Scaffold, spec drafted |
| [sales-agent/](sales-agent/) | Qualify leads, draft replies | Scaffold, spec drafted |

Build order and timing: [docs/implementation-phases.md](../docs/implementation-phases.md).
