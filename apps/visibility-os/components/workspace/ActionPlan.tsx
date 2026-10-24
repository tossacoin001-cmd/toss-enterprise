"use client";

import { useState } from "react";
import { Button, EmptyState, Notice, StatusBadge } from "@/components/ui";

/**
 * The owner's list of actions: start, finish, reopen and add a note. Every change goes to the server,
 * which decides whether it is allowed (PATCH /api/businesses/[id]/actions/[actionId]).
 * Tests: tests/workspace/dashboard-render.test.ts.
 */

export type ActionRow = {
  id: string;
  title: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  category: string | null;
  status: "PENDING" | "IN_PROGRESS" | "DONE";
  note: string | null;
  completedAt: Date | string | null;
  lastSeenFailingAt: Date | string | null;
};

export type ActionFilter = "open" | "done" | "all";

const PRIORITY: Record<ActionRow["priority"], { label: string; tone: "danger" | "warn" | "neutral" }> = {
  HIGH: { label: "High priority", tone: "danger" },
  MEDIUM: { label: "Medium priority", tone: "warn" },
  LOW: { label: "Low priority", tone: "neutral" },
};
const STATUS_LABEL = { PENDING: "To do", IN_PROGRESS: "In progress", DONE: "Done" } as const;
const RANK = { HIGH: 0, MEDIUM: 1, LOW: 2 } as const;

const DAY = 86_400_000;
function ago(value: Date | string | null, now: number): string {
  if (!value) return "";
  const ms = Math.max(0, now - new Date(value).getTime());
  if (ms < 3_600_000) return "just now";
  if (ms < DAY) return `${Math.floor(ms / 3_600_000)} hours ago`;
  const d = Math.floor(ms / DAY);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

export function sortActions<T extends Pick<ActionRow, "priority" | "status">>(items: T[]): T[] {
  const order = { IN_PROGRESS: 0, PENDING: 1, DONE: 2 } as const;
  return [...items].sort((a, b) => order[a.status] - order[b.status] || RANK[a.priority] - RANK[b.priority]);
}

export default function ActionPlan({
  businessId, items, now, filter = "open", limit,
}: { businessId: string; items: ActionRow[]; now: number; filter?: ActionFilter; limit?: number }) {
  const [rows, setRows] = useState(items);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  async function send(id: string, body: { status?: ActionRow["status"]; note?: string }) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/businesses/${businessId}/actions/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const data = (await res.json().catch(() => ({}))) as { item?: Partial<ActionRow>; error?: string };
      if (!res.ok || !data.item) throw new Error(data.error ?? "That did not save. Please try again.");
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...data.item } : r)));
      if (body.note !== undefined) setNoteFor(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "That did not save. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  const visible = sortActions(rows.filter((r) => (filter === "all" ? true : filter === "done" ? r.status === "DONE" : r.status !== "DONE"))).slice(0, limit ?? 1000);

  return (
    <div className="ws-stack">
      {error && <Notice tone="danger" live="assertive">{error}</Notice>}
      {visible.length === 0 ? (
        <EmptyState title={filter === "done" ? "Nothing here yet" : "Nothing to do right now"}>
          {filter === "done" ? "Actions you finish will show here." : "When a check finds something to fix, it will appear here."}
        </EmptyState>
      ) : (
        <ul className="ws-stack" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {visible.map((r) => {
            const pr = PRIORITY[r.priority];
            const busy = busyId === r.id;
            return (
              <li key={r.id} className="ws-card">
                <div className="ws-row" style={{ gap: "0.4rem" }}>
                  <StatusBadge tone={pr.tone}>{pr.label}</StatusBadge>
                  <StatusBadge tone={r.status === "DONE" ? "good" : r.status === "IN_PROGRESS" ? "info" : "neutral"}>{STATUS_LABEL[r.status]}</StatusBadge>
                  {r.category && <StatusBadge>{r.category}</StatusBadge>}
                </div>
                <h3 className="ws-h3" style={{ marginTop: "0.6rem" }}>{r.title}</h3>
                {r.description && <p className="ws-muted ws-small" style={{ marginTop: "0.25rem" }}>{r.description}</p>}
                {r.status === "DONE" && r.completedAt && <p className="ws-small ws-muted" style={{ marginTop: "0.4rem" }}>Done {ago(r.completedAt, now)}</p>}
                {r.status === "DONE" && r.lastSeenFailingAt && (
                  <div style={{ marginTop: "0.6rem" }}>
                    <Notice tone="warn" title="Still found in the last check">
                      You marked this done, but our last check still found it. It may take a little while to show, or it may need another look. You can reopen it.
                    </Notice>
                  </div>
                )}
                {r.note && <p className="ws-small" style={{ marginTop: "0.6rem" }}><strong>Your note:</strong> {r.note}</p>}

                <div className="ws-row" style={{ marginTop: "0.8rem" }}>
                  {r.status === "PENDING" && <Button size="small" variant="secondary" disabled={busy} onClick={() => send(r.id, { status: "IN_PROGRESS" })}>Start</Button>}
                  {r.status !== "DONE" && <Button size="small" disabled={busy} onClick={() => send(r.id, { status: "DONE" })}>Mark done</Button>}
                  {r.status === "IN_PROGRESS" && <Button size="small" variant="ghost" disabled={busy} onClick={() => send(r.id, { status: "PENDING" })}>Back to to-do</Button>}
                  {r.status === "DONE" && <Button size="small" variant="secondary" disabled={busy} onClick={() => send(r.id, { status: "IN_PROGRESS" })}>Reopen</Button>}
                  <Button size="small" variant="ghost" onClick={() => { setNoteFor(noteFor === r.id ? null : r.id); setDraft(r.note ?? ""); }}>
                    {r.note ? "Edit note" : "Add a note"}
                  </Button>
                </div>

                {noteFor === r.id && (
                  <div style={{ marginTop: "0.8rem" }}>
                    <label className="ws-label" htmlFor={`note-${r.id}`}>Your note</label>
                    <textarea id={`note-${r.id}`} className="ws-textarea" value={draft} maxLength={500} onChange={(e) => setDraft(e.target.value)} />
                    <p className="ws-hint">Only you see this. Up to 500 characters.</p>
                    <div className="ws-row" style={{ marginTop: "0.5rem" }}>
                      <Button size="small" disabled={busy} onClick={() => send(r.id, { note: draft })}>Save note</Button>
                      <Button size="small" variant="ghost" onClick={() => setNoteFor(null)}>Cancel</Button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
