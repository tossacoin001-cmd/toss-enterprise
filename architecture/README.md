# Architecture

This folder owns the architecture pack: numbered blueprints that map the current system to the target AI Growth Operating System, plus diagram sources. Status: Live.

The division of truth: [docs/01-architecture/](../docs/01-architecture/) owns the verified current state and all decisions (ADRs); this pack owns the target designs. Anything here not marked Live needs an ADR before implementation.

## The pack (read in order)

1. [01-system-overview.md](01-system-overview.md): target topology and evolution path
2. [02-business-os.md](02-business-os.md): six engines mapped to systems
3. [03-ai-organization.md](03-ai-organization.md): agents, models, guardrails
4. [04-knowledge-brain.md](04-knowledge-brain.md): human and machine knowledge layers
5. [05-workflow-engine.md](05-workflow-engine.md): automation design
6. [06-api-architecture.md](06-api-architecture.md): API-first rules and target platform APIs
7. [07-database-architecture.md](07-database-architecture.md): data layer, migrations, target stores
8. [08-security-architecture.md](08-security-architecture.md): current and target controls
9. [09-observability.md](09-observability.md): how we know systems are up and correct
10. [10-deployment-architecture.md](10-deployment-architecture.md): what deploys where
