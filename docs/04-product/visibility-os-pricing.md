# Visibility OS pricing and packages

Decided by the founder on 2026-10-24: the entry price is **₦10,000 a month**, there are **three packages**, features that are "coming soon" because they cost money to run move to the higher packages, and paying for a year earns a discount. This page records what was built from that and which numbers are my proposals for the founder to confirm.

## Packages

| | Starter | Growth | Agency |
|---|---|---|---|
| Monthly | **₦10,000** (founder) | ₦25,000 (proposed) | ₦60,000 (proposed) |
| Yearly (2 months free, about 17% off) | ₦100,000 | ₦250,000 | ₦600,000 |
| Businesses | 1 | 3 | 10 |
| Website and social readiness check, action plan, progress, weekly email, report history, data download | Yes | Yes | Yes |
| Connect your Google listing (rating and reviews in your score) | No | **Yes** | Yes |
| Coming soon, in the package from the day it opens | | Review tracking and reminders, competitor comparison | White-label reports, team access, WhatsApp alerts |

- The 7-day free trial needs no card and works like Growth (3 businesses, Google connection), so people try the best version first.
- Google connection is the one working feature that costs us money per use (Google Places), so it is the first reason to move up from Starter.
- "Coming soon" items are never sold as working. The page says plainly that they are not available yet and that the package price does not rise when they open.
- Yearly is ten months for twelve. It is the only discount: simple to explain and good for cash flow.
- Prices live in one file, `lib/billing/plans.ts`. Changing a number is a one-line change plus its test.

## Paying

Paystack is the rail (see [ADR-0021](../01-architecture/decisions/0021-paystack-for-visibility-os-subscriptions.md)): it is the only payment rail with a verified live key today. Checkout stays closed (a plain "not open yet" message) until `PAYSTACK_SECRET_KEY` is set on the Visibility OS project. The webhook verifies Paystack's signature, records each payment once, and only activates a plan when the amount and currency match the price list exactly.

## Not decided

- Higher-tier prices (₦25,000 and ₦60,000) and the business limits (1, 3, 10).
- Whether to switch on `TRIAL_ENFORCEMENT` at launch, which pauses changes for accounts whose trial ended without paying. Recommended: yes, on the day payments are confirmed working.
- Refund and cancellation wording in the terms (needs the same legal read as the privacy notice).
