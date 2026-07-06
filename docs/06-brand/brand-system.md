# Brand System

This document owns how Toss Enterprise looks, sounds, and writes. It binds the website, Visibility OS, agent-generated copy, and these docs.

## Brand core

- **Promise:** "We make your business impossible to ignore online."
- **Personality:** confident, direct, practical. A sharp operator who delivers, not a corporate vendor. Premium but approachable; we sell outcomes, not jargon.

## Voice and writing rules (binding for humans and AI)

1. Plain language. Short sentences. Say the outcome, then the how.
2. **No em-dashes. Ever.** Use commas, colons, periods, or parentheses. This applies to website copy, product UI, agent output, docs, and commit messages.
3. No hype filler ("cutting-edge", "revolutionary", "unlock"). Claims must be concrete: numbers, names, timeframes.
4. Second person for customers ("your customers can't find you"), first person plural for us ("we build", "we fix").
5. Prices, dates, and commitments are never invented; if unknown, say "confirmed on the call". (Also a hard guardrail for agents, see AIOS.)
6. Nigeria-first without being Nigeria-only: examples and copy default to the local market ("customers searching in Lagos"), but nothing should read as excluding international clients.

## Visual identity

- **Logos:** canonical files live in `assets/branding/` (`logo-full.png`, `logo-mark.png`). The website's `public/` copies derive from these; when the logo changes, `assets/branding/` updates first.
- **Colors and typography:** the de facto system is what `apps/website` implements today (Tailwind 4 theme). Formal token extraction into `packages/ui` happens when Visibility OS UI work makes sharing necessary; until then, the website is the visual reference.

## Asset rules

- Every new brand asset lands in `assets/branding/` with a descriptive kebab-case name.
- Client-facing documents (audits, proposals) carry the logo mark and end with the WhatsApp number and email from `apps/website/lib/config.ts`.

## Open questions

- Formal color palette and font tokens (extract from the live site when `packages/ui` is created).
- Whether client deliverables get a branded PDF template (relevant to the audit agent's output format).
