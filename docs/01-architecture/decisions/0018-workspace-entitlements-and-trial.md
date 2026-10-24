# ADR-0018: Workspace entitlements and the seven-day trial

- **Status:** Accepted
- **Date:** 2026-10-23
- **Deciders:** Yusuf Azeez (founder), Claude Code

## Context

The workspace had no single answer to "what may this account do?". Limits were repeated in routes and pages, and nothing recorded a trial. Paid plans, prices and the payment provider are not confirmed, so locking people out after a trial would leave them with no way to continue.

## Decision

One pure function, `accessFor`, in `lib/billing/entitlements.ts`, turns an account's facts into a state, a plain label, the exact end date (Lagos time) and what it may do. The server enforces it through `requireMutationAccess` on every route that changes data. A seven-day trial starts once, at the account's first workspace use, with one conditional update so it never restarts and cannot double-start. It needs no card. After it ends, viewing and export always work; only changes can be paused. Pausing is off unless `TRIAL_ENFORCEMENT=on`, so nobody is locked out while nothing is for sale. Existing accounts start their trial at their first visit after release; nobody is expired retroactively. The business limit (3) is checked inside a serializable transaction with one retry.

## Alternatives considered

- **Enforce from day one:** strands users with no way to pay.
- **Start trials at sign-up from the Clerk webhook:** webhook delivery lags and is not configured in production yet.
- **Raw SQL advisory locks for the limit:** AGENTS.md forbids raw SQL; the serializable transaction does the job.

## Consequences

Turning enforcement on is one environment change once prices and a provider are confirmed. The subscription facts input is ready for ADR-0019 (billing building blocks). Owner decisions remain: prices, limits, and the date to switch enforcement on.
