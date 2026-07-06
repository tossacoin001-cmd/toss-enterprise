# Agent Registry

Every AI agent in `agents/` has a spec here before it has code. The spec is the contract: purpose, inputs, outputs, tools, guardrails, budget. Rules that apply to all agents live in [../ai-operating-system.md](../ai-operating-system.md).

## Registry

| Agent | Package | Purpose (one line) | Status |
|---|---|---|---|
| [Visibility agent](visibility-agent.md) | `@toss/visibility-agent` | Compute visibility scores and action items for businesses in Visibility OS | Planned, spec drafted, no code |
| [Sales agent](sales-agent.md) | `@toss/sales-agent` | Qualify inbound leads and draft responses for human approval | Planned, spec drafted, no code |
| [Audit agent](audit-agent.md) | `@toss/audit-agent` | Produce the free visibility audit used as the top-of-funnel offer | Planned, spec drafted, no code |

## Spec template

Each agent doc must contain these sections: Purpose, Trigger and cadence, Inputs, Outputs, Tools and data access, Model and budget, Guardrails, Failure behavior, Open questions.

## Build order

Visibility agent first (it is the core of the paid product), audit agent second (reuses the same checks for the funnel), sales agent third. Rationale and timing: [../../implementation-phases.md](../../implementation-phases.md).
