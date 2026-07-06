# 03. AI Organization

This blueprint owns the design of the AI organization: which AI workers exist, what they may do, and how they are governed. Day-to-day AI policy is owned by [docs/03-ai/ai-operating-system.md](../docs/03-ai/ai-operating-system.md).

## Roster

| Worker | Role | Status |
|---|---|---|
| `agents/visibility-agent` | Runs visibility audits and scoring enrichment | Scaffold, spec in [docs/03-ai/agents/](../docs/03-ai/agents/) |
| `agents/sales-agent` | Outreach and follow-up drafting | Scaffold |
| `agents/audit-agent` | Website and repo audits | Scaffold |
| Toss AI chat assistant | Customer-facing assistant (Initial MVP) | Planned |
| Coding assistants (Claude Code and others) | Build and maintain the repo under [AGENTS.md](../AGENTS.md) | Live |

## Model policy

- **Current:** Anthropic Claude via `@anthropic-ai/sdk` plus Vercel AI SDK ([ADR-0006](../docs/01-architecture/decisions/0006-anthropic-claude-for-agents.md)).
- **Target:** multi-model routing (OpenAI, Claude, Gemini via OpenRouter). Requires an ADR superseding ADR-0006 before any non-Claude provider is wired in.

## Capabilities and guardrails

1. Agents are headless: no HTTP to end users, data access only through the owning app's contracts.
2. Tools reach agents through MCP servers in `mcp/` (policy: [docs/03-ai/mcp-servers.md](../docs/03-ai/mcp-servers.md)).
3. Prompts shared by more than one worker live in `prompts/` (policy: [docs/03-ai/prompt-library.md](../docs/03-ai/prompt-library.md)).
4. Knowledge reaches agents through the machine layer in [04-knowledge-brain.md](04-knowledge-brain.md), never by scraping `docs/` ad hoc.
5. Human in the loop: outbound actions (emails, messages, payments) require operator approval until an ADR grants an agent autonomy for a named action.

## Open questions

- Which agent ships first as a customer-facing feature (also open in the vision doc).
- Autonomy levels per agent action are undefined until the first agent has runtime behavior.
