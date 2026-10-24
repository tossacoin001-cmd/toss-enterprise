"use client";

import { useState } from "react";
import { Button, Notice } from "@/components/ui";

/** Weekly email switch, data download and account deletion. Deletion needs the typed phrase. */
export default function DataControls({ weeklyEmail }: { weeklyEmail: boolean }) {
  const [email, setEmail] = useState(weeklyEmail);
  const [emailMsg, setEmailMsg] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleEmail() {
    const next = !email;
    setEmailMsg(null);
    try {
      const res = await fetch("/api/account/preferences", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ weeklyEmail: next }) });
      if (!res.ok) throw new Error("failed");
      setEmail(next);
      setEmailMsg(next ? "Weekly email is on." : "Weekly email is off.");
    } catch {
      setEmailMsg("Could not change that. Please try again.");
    }
  }

  async function remove() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/account", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ confirm: phrase }) });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) { setError(data.error ?? "Could not delete. Please try again."); setBusy(false); return; }
      window.location.assign("/");
    } catch {
      setError("Could not reach the server. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="ws-stack" style={{ marginTop: "0.8rem" }}>
      <div className="ws-row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
        <div>
          <p style={{ fontWeight: 600 }}>Weekly email</p>
          <p className="ws-muted ws-small">{email ? "On. We email you what changed each week." : "Off. We will not email you."}</p>
        </div>
        <Button variant="secondary" onClick={toggleEmail} aria-pressed={email}>{email ? "Turn off" : "Turn on"}</Button>
      </div>
      {emailMsg ? <p className="ws-small" role="status">{emailMsg}</p> : null}

      <div className="ws-row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
        <div>
          <p style={{ fontWeight: 600 }}>Download your data</p>
          <p className="ws-muted ws-small">Your details, businesses, checks and actions, as one file.</p>
        </div>
        <Button href="/api/account/export" variant="secondary">Download</Button>
      </div>

      <div>
        <p style={{ fontWeight: 600 }}>Delete your account</p>
        <p className="ws-muted ws-small">This removes your businesses, checks, actions and sign-in. It cannot be undone.</p>
        {!asking ? (
          <div style={{ marginTop: "0.6rem" }}><Button variant="danger" onClick={() => setAsking(true)}>Delete my account</Button></div>
        ) : (
          <div className="ws-stack" style={{ marginTop: "0.6rem" }}>
            {error ? <Notice tone="danger">{error}</Notice> : null}
            <label className="ws-label" htmlFor="del-phrase">Type <strong>delete my account</strong> to confirm</label>
            <input id="del-phrase" className="ws-input" value={phrase} onChange={(e) => setPhrase(e.target.value)} autoComplete="off" autoCapitalize="none" />
            <div className="ws-row">
              <Button variant="ghost" onClick={() => { setAsking(false); setPhrase(""); setError(null); }}>Keep my account</Button>
              <Button variant="danger" disabled={busy || phrase.trim().toLowerCase() !== "delete my account"} onClick={remove}>{busy ? "Deleting" : "Delete everything"}</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
