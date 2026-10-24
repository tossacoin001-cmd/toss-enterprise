/**
 * The action loop. A rescan updates the owner's list instead of rebuilding it: it never duplicates an
 * item, never loses a note and never rewrites what the owner marked done. Owner edits are limited to
 * a status and a note. Tests: tests/workspace/actions.test.ts.
 */

export type ActionStatus = "PENDING" | "IN_PROGRESS" | "DONE";
export type ActionPriority = "LOW" | "MEDIUM" | "HIGH";

export type Draft = { key: string; title: string; description: string; priority: ActionPriority; category: string };

export type ExistingAction = {
  id: string;
  key: string | null;
  title: string;
  description: string | null;
  priority: ActionPriority;
  category: string | null;
  status: ActionStatus;
  note: string | null;
  completedAt: Date | null;
  lastSeenFailingAt: Date | null;
};

export type ActionPatch = Partial<{
  title: string;
  description: string;
  priority: ActionPriority;
  category: string;
  status: ActionStatus;
  note: string | null;
  completedAt: Date | null;
  lastSeenFailingAt: Date | null;
}>;

export type Reconciliation = { create: Draft[]; update: Array<{ id: string; patch: ActionPatch }>; remove: string[] };

export function reconcileActions(existing: ExistingAction[], drafts: Draft[], now: number): Reconciliation {
  const wanted = new Map<string, Draft>();
  for (const d of drafts) if (!wanted.has(d.key)) wanted.set(d.key, d);

  const create: Draft[] = [];
  const update: Reconciliation["update"] = [];
  const remove: string[] = [];
  const seen = new Set<string>();

  for (const item of existing) {
    if (item.key === null) {
      // Made before keys existed: replace the open ones as before, keep everything else as history.
      if (item.status === "PENDING") remove.push(item.id);
      continue;
    }
    seen.add(item.key);
    const d = wanted.get(item.key);

    if (!d) {
      // The check now passes.
      if (item.status === "PENDING") remove.push(item.id);
      else if (item.status === "IN_PROGRESS") update.push({ id: item.id, patch: { status: "DONE", completedAt: new Date(now) } });
      else if (item.lastSeenFailingAt) update.push({ id: item.id, patch: { lastSeenFailingAt: null } });
      continue;
    }

    if (item.status === "DONE") {
      // The owner said done and the fresh check still finds it: say so, do not rewrite their history.
      update.push({ id: item.id, patch: { lastSeenFailingAt: new Date(now) } });
      continue;
    }

    const changed = item.title !== d.title || item.description !== d.description || item.priority !== d.priority || item.category !== d.category;
    if (changed) update.push({ id: item.id, patch: { title: d.title, description: d.description, priority: d.priority, category: d.category } });
  }

  for (const [key, d] of wanted) if (!seen.has(key)) create.push(d);
  return { create, update, remove };
}

const STATUSES: ReadonlySet<string> = new Set(["PENDING", "IN_PROGRESS", "DONE"]);
export const NOTE_MAX = 500;

export type UpdateResult = { ok: true; patch: ActionPatch } | { ok: false; error: string };

/** What an owner's request may change on one action. Anything else in the request is ignored. */
export function applyActionUpdate(current: ExistingAction, input: unknown, now: number): UpdateResult {
  const body = input && typeof input === "object" && !Array.isArray(input) ? (input as Record<string, unknown>) : {};
  const hasStatus = "status" in body;
  const hasNote = "note" in body;
  if (!hasStatus && !hasNote) return { ok: false, error: "Nothing to change. Send a status or a note." };

  const patch: ActionPatch = {};

  if (hasStatus) {
    const status = body.status;
    if (typeof status !== "string" || !STATUSES.has(status)) return { ok: false, error: "The status must be PENDING, IN_PROGRESS or DONE." };
    if (status !== current.status) {
      patch.status = status as ActionStatus;
      if (status === "DONE") {
        patch.completedAt = new Date(now);
        patch.lastSeenFailingAt = null;
      } else if (current.status === "DONE") {
        patch.completedAt = null;
      }
    }
  }

  if (hasNote) {
    if (typeof body.note !== "string") return { ok: false, error: "The note must be text." };
    const note = body.note.trim();
    if (note.length > NOTE_MAX) return { ok: false, error: `The note is too long (${NOTE_MAX} characters at most).` };
    const next = note === "" ? null : note;
    if (next !== current.note) patch.note = next;
  }

  return { ok: true, patch };
}
