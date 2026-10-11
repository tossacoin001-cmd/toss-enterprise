/**
 * Rules for database migrations. Preview builds of any branch share the
 * production database and production deploys migrate before the new code goes
 * live, so every migration must be safe for the code that is running right now.
 * That means "expand, then contract": add things in one release, and only
 * remove or rename them in a later release after nothing uses them.
 *
 * A destructive change needs a human decision, recorded in the migration file
 * as a line `-- DESTRUCTIVE-APPROVED: <reason>`.
 */
export type Finding = { rule: string; sql: string };

const approved = (sql: string) => /^[ \t]*--[ \t]*DESTRUCTIVE-APPROVED:[ \t]*\S+/m.test(sql);

export function destructiveFindings(sql: string): Finding[] {
  // Strip comments so a word in a comment cannot trip a rule.
  const code = sql.replace(/--[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
  const statements = code.split(";").map((s) => s.trim()).filter(Boolean);
  const out: Finding[] = [];
  const add = (rule: string, sql: string) => out.push({ rule, sql: sql.replace(/\s+/g, " ").slice(0, 120) });

  for (const s of statements) {
    if (/^DROP\s+(TABLE|COLUMN|INDEX|TYPE|SCHEMA|VIEW|SEQUENCE|DATABASE)\b/i.test(s)) add("drops an object", s);
    if (/^TRUNCATE\b/i.test(s)) add("truncates a table", s);
    if (/^DELETE\s+FROM\b/i.test(s) && !/\bWHERE\b/i.test(s)) add("deletes every row", s);
    if (/^ALTER\s+TABLE\b/i.test(s)) {
      if (/\bDROP\s+(COLUMN|CONSTRAINT|DEFAULT)\b/i.test(s)) add("drops a column, constraint or default", s);
      if (/\bRENAME\b/i.test(s)) add("renames a table or column (the running code still uses the old name)", s);
      if (/\bALTER\s+COLUMN\b[^,]*\bTYPE\b/i.test(s)) add("changes a column type", s);
      if (/\bALTER\s+COLUMN\b[^,]*\bSET\s+NOT\s+NULL\b/i.test(s)) add("makes an existing column required", s);
      // A new required column with no default breaks the running code's inserts.
      for (const part of s.split(/,\s*(?=ADD\s)/i)) {
        if (/\bADD\s+COLUMN\b/i.test(part) && /\bNOT\s+NULL\b/i.test(part) && !/\bDEFAULT\b/i.test(part)) {
          add("adds a required column with no default (the running code cannot fill it)", s);
        }
      }
    }
  }
  return out;
}

export function checkMigration(sql: string): { ok: boolean; findings: Finding[]; approved: boolean } {
  const findings = destructiveFindings(sql);
  const isApproved = approved(sql);
  return { ok: findings.length === 0 || isApproved, findings, approved: isApproved };
}
