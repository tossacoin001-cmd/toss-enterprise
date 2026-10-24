# ADR-0019: Billing building blocks before checkout

- **Status:** Accepted
- **Date:** 2026-10-23
- **Deciders:** Yusuf Azeez (founder), Claude Code

## Context

Visibility OS will need paid plans, but prices, limits and the live provider setup are not confirmed. ADR-0004 keeps Flutterwave as the payment rail; Visibility OS subscription billing was left open. Building checkout now would sell something undefined.

## Decision

Build only the parts that are safe and testable without prices: webhook signature check (`verif-hash`, constant-time), a `BillingEvent` table unique on provider and event id so repeat deliveries change nothing, amount, currency and plan validation against a plan table whose prices are null, a pure subscription state step, and a `Subscription` table feeding `accessFor`. The webhook route returns 503 until `FLUTTERWAVE_WEBHOOK_HASH` is set, and no charge can validate while no price is confirmed. There is no checkout button or page. No provider change is made.

## Alternatives considered

- **Ship checkout with placeholder prices:** sells an undefined product.
- **Switch provider to one with native subscriptions:** needs its own ADR and owner decision.

## Consequences

Turning billing on needs: confirmed prices in `lib/billing/plans.ts`, the webhook URL and hash set in Flutterwave and Vercel, and a checkout that creates references shaped `vos.<userId>.<PLAN>.<nonce>`. The event shape follows Flutterwave's documentation and has not been run against live traffic. Renewal handling for a provider that does not send recurring events is open.
