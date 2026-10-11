import { readdirSync, readFileSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { checkMigration, destructiveFindings } from "./helpers/migration-safety";

const dir = new URL("../prisma/migrations/", import.meta.url);

describe("migration safety rules (the checker itself)", () => {
  it.each([
    ["DROP TABLE \"User\";", "drops an object"],
    ["ALTER TABLE \"User\" DROP COLUMN \"email\";", "drops a column"],
    ["ALTER TABLE \"User\" RENAME COLUMN \"name\" TO \"fullName\";", "renames"],
    ["ALTER TABLE \"User\" RENAME TO \"Person\";", "renames"],
    ["ALTER TABLE \"User\" ALTER COLUMN \"plan\" TYPE TEXT;", "changes a column type"],
    ["ALTER TABLE \"User\" ALTER COLUMN \"name\" SET NOT NULL;", "makes an existing column required"],
    ["ALTER TABLE \"User\" ADD COLUMN \"phone\" TEXT NOT NULL;", "required column with no default"],
    ["ALTER TABLE \"User\" ADD COLUMN \"a\" TEXT, ADD COLUMN \"b\" TEXT NOT NULL;", "required column with no default"],
    ["TRUNCATE TABLE \"Business\";", "truncates"],
    ["DELETE FROM \"ActionItem\";", "deletes every row"],
    ["drop index \"x\";", "drops an object"],
  ])("flags %s", (sql, rule) => {
    const found = destructiveFindings(sql);
    expect(found.length, sql).toBeGreaterThan(0);
    expect(found.map((f) => f.rule).join("|")).toContain(rule);
  });

  it.each([
    "CREATE TABLE \"Scan\" (\"id\" TEXT NOT NULL, CONSTRAINT \"Scan_pkey\" PRIMARY KEY (\"id\"));",
    "ALTER TABLE \"User\" ADD COLUMN \"lastDigestAt\" TIMESTAMP(3), ADD COLUMN \"digestOptOut\" BOOLEAN NOT NULL DEFAULT false;",
    "ALTER TABLE \"User\" ADD COLUMN \"note\" TEXT;",
    "CREATE INDEX \"Scan_siteKey_idx\" ON \"Scan\"(\"siteKey\");",
    "CREATE TYPE \"ScanState\" AS ENUM ('DONE');",
    "DELETE FROM \"Scan\" WHERE \"expiresAt\" < now();",
    "-- we used to DROP TABLE here\nALTER TABLE \"User\" ADD COLUMN \"x\" TEXT;", // a word in a comment is fine
  ])("allows %s", (sql) => expect(destructiveFindings(sql)).toEqual([]));

  it("accepts a destructive migration only with an explicit approval line that gives a reason", () => {
    const sql = "-- DESTRUCTIVE-APPROVED: column unused since release 2026-10-20\nALTER TABLE \"User\" DROP COLUMN \"legacy\";";
    expect(checkMigration(sql)).toMatchObject({ ok: true, approved: true });
    expect(checkMigration("-- DESTRUCTIVE-APPROVED:\nALTER TABLE \"User\" DROP COLUMN \"x\";").ok).toBe(false);
    expect(checkMigration("ALTER TABLE \"User\" DROP COLUMN \"x\";").ok).toBe(false);
  });
});

describe("the repository's own migrations", () => {
  const folders = readdirSync(dir).filter((n) => statSync(new URL(`${n}/`, dir)).isDirectory());

  it("there is at least one migration to check", () => expect(folders.length).toBeGreaterThan(0));

  it.each(folders)("%s is safe to apply while the previous release is live", (folder) => {
    const sql = readFileSync(new URL(`${folder}/migration.sql`, dir), "utf8");
    const result = checkMigration(sql);
    expect(result.findings, `${folder}: add \`-- DESTRUCTIVE-APPROVED: <reason>\` only after a decision`).toEqual(
      result.approved ? result.findings : []
    );
    expect(result.ok).toBe(true);
  });
});
