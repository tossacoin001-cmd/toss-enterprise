# 06. API Architecture

This blueprint owns API design: how systems expose capabilities to each other and, eventually, to customers. Engineering standards are owned by [docs/02-engineering/](../docs/02-engineering/).

## Current state

- APIs are Next.js route handlers inside each app; there is no standalone API service and no public API.
- Visibility OS API routes are Clerk-authenticated (401 unauthenticated), validated with Zod at the boundary, and use Prisma only (raw SQL is banned by AGENTS.md).
- The website talks to Supabase directly via the Supabase client (ADR-0005 split).

## Target design (API-first principle)

| Concern | Rule |
|---|---|
| Placement | Capabilities needed by more than one surface move to a standalone API in `services/` |
| Versioning | Path-versioned, `/v1/...`, no silent breaking changes |
| Auth | Clerk-issued tokens for users; scoped keys for agents and workflows |
| Validation | Zod at every boundary, no unvalidated input reaches business logic |
| Errors | One error shape across all services: machine-readable code, human message, request id |
| Documentation | Every API and every external integration is documented before merge (non-negotiable) |

## Consumers to design for

Toss AI chat assistant, the workflow engine ([05-workflow-engine.md](05-workflow-engine.md)), agents through MCP ([03-ai-organization.md](03-ai-organization.md)), and future CRM dashboard.

## Open questions

- Rate limiting approach (Vercel middleware versus service-level) is undecided.
- Whether the first `services/` API is extracted from Visibility OS routes or built fresh for Toss AI.
