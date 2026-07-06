# Services

This folder owns deployable backend services that are not user-facing Next.js apps: APIs, workers, schedulers. One package per service, named `@toss/<name>`. Status: Planned.

Services follow the same dependency rules as apps ([monorepo.md](../docs/01-architecture/monorepo.md)): they may depend on `packages/*` and external npm packages, never on apps or agents. When the first service lands, add `services/*` to `pnpm-workspace.yaml` in the same change (ADR-0008).
