import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (p: string) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));

// Regression: @toss/email exposes a built `dist` (gitignored), but the Vercel
// build command only built the app itself, so every Vercel build failed with
// "Can't resolve '@toss/email'" while local builds passed because a stale
// dist folder existed. `pnpm --filter "<app>..."` builds the app's workspace
// dependencies first.
describe("vercel.json build command", () => {
  const pkg = read("../package.json");
  const vercel = read("../vercel.json");
  const workspaceDeps = Object.entries({ ...pkg.dependencies, ...pkg.devDependencies })
    .filter(([, version]) => String(version).startsWith("workspace:"))
    .map(([name]) => name);

  it("depends on at least one workspace package (so this guard is meaningful)", () => {
    expect(workspaceDeps.length).toBeGreaterThan(0);
  });

  it("builds workspace dependencies before the app", () => {
    expect(vercel.buildCommand).toContain(`--filter "${pkg.name}..." build`);
  });

  it("still runs migrations before building", () => {
    const command: string = vercel.buildCommand;
    expect(command.indexOf("prisma migrate deploy")).toBeGreaterThan(-1);
    expect(command.indexOf("prisma migrate deploy")).toBeLessThan(command.indexOf("build", command.indexOf("migrate deploy") + 20));
  });
});
