/**
 * How the result page asks "is it done yet?" without hammering the server: quick at first,
 * slower later, paused when the tab is hidden, stopped when the scan ends.
 * Tests: tests/scan-ui/poll-and-typos.test.ts (RL-04).
 */

const SCHEDULE_MS = [800, 1000, 1000, 1500, 1500, 2000, 2000, 3000, 3000, 4000];
const MAX_DELAY_MS = 5000;
export const GIVE_UP_MS = 120_000;

export const pollDelayMs = (attempt: number): number => SCHEDULE_MS[attempt] ?? MAX_DELAY_MS;

export type PollState = { status: "running" | "done" | "incomplete"; elapsedMs: number; hidden: boolean };

export function pollDecision(s: PollState): "stop" | "pause" | "give_up" | "wait" {
  if (s.status !== "running") return "stop";
  if (s.hidden) return "pause";
  if (s.elapsedMs > GIVE_UP_MS) return "give_up";
  return "wait";
}
