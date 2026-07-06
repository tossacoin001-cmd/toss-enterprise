# Sales Agent

- **Package:** `@toss/sales-agent`
- **Status:** Planned. Manifest exists, no source. This spec is the contract for implementation.

## Purpose

Turn inbound leads (contact form, WhatsApp transcripts pasted by the operator) into qualified, prioritized opportunities with drafted replies, so the operator spends time only on leads worth closing. Owns step 2 (Qualify) of the client lifecycle in the BOS.

## Trigger and cadence

- New website contact form submission (from the Supabase store).
- Manual invocation with a pasted conversation.

## Inputs

Lead payload: name, contact channel, message text, source. Zod-validated.

## Outputs

- A qualification: budget signal, scope guess, service fit (mapped to the website's actual offerings), urgency, and a priority tier.
- A drafted first reply in brand voice ([../../06-brand/brand-system.md](../../06-brand/brand-system.md)), ready for human editing.
- A recommended next step: Calendly link, Flutterwave proposal, or polite decline.

## Tools and data access

- Read: website Supabase contact submissions, the services and pricing content (from the repo, not scraped).
- Write: its own lead-tracking store (location decided at implementation; candidate is a table in the website's Supabase). Never writes to Visibility OS data.

## Model and budget

Customer-visible drafting quality matters: use a stronger Claude tier for reply drafts, a cheap tier for classification. Per-run and monthly caps in config.

## Guardrails

- **Drafts only. The agent never sends anything.** Human approval on every outbound message is a standing AIOS rule; any relaxation needs an ADR with evidence.
- Never invents prices, discounts, or delivery dates. Pricing comes from the website content; anything else is "to be confirmed on the call".
- Lead PII stays in the lead store; prompts include only what qualification needs.

## Failure behavior

On any failure, the lead is flagged "needs manual review" with the raw payload intact. A lead must never be silently dropped.

## Open questions

- Lead store location and shape.
- Whether WhatsApp ingestion can be automated (Business API) or stays manual paste.
