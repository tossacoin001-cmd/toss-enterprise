# Git Workflow

This document owns branching, commits, and review for this repository.

## Branching

- `main` is the production branch. Every push to `main` can deploy. Keep it green.
- Work happens on short-lived branches: `feat/<slug>`, `fix/<slug>`, `docs/<slug>`, `chore/<slug>`.
- The `develop` branch referenced in CI has no deploy target and is not part of the workflow; do not use it (Phase 0 removes it from CI triggers).

## Commits

- Conventional Commits, as the existing history already practices: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `ci:`. Scope with the package where useful: `feat(visibility-os): ...`.
- Commit early and push immediately. Uncommitted work on a single operator's machine is the company's biggest data-loss risk. This is a standing rule, learned the hard way on prior projects.
- A commit is one logical change. Docs affected by the change ride in the same commit.

## Pull requests and review

Current reality: a solo operator pushing to `main` directly is acceptable for docs and low-risk changes. For anything touching payments, auth, webhooks, or deploy config, open a PR even against yourself and let CI pass before merge; these areas have a history of breakage.

AI-assisted changes follow the same rules. The AI must state in the PR or commit body what it changed and which docs it updated.

## Releases

There are no versioned releases; deployment is continuous from `main`. If a change must not deploy yet, it stays on its branch. Feature flags are not used today; introducing them requires an ADR.

## Protected knowledge

- Never force-push `main`.
- Never rewrite published history.
- Secrets committed by accident: rotate immediately (see [../01-architecture/security.md](../01-architecture/security.md)), do not rely on history rewriting.
