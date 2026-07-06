# System Overview

This document owns the top-level architecture of Toss Enterprise: what systems exist, how they connect, and the honest current state. Detail lives in the sibling docs; decisions live in [decisions/](decisions/).

## System context

```mermaid
flowchart TB
    subgraph Users
        V[Visitors and leads]
        C[Visibility OS customers]
        O[Operator]
    end

    subgraph Vercel
        W[apps/website\nNext.js 16]
        VOS[apps/visibility-os\nNext.js 16]
    end

    subgraph Agents["agents/ (planned, run as Node processes)"]
        VA[visibility-agent]
        SA[sales-agent]
        AA[audit-agent]
    end

    subgraph External
        SB[(Supabase\nPostgres)]
        PG[(Postgres via Prisma)]
        CL[Clerk auth]
        FW[Flutterwave]
        CA[Calendly]
        WA[WhatsApp]
        AN[Anthropic API]
    end

    V --> W
    C --> VOS
    W --> SB
    W --> FW
    W --> CA
    W --> WA
    VOS --> CL
    VOS --> PG
    CL -- Svix webhook --> VOS
    VA & SA & AA --> AN
    VA --> PG
    O --> Agents
```

## Components

| Component | Package | Status | Doc |
|---|---|---|---|
| Marketing site | `@toss/website` | Live on Vercel | [../04-product/website.md](../04-product/website.md) |
| Visibility OS | `@toss/visibility-os` | In development, Phase 1 deployed | [../04-product/visibility-os.md](../04-product/visibility-os.md) |
| Visibility agent | `@toss/visibility-agent` | Planned (manifest only, no source) | [../03-ai/agents/visibility-agent.md](../03-ai/agents/visibility-agent.md) |
| Sales agent | `@toss/sales-agent` | Planned (manifest only, no source) | [../03-ai/agents/sales-agent.md](../03-ai/agents/sales-agent.md) |
| Audit agent | `@toss/audit-agent` | Planned (manifest only, no source) | [../03-ai/agents/audit-agent.md](../03-ai/agents/audit-agent.md) |
| Shared packages | `packages/*` | Planned, none exist yet | [monorepo.md](monorepo.md) |

## Architectural principles

1. **Apps deploy independently.** One Vercel project per app; no app imports from another app, only from `packages/`.
2. **Agents are headless workers.** They never serve HTTP to end users; they read and write the same databases the apps own, through the owning app's contracts. See [data-architecture.md](data-architecture.md).
3. **Buy over build for undifferentiated parts.** Auth (Clerk), payments (Flutterwave), booking (Calendly), email (Resend planned).
4. **Everything documented.** New components require a row in the table above, a product or agent doc, and an ADR if a technology choice was made.

## Honest current state (as of 2026-07-05, post Phase 0)

- The workspace quality gate is green: `pnpm type-check`, `pnpm lint`, and `pnpm build` pass across all five packages, enforced by CI on every push and PR to `main`.
- `apps/website` is live. `apps/visibility-os` builds and deploys; its Vercel config has a breakage history, so `vercel.json` changes require preview-deploy verification before merge.
- `agents/*` are compiling scaffolds with specs but no implementation (spec-first rule; build order in the phase plan).
- No `packages/*` exist yet (`packages/README.md` documents the plan and triggers).
- Still missing, scheduled in Phase 1 of [../implementation-phases.md](../implementation-phases.md): tests, monitoring, committed Prisma migrations, Zod at the visibility-os API boundary.
