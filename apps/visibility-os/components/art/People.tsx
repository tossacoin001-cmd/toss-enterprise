/**
 * Three small drawn people, one for each audience. Inline SVG (no image requests, about 1 KB each),
 * flat and friendly, in the brand colours. They are drawings, not photos and not real customers.
 * Tests: tests/front-page/render.test.ts.
 */

export type PersonKind = "business" | "social" | "personal";

const LABEL: Record<PersonKind, string> = {
  business: "A drawing of a business owner at a laptop with their website open",
  social: "A drawing of a shop owner in a gold headwrap holding a phone with a chat open",
  personal: "A drawing of a young creator with headphones and a camera",
};

const GOLD = "#C9A96E";
const CREAM = "#FAF7F2";
const DEEP = "#092D22";

export default function Person({ kind, className = "" }: { kind: PersonKind; className?: string }) {
  return (
    <svg data-art="person" data-person={kind} role="img" aria-label={LABEL[kind]} viewBox="0 0 120 120" className={className}>
      <circle cx="60" cy="60" r="58" fill="#0D3F2E" stroke="rgba(201,169,110,0.35)" />
      {kind === "business" && (
        <g>
          <path d="M22 112c2-22 17-34 38-34s36 12 38 34z" fill={CREAM} />
          <path d="M52 78l8 12 8-12z" fill={GOLD} />
          <rect x="53" y="62" width="14" height="14" rx="6" fill="#7A4A2E" />
          <circle cx="60" cy="48" r="19" fill="#8B5A3C" />
          <path d="M41 46c0-14 8-20 19-20s19 6 19 20c-4-7-10-10-19-10s-15 3-19 10z" fill="#1C130D" />
          <circle cx="53" cy="50" r="2" fill="#1C130D" />
          <circle cx="67" cy="50" r="2" fill="#1C130D" />
          <path d="M54 58c3 3 9 3 12 0" stroke="#1C130D" strokeWidth="2" fill="none" strokeLinecap="round" />
          <rect x="30" y="86" width="60" height="26" rx="3" fill={DEEP} stroke={GOLD} strokeWidth="2" />
          <rect x="36" y="91" width="22" height="3" fill={GOLD} />
          <rect x="36" y="97" width="36" height="2" fill="rgba(250,247,242,0.5)" />
          <rect x="36" y="102" width="28" height="2" fill="rgba(250,247,242,0.5)" />
        </g>
      )}
      {kind === "social" && (
        <g>
          <path d="M20 112c2-22 17-34 40-34s38 12 40 34z" fill="#E8D5A3" />
          <rect x="53" y="62" width="14" height="14" rx="6" fill="#5C3720" />
          <circle cx="60" cy="48" r="19" fill="#6B4226" />
          <path d="M38 44c0-16 9-26 22-26s22 10 22 26c0 3-2 5-5 5-3-6-9-10-17-10s-14 4-17 10c-3 0-5-2-5-5z" fill={GOLD} />
          <path d="M44 22c6-8 22-8 30 0-8-3-22-3-30 0z" fill="#A07840" />
          <circle cx="53" cy="51" r="2" fill="#1C130D" />
          <circle cx="67" cy="51" r="2" fill="#1C130D" />
          <path d="M54 59c3 3 9 3 12 0" stroke="#1C130D" strokeWidth="2" fill="none" strokeLinecap="round" />
          <rect x="74" y="72" width="26" height="38" rx="5" fill={DEEP} stroke={CREAM} strokeWidth="2" />
          <rect x="79" y="80" width="16" height="9" rx="4" fill={GOLD} />
          <rect x="79" y="92" width="12" height="8" rx="4" fill="rgba(250,247,242,0.7)" />
        </g>
      )}
      {kind === "personal" && (
        <g>
          <path d="M24 112c2-22 16-34 36-34s34 12 36 34z" fill="#145240" />
          <rect x="53" y="62" width="14" height="14" rx="6" fill="#8E5A38" />
          <circle cx="60" cy="48" r="19" fill="#A9714B" />
          <circle cx="60" cy="34" r="21" fill="#1C130D" />
          <path d="M42 46c0-10 8-16 18-16s18 6 18 16c-4-5-10-7-18-7s-14 2-18 7z" fill="#1C130D" />
          <circle cx="53" cy="51" r="2" fill="#1C130D" />
          <circle cx="67" cy="51" r="2" fill="#1C130D" />
          <path d="M54 59c3 3 9 3 12 0" stroke="#1C130D" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M38 50c0-18 10-26 22-26s22 8 22 26" stroke={GOLD} strokeWidth="4" fill="none" strokeLinecap="round" />
          <rect x="34" y="48" width="8" height="14" rx="4" fill={GOLD} />
          <rect x="78" y="48" width="8" height="14" rx="4" fill={GOLD} />
          <rect x="68" y="84" width="30" height="22" rx="4" fill={DEEP} stroke={CREAM} strokeWidth="2" />
          <circle cx="83" cy="95" r="6" fill="none" stroke={GOLD} strokeWidth="2" />
          <rect x="74" y="80" width="10" height="4" fill={CREAM} />
        </g>
      )}
    </svg>
  );
}
