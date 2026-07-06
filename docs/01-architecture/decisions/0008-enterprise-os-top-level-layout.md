# ADR-0008: Enterprise OS Top-Level Layout

- **Status:** Accepted
- **Date:** 2026-07-06
- **Deciders:** Owner (tossacoin001@gmail.com)

## Context

The repo began as a two-app monorepo with agents. ADR-0001 and the monorepo doc set a lazy-creation rule: folders like `automation/`, `clients/`, and `templates/` were approved but not created until they had content, because "empty folders are noise".

The company is now operating the repo as a full Enterprise OS: agents, prompts, MCP servers, automation workflows, operational tooling, and planning artifacts all need a home. Under lazy creation, every AI session and every contributor must re-decide where a new artifact goes, which produces inconsistent placement and hidden structure decisions. Doing nothing means operational artifacts keep landing in `docs/` or inside app folders.

## Decision

Adopt the full Enterprise OS top-level layout now, as owner-directed. Every approved folder is created up front with a README that states its scope and links to the owning doc in the Knowledge Brain. The scope README is the folder's minimum content, which replaces the "empty folders are noise" rule.

The approved layout moves to [monorepo.md](../monorepo.md) as before; this ADR records the shift from lazy creation to a full skeleton.

## Alternatives considered

- **Keep lazy creation:** rejected by the owner. The skeleton is the map; AI assistants and contributors need stable placement targets before content exists.
- **Nest everything under `docs/` or a single `ops/` folder:** mixes knowledge (docs) with operational artifacts (code, configs, data) and buries the artifacts.
- **Separate repos per concern:** fragments the single source of truth the whole OS is built on.

## Consequences

- Easier: one obvious home for every artifact; consistent placement across sessions and tools.
- Harder: more top-level surface, and a real risk of duplicate homes for the same fact. Mitigation: each folder README states what does NOT belong there and links to the owning doc. `docs/` remains the only home for decisions, standards, and narrative knowledge.
- `automation/` (planned, never created) is superseded by `workflows/`.
- `clients/` (planned, never created) is dropped from the approved list; client records live under `knowledge/` when they first exist.
- Root gains `PROJECT.md` (at-a-glance current state) and `CHANGELOG.md` (notable changes).
- Follow-up: when `services/` gets its first package, add `services/*` to `pnpm-workspace.yaml` in the same change.
