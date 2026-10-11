/**
 * Small line icons, inline SVG (about 200 bytes each). Decoration only: hidden from screen readers,
 * because the words next to them say everything. Generic shapes, not company logos.
 */

const PATHS = {
  globe: "M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18",
  chat: "M4 5h16v11H9l-5 4V5z",
  camera: "M4 8h4l2-3h4l2 3h4v11H4V8zM12 17a3.5 3.5 0 100-7 3.5 3.5 0 000 7z",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 20c0-4 4-6 8-6s8 2 8 6",
  search: "M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-4-4",
  check: "M5 12l5 5 9-10",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z",
  clock: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2",
  link: "M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3A4 4 0 0011 18.7l1-1",
  spark: "M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z",
} as const;

export type IconName = keyof typeof PATHS;

export default function Icon({ name, className = "w-5 h-5" }: { name: IconName; className?: string }) {
  return (
    <svg data-icon={name} aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={PATHS[name]} />
    </svg>
  );
}
