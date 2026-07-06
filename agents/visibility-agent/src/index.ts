/**
 * @toss/visibility-agent: computes visibility scores and action items for
 * businesses in Visibility OS.
 *
 * Scaffold only. The implementation contract is the spec:
 * docs/03-ai/agents/visibility-agent.md
 * Implementation is scheduled in Phase 2 of docs/implementation-phases.md.
 */
export const AGENT_NAME = "@toss/visibility-agent" as const;

process.stderr.write(
  `${AGENT_NAME} is not implemented yet. Read docs/03-ai/agents/visibility-agent.md before implementing.\n`
);
process.exitCode = 1;
