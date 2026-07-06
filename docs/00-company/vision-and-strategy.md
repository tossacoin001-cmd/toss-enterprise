# Vision and Strategy

This document owns what Toss Enterprise is, who it serves, and how it wins.

## Mission

Give growing businesses in Nigeria and West Africa the online visibility, automation, and AI leverage that big companies take for granted, at a price a small business can pay.

## What the company is

Toss Enterprise is an AI-native digital company with three engines:

1. **Services engine** (cash now): marketing automation, website builds, and growth retainers, sold through [apps/website](../../apps/website). Payments via Flutterwave, booking via Calendly, support via WhatsApp.
2. **Product engine** (recurring revenue): Visibility OS, a SaaS that scores a local business's online visibility (Google Business Profile, social presence, website) and turns the gaps into an action plan. See [../04-product/visibility-os.md](../04-product/visibility-os.md).
3. **AI engine** (leverage): internal agents in [agents/](../../agents) that do the repetitive work of engines 1 and 2 (audits, outreach, reporting), so one operator can run like a team. See [../03-ai/ai-operating-system.md](../03-ai/ai-operating-system.md).

The strategy: services fund the products, products generate the data and case studies, agents compress the cost of both.

## Who it serves

- Primary: small and medium local businesses in Nigeria (default market, prices and payment rails reflect this).
- Secondary: diaspora and international clients who want the same delivery quality remotely.

## Positioning

"We make your business impossible to ignore online." Not a generic dev shop: every offer is framed around measurable visibility and revenue outcomes, delivered fast because AI does the heavy lifting.

## Strategic constraints

- Solo-operator company today. Everything must be automatable or documentable; nothing may depend on unwritten knowledge. That is why this repository is the operating system.
- Cash flow first: services revenue is prioritized until Visibility OS reaches sustainable MRR.
- Nigeria-first payment and infrastructure choices (Flutterwave over Stripe) until international demand justifies dual rails. See [ADR-0004](../01-architecture/decisions/0004-flutterwave-for-payments.md).

## Open questions

- Public pricing for Visibility OS tiers (FREE plan exists in schema; paid tiers undefined).
- Which agent ships first as a customer-facing feature versus internal tool.
