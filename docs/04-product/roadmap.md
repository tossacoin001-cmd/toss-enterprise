# Product Roadmap

This document owns product priorities: what we build next and why. The engineering execution order (including repo hygiene) is [../implementation-phases.md](../implementation-phases.md); this roadmap feeds it.

## Now (current focus)

1. **Repo foundation** (Phase 0/1 of implementation phases): make the monorepo honest (lockfile, scripts, CI) so everything after ships on solid ground.
2. **Visibility OS scoring MVP**: decide the scoring formula, implement the visibility-agent, show real scores to real businesses. This is the single most important product milestone; everything else queues behind it.

## Next

3. **Audit agent as the funnel**: free audit offer on the website feeding qualified leads to WhatsApp/Calendly.
4. **Website measurement**: analytics and SEO pass so marketing spend and content have feedback.
5. **Visibility OS paid tiers**: pricing decision plus Flutterwave subscription rail (needs its own ADR).

## Later (not before the above ship)

- Sales agent on contact-form leads.
- Case study pages; templates/ extraction from delivered client work.
- Client portal or reporting emails (Resend; requires the verified-domain lesson already learned on prior projects).
- MCP knowledge server exposing docs/ to AI tools.

## Explicitly not on the roadmap

- Mobile apps.
- Multi-tenant agency features in Visibility OS before single-business value is proven.
- Any second SaaS before Visibility OS has paying users.

## Rule

New ideas land here first, in "Later", with one line of rationale. Nothing jumps the queue without updating this doc, and the queue only reorders with a written reason (commit message on this file is enough).
