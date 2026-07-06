# ADR-0003: Clerk for Visibility OS auth

- **Status:** Accepted (records the implementation shipped in the Visibility OS Phase 1 bootstrap)
- **Date:** 2026-07-05 (documented retroactively)
- **Deciders:** Founder

## Context

An earlier plan (old CLAUDE.md) named NextAuth v5 as the auth layer. When Visibility OS Phase 1 was built, Clerk was used instead: it ships sign-in/sign-up UI, session management, and webhooks out of the box, which matters when one person builds the whole product. This ADR resolves the contradiction in favor of what is actually deployed.

## Decision

Clerk is the identity provider for Visibility OS. Users are mirrored into the app's own `User` table via Clerk webhooks (Svix-verified) so the product owns its user data and can join it to businesses and scores.

## Alternatives considered

- **NextAuth v5:** more control, no per-MAU cost, but requires building UI, email flows, and session edge cases by hand. Rejected for speed.
- **Supabase Auth:** would couple Visibility OS to Supabase; the app's data layer is Prisma-first. Rejected.

## Consequences

- Free tier limits accepted for now; per-MAU pricing must be revisited before serious scale (record in a new ADR when it happens).
- The Clerk webhook handler is security-critical: Svix signature verification is a launch blocker (see security.md).
- Any future app needing auth should default to Clerk for consistency unless an ADR says otherwise.
