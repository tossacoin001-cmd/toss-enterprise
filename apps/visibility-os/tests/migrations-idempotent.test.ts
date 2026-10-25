import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Production's database had a column (User.trialEndsAt) that no migration ever created, so the trial migration
// failed there and blocked the whole deploy on 2026-10-24. Migrations from the market upgrade onward must be
// safe to run on a database that already has some of what they add.

const FOLDERS = [
  "20261023010000_user_trial",
  "20261023020000_billing_foundations",
  "20261024000000_weekly_run_reliability",
  "20261024010000_subscription_interval",
  "20261025000000_user_plan_text",
];
const sql = (f: string) => readFileSync(new URL(`../prisma/migrations/${f}/migration.sql`, import.meta.url), "utf8");

describe.each(FOLDERS)("%s", (folder) => {
  const text = sql(folder);

  it("adds columns only if they are missing", () => {
    const adds = text.match(/ADD COLUMN\s+(?!IF NOT EXISTS)/gi) ?? [];
    expect(adds).toEqual([]);
  });

  it("creates tables and indexes only if they are missing", () => {
    expect(text.match(/CREATE TABLE\s+(?!IF NOT EXISTS)/gi) ?? []).toEqual([]);
    expect(text.match(/CREATE (UNIQUE )?INDEX\s+(?!IF NOT EXISTS)/gi) ?? []).toEqual([]);
  });

  it("guards any foreign key so a second run does not fail", () => {
    for (const m of text.matchAll(/ADD CONSTRAINT\s+"([^"]+)"/g)) {
      expect(text, `constraint ${m[1]} must be inside a guard`).toMatch(new RegExp(`pg_constraint[\\s\\S]*${m[1]}|${m[1]}[\\s\\S]*pg_constraint`));
    }
  });

  it("does not depend on a database type, because production does not have them all (it has no \"Plan\" type)", () => {
    expect(text).not.toMatch(/"(Plan|Priority|ActionStatus)"\s+(NOT NULL|NULL|DEFAULT|,|\))/);
    expect(text).not.toMatch(/CREATE TYPE|::"(Plan|Priority|ActionStatus)"/);
  });

  it("drops nothing", () => {
    expect(text).not.toMatch(/DROP\s+(TABLE|COLUMN|INDEX)/i);
  });
});
