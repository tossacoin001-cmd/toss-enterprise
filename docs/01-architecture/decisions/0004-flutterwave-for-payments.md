# ADR-0004: Flutterwave for payments

- **Status:** Accepted (records the live implementation; commit "Route pricing tier buttons to Flutterwave, update payment copy to Flutterwave-only")
- **Date:** 2026-07-05 (documented retroactively)
- **Deciders:** Founder

## Context

An earlier plan named Stripe. Stripe's availability and payout story for a Nigeria-based business is poor, while the primary market pays in Naira with local cards, bank transfer, and USSD. The website sells services and digital products and needs a payment link that just works for Nigerian customers.

## Decision

Flutterwave is the payment rail. The site links to a fixed Flutterwave payment page (`NEXT_PUBLIC_FLUTTERWAVE_URL`, default `https://flutterwave.com/pay/toss-enterprise`). No card data ever touches our infrastructure.

## Alternatives considered

- **Stripe:** not practically available for NG merchant payouts; would force a foreign entity. Deferred, not rejected forever: international expansion may justify dual rails later, which requires a new ADR.
- **Paystack:** viable NG alternative; Flutterwave chosen and already live, no reason to churn.
- **Manual bank transfer:** no audit trail, no automation hooks. Rejected as the primary rail (may still happen ad hoc, but the BOS rule is Flutterwave links only).

## Consequences

- Revenue data lives in the Flutterwave dashboard, outside the repo's systems; BOS metrics require manual export until an integration exists.
- Visibility OS subscription billing is unsolved: Flutterwave subscriptions or payment plans must be evaluated when paid tiers launch (new ADR required).
