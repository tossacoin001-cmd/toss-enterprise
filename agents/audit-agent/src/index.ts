/**
 * @toss/audit-agent: produces the free visibility audit used as the
 * top-of-funnel offer. Every report is human-reviewed before it reaches a
 * prospect (AIOS rule).
 *
 * Scaffold only. The implementation contract is the spec:
 * docs/03-ai/agents/audit-agent.md
 * Implementation is scheduled in Phase 3 of docs/implementation-phases.md.
 */
export const AGENT_NAME = "@toss/audit-agent" as const;

process.stderr.write(
  `${AGENT_NAME} is not implemented yet. Read docs/03-ai/agents/audit-agent.md before implementing.\n`
);
process.exitCode = 1;
