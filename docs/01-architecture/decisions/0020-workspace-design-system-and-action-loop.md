# ADR-0020: Workspace design system and the action loop

- **Status:** Accepted
- **Date:** 2026-10-24
- **Deciders:** Yusuf Azeez (founder), Claude Code

## Context

The signed-in app used inline dark colours repeated in every file, dead navigation ("soon"), an invented upgrade box, a score that showed 0 when nothing had been checked, and action items that were deleted and recreated on every rescan, losing the owner's work. The public pages have their own look and are not part of this change.

## Decision

- Signed-in screens use one scoped token set in `app/workspace.css` (`.ws-root`): ivory page, white surfaces, deep forest navigation, a small gold accent. Contrast is enforced by `tests/workspace/design-tokens.test.ts` (WCAG AA). Shared pieces live in `components/ui` (Button, StatusBadge, Notice, EmptyState, PageHeader). Controls are at least 44px tall with a visible focus. Public pages keep their current look.
- A score is described by one function, `describeScore`, that separates not checked, partly checked, stale (10 days) and checked. A part that was not measured is never shown as 0.
- Each action carries a stable `key` (the finding it came from). A rescan reconciles by key: pending items that are fixed disappear, in-progress items that are fixed become done, done items that still fail are flagged but never rewritten, and notes are kept. The server checks ownership on every change.
- A free check becomes the account's by one conditional update, so claiming is safe to repeat and cannot be taken by someone else.
- Web fonts are not changed in this release. Moving to `next/font` is deferred because it needs a network fetch at build time; recorded as follow-up.

## Alternatives considered

- **Restyle with the old inline colours:** keeps the duplication and cannot be tested for contrast.
- **Recreate actions on each rescan:** simplest, loses notes and progress.

## Consequences

One place to change the look. Existing action rows without a key are replaced only while still pending. The `framer-motion` dependency is no longer used by the workspace and can be removed in a follow-up once the public pages are checked.
