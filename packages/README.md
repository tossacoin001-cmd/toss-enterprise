# packages/

Shared code, extracted at the second occurrence of duplicated logic, not the third (rules:
[docs/01-architecture/monorepo.md](../docs/01-architecture/monorepo.md)).

| Package | Contents | Status |
|---|---|---|
| `@toss/email` | Resend client and `sendEmail` helper | Live (extracted from `apps/website/lib/resend.ts` when `apps/visibility-os`'s weekly digest became its second occurrence) |
| `@toss/config` | Shared tsconfig and ESLint presets | Planned, Phase 1 of [docs/implementation-phases.md](../docs/implementation-phases.md) |
| `@toss/core` | Framework-free types and utilities | Planned, first shared runtime code beyond email |
| `@toss/ui` | Shared React components and brand tokens | Planned, when Visibility OS UI work needs the website's patterns |

Dependency rule: packages may depend only on other packages and npm, never on apps or agents.
