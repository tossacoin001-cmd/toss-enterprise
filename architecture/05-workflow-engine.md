# 05. Workflow Engine

This blueprint owns the automation architecture: how business workflows are triggered, executed, and recorded. Workflow exports live in [workflows/](../workflows/).

## Current state (honest)

There is no automation engine. The only event wiring is the Clerk webhook into Visibility OS (user upsert). Everything else is manual operator work.

## Target design

- **Engine:** n8n (declared target, needs an ADR before adoption; hosting for it is an open question).
- **Definitions:** one folder per workflow under `workflows/`, holding the exported definition plus a short doc: trigger, steps, failure behavior, owner.
- **Event sources:** Clerk webhooks, Flutterwave payment events, website form submissions, agent outputs, schedules.
- **Actions:** platform APIs ([06-api-architecture.md](06-api-architecture.md)), email, WhatsApp, CRM records.

## First workflows (Initial MVP: Automated Follow-Up)

| Workflow | Trigger | Status |
|---|---|---|
| Lead captured, follow-up sequence | Website form / lead capture system | Planned |
| Audit completed, report delivery | Visibility OS audit finishes | Planned |
| Payment received, onboarding kickoff | Flutterwave event | Planned |

## Guardrails

1. Every workflow is documented in its folder before it runs in production (non-negotiable: every workflow must be documented).
2. Outbound messages to real customers keep a human approval gate until an ADR removes it for a named workflow (same rule as agents, [03-ai-organization.md](03-ai-organization.md)).
3. Secrets used by workflows follow [docs/02-engineering/environments-and-secrets.md](../docs/02-engineering/environments-and-secrets.md); nothing is embedded in exports.
