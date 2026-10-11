import { execFileSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
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
    expect(command.indexOf("prisma migrate deploy")).toBeLessThan(command.indexOf("--filter", command.indexOf("migrate deploy")));
  });
});

// Previews of every branch share the production database (Vercel's POSTGRES_*
// variables apply to Production, Preview and Development alike), so a preview
// build that migrates changes production before anything is merged. This test
// RUNS the real build command with a stand-in `pnpm` and records what it did.
describe("vercel.json build command: migrations run only for production builds", { timeout: 60_000 }, () => {
  const command: string = read("../vercel.json").buildCommand;

  function run(vercelEnv: string | undefined): string[] {
    const root = mkdtempSync(join(tmpdir(), "vercel-sim-"));
    const bin = join(root, "bin");
    const appDir = join(root, "apps", "visibility-os");
    mkdirSync(bin, { recursive: true });
    mkdirSync(appDir, { recursive: true });
    const log = join(root, "calls.log").split("\\").join("/");
    writeFileSync(join(bin, "pnpm"), ["#!/bin/sh", `echo "$*" >> "${log}"`, ""].join("\n"));
    chmodSync(join(bin, "pnpm"), 0o755);
    const sep = process.platform === "win32" ? ";" : ":";
    const env: NodeJS.ProcessEnv = { ...process.env, PATH: `${bin}${sep}${process.env.PATH}` };
    delete env.VERCEL_ENV;
    if (vercelEnv !== undefined) env.VERCEL_ENV = vercelEnv;
    execFileSync("sh", ["-c", command], { cwd: appDir, env, stdio: "pipe" });
    try {
      return readFileSync(log, "utf8").split("\n").filter(Boolean);
    } catch {
      return [];
    }
  }
  const migrated = (calls: string[]) => calls.some((c) => /prisma migrate deploy/.test(c));
  const built = (calls: string[]) => calls.some((c) => c.includes("@toss/visibility-os...") && /\bbuild\b/.test(c));

  it("production: migrates, then builds", () => {
    const calls = run("production");
    expect(migrated(calls)).toBe(true);
    expect(built(calls)).toBe(true);
    expect(calls.findIndex((c) => /migrate deploy/.test(c))).toBeLessThan(calls.findIndex((c) => c.includes("@toss/visibility-os...")));
  });

  it.each(["preview", "development"])("%s: builds but never touches the shared database", (env) => {
    const calls = run(env);
    expect(migrated(calls)).toBe(false);
    expect(built(calls)).toBe(true);
  });

  it("an unknown or missing environment is treated as not production (fail safe)", () => {
    for (const env of [undefined, "", "Production", "prod", "staging"]) {
      const calls = run(env);
      expect(migrated(calls), String(env)).toBe(false);
      expect(built(calls), String(env)).toBe(true);
    }
  });
});
