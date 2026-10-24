"use client";
import { useEffect, useId, useRef, useState } from "react";
import { CheckCircle } from "lucide-react";

type Suggestion = { placeId: string; text: string };

export type SelectedPlace = {
  placeId: string;
  text: string;
  sessionToken: string;
};

interface GooglePlaceSearchProps {
  selected: SelectedPlace | null;
  onSelect: (place: SelectedPlace | null) => void;
  /** False when the server has no Places key: show a calm "opens soon" state. */
  enabled?: boolean;
}

/** Finds a business on Google. Works with a keyboard: arrows move, Enter picks, Escape closes. */
export default function GooglePlaceSearch({ selected, onSelect, enabled = true }: GooglePlaceSearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const sessionToken = useRef(crypto.randomUUID());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const listId = useId();
  const inputId = useId();

  useEffect(() => {
    if (selected || query.trim().length < 2) {
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/places/autocomplete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: query, sessionToken: sessionToken.current }),
        });
        if (!res.ok) return;
        const data = await res.json();
        setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
        setActive(-1);
        setOpen(true);
      } catch {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query, selected]);

  function select(s: Suggestion) {
    onSelect({ placeId: s.placeId, text: s.text, sessionToken: sessionToken.current });
    setOpen(false);
    setSuggestions([]);
  }

  function clear() {
    sessionToken.current = crypto.randomUUID();
    setQuery("");
    onSelect(null);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") return setOpen(false);
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      select(suggestions[active]);
    }
  }

  if (!enabled) {
    return (
      <div>
        <input className="ws-input" placeholder="Google Business search opens soon" disabled aria-label="Google Business search opens soon" />
        <p className="ws-hint">You can connect your Google listing from your dashboard as soon as it opens.</p>
      </div>
    );
  }

  if (selected) {
    return (
      <div className="ws-row" style={{ justifyContent: "space-between", flexWrap: "nowrap" }}>
        <span className="ws-row" style={{ minWidth: 0, flexWrap: "nowrap", gap: "0.5rem" }}>
          <CheckCircle size={18} aria-hidden="true" style={{ color: "var(--ws-good)", flexShrink: 0 }} />
          <span style={{ overflowWrap: "anywhere" }}>{selected.text}</span>
        </span>
        <button type="button" onClick={clear} className="ws-btn ws-btn--ghost ws-btn--small">Change</button>
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <label className="ws-label" htmlFor={inputId}>Search for your business on Google</label>
      <input
        id={inputId}
        className="ws-input"
        role="combobox"
        aria-expanded={open && suggestions.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        placeholder="Business name and area"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        autoComplete="off"
      />
      {open && query.trim().length >= 2 && suggestions.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="ws-card"
          style={{ position: "absolute", zIndex: 10, left: 0, right: 0, marginTop: 4, maxHeight: 240, overflowY: "auto", padding: 4, listStyle: "none" }}
        >
          {suggestions.map((s, i) => (
            <li
              key={s.placeId}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => select(s)}
              style={{ minHeight: 44, padding: "0.6rem 0.7rem", cursor: "pointer", borderRadius: 6, background: i === active ? "var(--ws-good-soft)" : "transparent" }}
            >
              {s.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
