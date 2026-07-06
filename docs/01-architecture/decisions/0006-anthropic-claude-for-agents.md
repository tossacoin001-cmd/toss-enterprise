# ADR-0006: Anthropic Claude + Vercel AI SDK for agents

- **Status:** Accepted (records the dependency choice already in `agents/*/package.json`)
- **Date:** 2026-07-05 (documented retroactively)
- **Deciders:** Founder

## Context

The AI engine of the company (see vision-and-strategy.md) needs a model provider and an application framework for three planned agents: visibility, sales, and audit. The whole company already develops with Claude-based tooling, and agent quality on long-horizon tool-use tasks is the deciding capability.

## Decision

- Model provider: Anthropic Claude via `@anthropic-ai/sdk`.
- Application layer: Vercel AI SDK (`ai` package) for streaming, tool definitions, and provider abstraction.
- Validation: Zod at every agent input and tool boundary.

## Alternatives considered

- **OpenAI:** viable, but standardizing on one provider simplifies keys, billing, and prompt maintenance for a solo operator. Rejected for now; the Vercel AI SDK keeps the switch cheap if needed.
- **LangChain / LlamaIndex:** heavier abstractions than three focused agents need. Rejected.
- **No framework (raw SDK only):** acceptable, but the AI SDK's tool-call plumbing and streaming save real time. Kept as the default.

## Consequences

- Model selection policy, safety rules, and cost controls are owned by [../../03-ai/ai-operating-system.md](../../03-ai/ai-operating-system.md).
- Agents must be written so the provider is swappable (AI SDK provider interface, no raw Anthropic calls outside a single client module).
- API keys are per-environment secrets; agents never run with production keys during development.
