# Knowledge

This folder owns the machine-usable knowledge base: curated, structured content that agents consume, organized by business domain. Status: taxonomy live, sections empty.

Human knowledge (decisions, standards, SOPs, narrative) lives in [docs/](../docs/README.md), the Knowledge Brain. Entries here cite their owning doc or origin; they never fork it. The layer design and retrieval flow: [architecture/04-knowledge-brain.md](../architecture/04-knowledge-brain.md).

## Taxonomy

| Section | Owns |
|---|---|
| [00_governance/](00_governance/) | Rules of this knowledge base |
| [01_company/](01_company/) | Company facts (cites docs/00-company) |
| [02_brand/](02_brand/) | Voice fragments, approved copy (cites docs/06-brand) |
| [03_products/](03_products/) | Product facts (cites docs/04-product) |
| [04_services/](04_services/) | Service catalog and delivery scopes |
| [05_sales/](05_sales/) | Playbooks, sequences, qualification |
| [06_marketing/](06_marketing/) | Channels, campaigns, content angles |
| [07_clients/](07_clients/) | Client records, one folder per client |
| [08_operations/](08_operations/) | Runbook digests (cites docs/05-operations) |
| [09_ai/](09_ai/) | Model notes, costs, eval results |
| [10_workflows/](10_workflows/) | Context about workflows (definitions in workflows/) |
| [11_technology/](11_technology/) | Stack digests, integration facts |
| [12_research/](12_research/) | Distilled findings (raw work in research/) |
| [13_templates/](13_templates/) | Knowledge-entry skeletons |
| [14_analytics/](14_analytics/) | Metric definitions, KPI dictionary |
| [15_legal/](15_legal/) | Terms, policies, contracts |
| [16_finance/](16_finance/) | Pricing economics, budgets, cost references |
| [17_learning/](17_learning/) | Lessons learned, postmortem distillations |
| [18_archive/](18_archive/) | Superseded knowledge, never cited as current |

Retrieval plumbing at this level: [sources.md](sources.md) (curated source list) and [corpora/](corpora/) (machine bundles built from the sections).
