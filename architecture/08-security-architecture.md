# 08. Security Architecture

This blueprint owns the security architecture: the controls that exist, the controls that are coming, and the rules that never bend. Secrets handling is owned by [docs/02-engineering/environments-and-secrets.md](../docs/02-engineering/environments-and-secrets.md).

## Never bends (owned by AGENTS.md)

No secrets in the repo, ever; env vars only, every variable in `.env.example` and documented. No raw SQL. TypeScript strict. All changes through PRs to `main`.

## Current controls

| Control | Where |
|---|---|
| Authentication | Clerk on Visibility OS (ADR-0003); auth routes pinned in code, immune to corrupted env values |
| Input validation | Zod at the Visibility OS API boundary |
| SSRF guard | Website fetch in scoring v1 validates targets before fetching |
| Access to prod | No direct prod database access from developer shells; pipeline-applied migrations are the sanctioned path |
| Payments | Flutterwave hosted payment links; no card data touches our code (ADR-0004) |

## Target controls

- `security/` gains policy as code: scanning configuration (dependencies, secrets), threat models per product, security checklists for releases.
- Supabase Row Level Security review once any client-side data access grows beyond the website's current usage.
- Secret rotation schedule, documented per secret.
- Audit logging for agent and workflow actions that touch customer data ([03-ai-organization.md](03-ai-organization.md) guardrails).

## Open questions

- Webhook signature verification coverage: `CLERK_WEBHOOK_SECRET` is not yet set in prod (lazy user-upsert covers the gap); close when webhooks carry real writes.
