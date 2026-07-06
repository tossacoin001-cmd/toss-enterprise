/**
 * @toss/sales-agent: qualifies inbound leads and drafts replies for human
 * approval. Drafts only; this agent never sends anything (AIOS rule).
 *
 * Scaffold only. The implementation contract is the spec:
 * docs/03-ai/agents/sales-agent.md
 * Implementation is scheduled in Phase 4 of docs/implementation-phases.md.
 */
export const AGENT_NAME = "@toss/sales-agent" as const;

process.stderr.write(
  `${AGENT_NAME} is not implemented yet. Read docs/03-ai/agents/sales-agent.md before implementing.\n`
);
process.exitCode = 1;
