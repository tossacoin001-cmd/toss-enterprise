/**
 * "Did you mean...?" for a mistyped website address. Only ever a suggestion: the visitor decides.
 * Returns null when the address looks fine or when we are not sure. Tests: tests/scan-ui/poll-and-typos.test.ts (IN-06).
 */

const COM_TYPOS = new Set(["con", "cmo", "vom", "ocm", "xom", "comm", "cim", "cpm", "clm"]);

export function didYouMean(input: string): string | null {
  let s = input.trim();
  if (!s || s.length > 300 || /\s/.test(s) || s.startsWith("@")) return null;

  s = s.replace(/^(https?)\/\//i, ""); // http//example.com
  s = s.replace(/[,;]+$/, ""); // a stray comma at the end
  if (/^[a-z0-9-]+,[a-z0-9.-]+$/i.test(s)) s = s.replace(",", "."); // example,com

  const m = s.match(/^(.*\.)([a-z]+)$/i);
  if (m && COM_TYPOS.has(m[2].toLowerCase())) s = `${m[1]}com`;
  else if (/\.com\.n$/i.test(s)) s = `${s}g`;
  else if (!s.includes(".")) {
    const bare = s.match(/^([a-z0-9-]{4,})(com)$/i);
    if (bare) s = `${bare[1]}.com`;
  }

  if (s === input.trim()) return null;
  return /^[a-z0-9.:/-]+$/i.test(s) ? s : null;
}
