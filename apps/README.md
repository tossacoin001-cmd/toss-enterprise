# apps/

Deployable user-facing applications. Each app is an independent Next.js project with its own Vercel deployment; apps never import from other apps, only from `packages/` (dependency rules: [docs/01-architecture/monorepo.md](../docs/01-architecture/monorepo.md)).

| App | Package | Status |
|---|---|---|
| [website/](website/) | `@toss/website` | Live |
| [visibility-os/](visibility-os/) | `@toss/visibility-os` | In development |

Adding an app: follow [docs/05-operations/sops/new-app-checklist.md](../docs/05-operations/sops/new-app-checklist.md).
