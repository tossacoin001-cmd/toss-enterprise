# Audit Agent

- **Package:** `@toss/audit-agent`
- **Status:** Planned. Manifest exists, no source. This spec is the contract for implementation.

## Purpose

Produce the free "visibility audit" used as the top-of-funnel offer: a prospect gives a business name and website, the agent returns a short, shareable report showing what is broken and what Toss Enterprise would fix. It is the marketing face of the same checks the visibility agent runs.

## Trigger and cadence

Manual or form-triggered, one-off per prospect. No schedule.

## Inputs

Business name, optional website URL, optional Google Business link, optional Instagram handle. Zod-validated; the agent works with whatever subset it gets.

## Outputs

- A human-readable audit report (Markdown first; branded PDF later): findings by category (Google, social, website), severity, and plain-language impact ("customers searching 'X in Lagos' cannot find you").
- A closing recommendation that maps findings to the relevant Toss Enterprise service.
- A copy the operator can paste into WhatsApp or email after review.

## Tools and data access

Same external checks as the visibility agent (shared check functions must live in a common package per the second-occurrence rule; expected home: `packages/core` or a dedicated `packages/visibility-checks`). No database writes except its own run log; audits for prospects do not create Visibility OS records.

## Model and budget

Report prose is customer-visible: stronger Claude tier for the write-up, deterministic code for the checks. Hard per-run cap since this is a free offer; the audit must cost cents, not dollars.

## Guardrails

- Reports state only verifiable findings; no invented metrics, no fear-mongering claims the checks did not produce.
- Human reviews every report before it reaches a prospect (standing AIOS rule).
- Prospect data is a lead, not a customer record: it stays out of Visibility OS.

## Failure behavior

Partial data produces a partial report clearly labeled as such. A failed run tells the operator; the prospect never sees an error artifact.

## Open questions

- Report delivery format at launch: Markdown-to-WhatsApp text vs hosted page vs PDF.
- Whether audit requests come from a public website form (spam control needed) or operator-initiated only.
