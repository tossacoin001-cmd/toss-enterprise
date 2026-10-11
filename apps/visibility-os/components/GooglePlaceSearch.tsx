"use client";
import { useEffect, useRef, useState } from "react";
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

export default function GooglePlaceSearch({ selected, onSelect, enabled = true }: GooglePlaceSearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const sessionToken = useRef(crypto.randomUUID());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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

  if (!enabled) {
    return (
      <div>
        <input
          className="input-field opacity-50 cursor-not-allowed"
          placeholder="Google Business search opens soon"
          disabled
          aria-label="Google Business search opens soon"
        />
        <p className="text-[11px] mt-1.5" style={{ color: "rgba(250,247,242,0.4)" }}>
          You can connect your Google listing from your dashboard as soon as it opens.
        </p>
      </div>
    );
  }

  if (selected) {
    return (
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <CheckCircle size={14} style={{ color: "#4ade80" }} />
        </div>
        <div className="input-field pl-8 flex items-center justify-between">
          <span className="truncate" style={{ color: "#FAF7F2" }}>
            {selected.text}
          </span>
          <button
            type="button"
            onClick={clear}
            className="text-[10px] tracking-wide shrink-0 ml-2"
            style={{ color: "rgba(250,247,242,0.4)" }}
          >
            Change
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,110,0.4)" strokeWidth="1.5">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      </div>
      <input
        className="input-field pl-8"
        placeholder="Search for your business on Google"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && query.trim().length >= 2 && suggestions.length > 0 && (
        <div
          className="absolute z-10 left-0 right-0 mt-1 max-h-56 overflow-y-auto"
          style={{ background: "#092D22", border: "1px solid rgba(201,169,110,0.2)" }}
        >
          {suggestions.map((s) => (
            <button
              key={s.placeId}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => select(s)}
              className="w-full text-left px-3 py-2 text-xs transition-colors duration-150"
              style={{ color: "rgba(250,247,242,0.7)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(201,169,110,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {s.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
