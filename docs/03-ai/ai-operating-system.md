# AI Operating System (AIOS)

This document owns how Toss Enterprise uses AI: as a workforce (agents), as a development multiplier (coding assistants), and as product features. The business processes AI automates are defined by the BOS ([../00-company/business-operating-system.md](../00-company/business-operating-system.md)); AI executes them, it never redefines them.

## The three roles of AI here

1. **AI as workforce**: the packages in `agents/` do repeatable operational work (audits, outreach, scoring). Registry and specs: [agents/README.md](agents/README.md).
2. **AI as builder**: coding assistants (Claude Code and others) build and maintain this repo under the contract in [/AGENTS.md](../../AGENTS.md).
3. **AI as product**: Visibility OS features powered by agents (score explanations, action plans).

## Model policy

- Provider: Anthropic Claude, per [ADR-0006](../01-architecture/decisions/0006-anthropic-claude-for-agents.md), through the Vercel AI SDK so the provider stays swappable.
- Default model choices are made per agent and recorded in that agent's spec, with the reasoning-cost tradeoff stated. Cheap models for classification and drafting, stronger models for judgment and customer-visible output.
- Model IDs are configuration, never hardcoded in business logic.

## Non-negotiable guardrails

1. **Human approves outbound.** No agent sends a message to a customer or lead (email, WhatsApp, anything) without explicit human approval, until an ADR relaxes this per agent with evidence.
2. **PII minimization.** Agents send third-party APIs only the fields the task needs. Customer data never goes into training-enabled endpoints. See [../01-architecture/security.md](../01-architecture/security.md).
3. **Money is read-only.** No agent creates payment links, changes prices, or touches payment configuration.
4. **Attributable actions.** Every agent write to a database is attributable: which agent, which run, when. Design this into the first agent, not retrofitted.
5. **Budgets.** Each agent has a per-run and per-month token budget in its spec. A runaway loop must hit a hard stop, not a credit card limit.

## Engineering standards for agents

- Plain Node.js ESM packages, `tsx` in dev, `tsc` to `dist/`. No HTTP servers; agents are invoked (CLI, cron, or queue), do their work, and exit.
- Zod-validated inputs, structured JSON logging, idempotent runs (re-running an agent on the same input must be safe).
- Prompts live in the repo per [prompt-library.md](prompt-library.md), never inline strings scattered through code.
- Each agent has a spec in `docs/03-ai/agents/` before implementation starts. Spec first, code second, same rule as the rest of the company.

## Coding assistant rules (summary, canonical in /AGENTS.md)

Read the docs before changing code, document decisions as ADRs, update docs in the same commit, no duplicate knowledge, no hidden knowledge, pnpm only, no secrets in the repo.
