# ADR-0021: Paystack for Visibility OS subscriptions, and the three packages

- **Status:** Accepted (provider choice for Visibility OS only; the website keeps ADR-0004)
- **Date:** 2026-10-24
- **Deciders:** Yusuf Azeez (founder), Claude Code

## Context

The founder confirmed an entry price of ₦10,000 a month, three packages, and a yearly discount, and asked to start selling. ADR-0004 chose Flutterwave and left Visibility OS subscription billing open. Today Flutterwave has no API keys for us, while the Paystack account has a live key that Closer already uses to create real checkouts (verified 2026-09-27). ADR-0019 built the billing blocks against Flutterwave's event shape.

## Decision

Visibility OS takes payments through Paystack, in naira. Checkout initialises a transaction on our server with the amount taken only from the price list (`lib/billing/plans.ts`) and puts the buyer, package and period in the transaction metadata. Paystack's webhook, signed with HMAC SHA512 over the exact body, is the only thing that switches a package on, and only when the amount and currency equal the price list. Each event is recorded once (provider and event id are unique). A package runs for 30 days (monthly) or 365 days (yearly) and is not renewed automatically: the buyer pays again, and early payments add to the days already paid for. Checkout and the webhook are closed (503) until `PAYSTACK_SECRET_KEY` is set on the Visibility OS project. The Flutterwave webhook route from ADR-0019 is removed; the rest of ADR-0019 stands.

## Alternatives considered

- **Flutterwave:** the ADR-0004 choice, but no keys and a pending activation; revisit for USD or GBP later with its own ADR.
- **Automatic recurring charges (Paystack plans and subscriptions):** better for retention, but more states (failed cards, retries, cancellation) and more trust to earn first. Manual renewal is honest for the first customers and the data model already allows adding it.
- **Trust the browser's amount or the redirect:** rejected; only the signed webhook counts.

## Consequences

- To sell: set `PAYSTACK_SECRET_KEY` on the Visibility OS Vercel project, set the Paystack dashboard webhook URL to `https://<app>/api/webhooks/paystack`, then test one real ₦10,000 payment and refund it.
- Renewal needs a reminder email before a package ends (not built yet).
- Prices are in one file, so a price test is a one-line change, but a change does not affect payments already made.
- The Paystack key must never be printed, logged or committed. It is read only on the server.
