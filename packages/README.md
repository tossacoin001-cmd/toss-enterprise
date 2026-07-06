# packages/

Shared code. Empty by design until the first real need: code duplicated in two places must be extracted here at the second occurrence, not the third (rules: [docs/01-architecture/monorepo.md](../docs/01-architecture/monorepo.md)).

Planned packages, created in this order as needs arise:

| Package | Contents | Trigger |
|---|---|---|
| `@toss/config` | Shared tsconfig and ESLint presets | Phase 1 of [docs/implementation-phases.md](../docs/implementation-phases.md) |
| `@toss/core` | Framework-free types and utilities | First shared runtime code |
| `@toss/ui` | Shared React components and brand tokens | When Visibility OS UI work needs the website's patterns |

Dependency rule: packages may depend only on other packages and npm, never on apps or agents.
