import { describe, expect, it } from "vitest";
import { applyActionUpdate, reconcileActions, type Draft, type ExistingAction } from "@/lib/workspace/actions";

// The action loop: what a rescan does to the owner's list, and what an update may change. The point is
// that a rescan never duplicates, never loses a note, and never rewrites history. Handoff section 4E.

const NOW = Date.parse("2026-10-23T10:00:00Z");
const draft = (key: string, over: Partial<Draft> = {}): Draft => ({ key, title: `Fix ${key}`, description: `Why ${key}`, priority: "MEDIUM", category: "Website", ...over });
const item = (key: string | null, over: Partial<ExistingAction> = {}): ExistingAction => ({
  id: `id-${key}`, key, title: `Old ${key}`, description: "old", priority: "LOW", category: "Website", status: "PENDING", note: null, completedAt: null, lastSeenFailingAt: null, ...over,
});

describe("reconcileActions: a rescan updates the list instead of rebuilding it", () => {
  it("creates an item for a new finding", () => {
    const r = reconcileActions([], [draft("page.title")], NOW);
    expect(r.create.map((d) => d.key)).toEqual(["page.title"]);
    expect(r.update).toEqual([]);
    expect(r.remove).toEqual([]);
  });

  it("is idempotent: running the same rescan twice changes nothing the second time", () => {
    const first = reconcileActions([], [draft("page.title")], NOW);
    const stored = first.create.map((d) => item(d.key, { title: d.title, description: d.description, priority: d.priority, category: d.category }));
    const second = reconcileActions(stored, [draft("page.title")], NOW);
    expect(second.create).toEqual([]);
    expect(second.update).toEqual([]);
    expect(second.remove).toEqual([]);
  });

  it("a pending item still failing keeps its id and takes the newest wording", () => {
    const r = reconcileActions([item("page.title")], [draft("page.title", { priority: "HIGH" })], NOW);
    expect(r.create).toEqual([]);
    expect(r.update).toEqual([{ id: "id-page.title", patch: { title: "Fix page.title", description: "Why page.title", priority: "HIGH", category: "Website" } }]);
  });

  it("an item in progress is never duplicated, never reset, and its note survives", () => {
    const r = reconcileActions([item("page.title", { status: "IN_PROGRESS", note: "Asked Ada to do it" })], [draft("page.title")], NOW);
    expect(r.create).toEqual([]);
    expect(r.remove).toEqual([]);
    for (const u of r.update) {
      expect(u.patch).not.toHaveProperty("status");
      expect(u.patch).not.toHaveProperty("note");
    }
  });

  it("an item the owner marked done but the fresh check still finds is flagged, not rewritten", () => {
    const done = item("page.title", { status: "DONE", completedAt: new Date(NOW - 86_400_000), note: "Added a title" });
    const r = reconcileActions([done], [draft("page.title")], NOW);
    expect(r.create).toEqual([]);
    expect(r.remove).toEqual([]);
    expect(r.update).toEqual([{ id: "id-page.title", patch: { lastSeenFailingAt: new Date(NOW) } }]);
  });

  it("a done item whose check now passes is left alone, and any earlier flag is cleared", () => {
    const flagged = item("page.title", { status: "DONE", lastSeenFailingAt: new Date(NOW - 86_400_000) });
    const r = reconcileActions([flagged], [], NOW);
    expect(r.update).toEqual([{ id: "id-page.title", patch: { lastSeenFailingAt: null } }]);
    expect(r.remove).toEqual([]);
    const clean = reconcileActions([item("page.title", { status: "DONE" })], [], NOW);
    expect(clean.update).toEqual([]);
  });

  it("a pending item whose finding is fixed is removed; one in progress is completed with its note kept", () => {
    const r = reconcileActions([item("a"), item("b", { status: "IN_PROGRESS", note: "On it" })], [], NOW);
    expect(r.remove).toEqual(["id-a"]);
    expect(r.update).toEqual([{ id: "id-b", patch: { status: "DONE", completedAt: new Date(NOW) } }]);
  });

  it("old items made before keys existed: pending ones are replaced, anything else is kept as history", () => {
    const r = reconcileActions([item(null, { id: "legacy-pending" }), item(null, { id: "legacy-done", status: "DONE" })], [draft("page.title")], NOW);
    expect(r.remove).toEqual(["legacy-pending"]);
    expect(r.create.map((d) => d.key)).toEqual(["page.title"]);
    expect(r.update.find((u) => u.id === "legacy-done")).toBeUndefined();
  });

  it("two findings with the same key in one scan make one item", () => {
    const r = reconcileActions([], [draft("a"), draft("a")], NOW);
    expect(r.create).toHaveLength(1);
  });
});

