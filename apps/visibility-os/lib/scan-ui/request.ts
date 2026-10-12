/**
 * What each audience's form sends to the scan. A person is sent as a personal brand, so the result
 * never treats them as a shop. Tests: tests/front-page/request.test.ts.
 */

export type Audience = "business" | "social" | "personal";

export type Fields = {
  website?: string;
  name?: string;
  city?: string;
  category?: string;
  instagram?: string;
  x?: string;
  linkedin?: string;
  whatsapp?: string;
};

const clean = (s: string | undefined) => (s ?? "").trim();

export function buildScanRequest(audience: Audience, f: Fields, token: string): Record<string, unknown> {
  if (audience === "business") return { website: clean(f.website), token };

  const handles: Record<string, string> = {};
  const add = (k: string, v: string | undefined) => {
    if (clean(v)) handles[k] = clean(v);
  };
  add("instagram", f.instagram);
  if (audience === "personal") {
    add("x", f.x);
    add("linkedin", f.linkedin);
  }

  const body: Record<string, unknown> = { token };
  if (clean(f.name)) body.name = clean(f.name);
  if (clean(f.city)) body.city = clean(f.city);
  const category = clean(f.category) || (audience === "personal" ? "Personal brand" : "");
  if (category) body.category = category;
  if (Object.keys(handles).length) body.handles = handles;
  if (clean(f.whatsapp)) body.whatsapp = clean(f.whatsapp);
  return body;
}
