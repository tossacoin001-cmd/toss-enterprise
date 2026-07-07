# 02. Business Operating System

This blueprint owns how the six business engines map onto systems in this repo. The engine model itself is owned by [docs/00-company/vision-and-strategy.md](../docs/00-company/vision-and-strategy.md).

## Engine to system map

| Engine | What it runs | Systems and folders | Status |
|---|---|---|---|
| Brand | Positioning, voice, visual identity | `assets/`, [docs/06-brand/](../docs/06-brand/), `apps/website` | Live |
| Growth | Visibility, leads, conversion | `apps/visibility-os`, lead capture (planned), `analytics/` | Live (scoring MVP) |
| Delivery | Client and product delivery | services engine via `apps/website`, `blueprints/`, `templates/` | Live (services) |
| Operations | Deploys, monitoring, SOPs, automation | `workflows/`, `scripts/`, `monitoring/`, `deployment/`, [docs/05-operations/](../docs/05-operations/) | Partial |
| AI Core | Agents, prompts, tools, models | `agents/`, `mcp/`, `prompts/`, [03-ai-organization.md](03-ai-organization.md) | Scaffolds |
| Knowledge Brain | Institutional and machine knowledge | `docs/`, `knowledge/`, [04-knowledge-brain.md](04-knowledge-brain.md) | Live (docs) |

## Operating loop

Growth generates demand, Delivery fulfils it, Operations keeps it running, the AI Core compresses the cost of all three, the Knowledge Brain records how, and Brand makes the results visible. Revenue mapping (services fund products, products generate data, agents compress cost) is owned by the vision doc.

## Open questions

- Which engine owns pricing and billing once Visibility OS paid tiers exist.
- Brand and Operations engine charters are Planned in the vision doc.
