# 01. System Overview

This blueprint owns the target system architecture of the AI Growth Operating System. The verified current state is owned by [docs/01-architecture/system-overview.md](../docs/01-architecture/system-overview.md); anything here not marked Live is Target and needs an ADR before implementation.

## Target topology

```mermaid
flowchart TB
    subgraph Surfaces["User surfaces"]
        W[Website\nLive]
        VOS[Visibility OS\nLive, scoring MVP]
        TAI[Toss AI chat\nPlanned]
    end

    subgraph Platform["Platform layer (services/, Target)"]
        API[Platform APIs]
        WF[Workflow engine\nn8n, Target]
    end

    subgraph AICore["AI Core"]
        AG[Agents\nscaffolds]
        MCP[MCP servers\nPlanned]
        PR[Prompt library\nPlanned]
    end

    subgraph Data["Data layer"]
        PG[(Supabase Postgres\nLive)]
        VEC[(pgvector index\nTarget)]
        R2[(Cloudflare R2\nTarget)]
    end

    W --> PG
    VOS --> PG
    TAI --> API
    API --> PG
    WF --> API
    AG --> MCP --> API
    AG --> PR
    AG --> VEC
    VEC --- PG
    API --> R2
```

## Evolution path

| Capability | Current | Target |
|---|---|---|
| User surfaces | Website, Visibility OS (Vercel) | plus Toss AI chat assistant |
| Backend | Route handlers inside each app | plus standalone platform APIs in `services/` |
| Automation | None (Clerk webhook only) | n8n workflow engine, [05-workflow-engine.md](05-workflow-engine.md) |
| Knowledge | `docs/` for humans | plus machine layer with pgvector, [04-knowledge-brain.md](04-knowledge-brain.md) |
| Storage | Postgres only | plus Cloudflare R2 for objects |
| AI models | Anthropic Claude (ADR-0006) | multi-model, needs superseding ADR |

## Rules that do not change

Apps deploy independently; agents are headless; buy over build for undifferentiated parts; everything documented. These are owned by [docs/01-architecture/system-overview.md](../docs/01-architecture/system-overview.md).
