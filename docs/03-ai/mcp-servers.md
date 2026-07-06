# MCP Servers

This document owns the Model Context Protocol strategy: which MCP servers coding assistants and agents may use, and which we might build. Honest current state: **no custom MCP servers exist and none are configured in this repo.**

## Policy for using third-party MCP servers

1. Any MCP server added to a development workflow gets a row in the table below with what it can access and why it is trusted.
2. Servers with write access to production systems (Vercel, databases, payment providers) are not connected to AI tools without an ADR.
3. Credentials given to MCP servers follow the same secret rules as everything else ([../01-architecture/security.md](../01-architecture/security.md)).

## Approved servers

| Server | Access | Purpose | Status |
|---|---|---|---|
| (none yet) | | | |

## Candidate custom servers (build only when the need is proven)

- **toss-knowledge**: read-only server exposing `docs/` search to any AI tool, so assistants outside this repo (for example a chat session) can query the Knowledge Brain. Low effort, high value once docs stabilize.
- **toss-visibility**: expose visibility-check functions (from the shared checks package, see the agent specs) as MCP tools so audits can run from any AI client.
- **toss-bos**: read-only business metrics once instrumentation exists (Phase 2+).

Each of these requires: a spec here first, read-only by default, an ADR for anything beyond read-only.

## Open questions

- Which coding-assistant-side MCP servers (GitHub, Vercel, Supabase official servers) to adopt for daily development. Evaluate during Phase 1 and record decisions in the table above.