describe("applyActionUpdate: what an owner may change", () => {
  const cur = item("page.title");

  it.each(["PENDING", "IN_PROGRESS", "DONE"] as const)("accepts status %s", (status) => {
    const r = applyActionUpdate({ ...cur, status: status === "DONE" ? "PENDING" : "DONE", completedAt: null }, { status }, NOW);
    expect(r.ok).toBe(true);
  });

  it.each(["", "done", "COMPLETE", "DELETED", null, 3, {}])("rejects the status %j", (status) => {
    const r = applyActionUpdate(cur, { status: status as never }, NOW);
    expect(r).toEqual({ ok: false, error: expect.stringMatching(/status/i) });
  });

  it("marking done records when, and clears any 'still found' flag", () => {
    const r = applyActionUpdate(item("a", { lastSeenFailingAt: new Date(NOW - 1000) }), { status: "DONE" }, NOW);
    expect(r).toEqual({ ok: true, patch: { status: "DONE", completedAt: new Date(NOW), lastSeenFailingAt: null } });
  });

  it("reopening clears the completion time but keeps the note and the history of the note", () => {
    const r = applyActionUpdate(item("a", { status: "DONE", completedAt: new Date(NOW - 5000), note: "Done by Ada" }), { status: "IN_PROGRESS" }, NOW);
    expect(r).toEqual({ ok: true, patch: { status: "IN_PROGRESS", completedAt: null } });
  });

  it("setting the same status again is a no-op, so a double tap does nothing", () => {
    expect(applyActionUpdate(item("a", { status: "IN_PROGRESS" }), { status: "IN_PROGRESS" }, NOW)).toEqual({ ok: true, patch: {} });
    const done = item("a", { status: "DONE", completedAt: new Date(NOW - 5000) });
    expect(applyActionUpdate(done, { status: "DONE" }, NOW)).toEqual({ ok: true, patch: {} });
  });

  it("keeps a note, trimmed, up to 500 characters, and lets it be cleared", () => {
    expect(applyActionUpdate(cur, { note: "  Called the host  " }, NOW)).toEqual({ ok: true, patch: { note: "Called the host" } });
    expect(applyActionUpdate(item("a", { note: "Old note" }), { note: "   " }, NOW)).toEqual({ ok: true, patch: { note: null } });
    expect(applyActionUpdate(cur, { note: "" }, NOW)).toEqual({ ok: true, patch: {} }); // clearing a note that is already empty changes nothing
    expect(applyActionUpdate(cur, { note: "x".repeat(501) }, NOW)).toEqual({ ok: false, error: expect.stringMatching(/note/i) });
    expect(applyActionUpdate(cur, { note: 5 as never }, NOW)).toEqual({ ok: false, error: expect.stringMatching(/note/i) });
  });

  it("an empty request is refused, and unknown fields are ignored", () => {
    expect(applyActionUpdate(cur, {}, NOW)).toEqual({ ok: false, error: expect.stringMatching(/nothing to change/i) });
    const r = applyActionUpdate(cur, { status: "DONE", title: "hacked", priority: "HIGH", businessId: "other" } as never, NOW);
    expect(r).toEqual({ ok: true, patch: expect.not.objectContaining({ title: expect.anything(), priority: expect.anything(), businessId: expect.anything() }) });
  });

  it("note and status can change together", () => {
    const r = applyActionUpdate(cur, { status: "DONE", note: "Finished" }, NOW);
    expect(r).toEqual({ ok: true, patch: { status: "DONE", completedAt: new Date(NOW), lastSeenFailingAt: null, note: "Finished" } });
  });
});
