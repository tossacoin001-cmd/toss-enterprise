import * as cheerio from "cheerio";
import { parseSocialUrl } from "./input";
import { extractPhones } from "./phone";
import type { SocialPlatform } from "./types";

/**
 * Reads a page the way a plain visitor's browser would before running any
 * JavaScript. Whatever it cannot read stays null or false: it never guesses.
 * Pages that build themselves with JavaScript are flagged (`jsBuilt`) so the
 * report can say an absence may not be real. Tests: tests/engine/analyse-html.test.ts.
 */

export type PageSignals = {
  title: string | null;
  description: string | null;
  viewport: boolean;
  canonical: string | null;
  lang: string | null;
  h1Count: number;
  ogImage: boolean;
  favicon: boolean;
  jsonLdTypes: string[];
  hasBusinessSchema: boolean;
  contact: { tel: string[]; whatsapp: string[]; email: string[]; phonesInText: string[]; any: boolean };
  social: Partial<Record<SocialPlatform, string>>;
  textChars: number;
  scriptCount: number;
  jsBuilt: boolean;
  botChallenge: boolean;
  parked: boolean;
  maintenance: boolean;
};

const BUSINESS_TYPES = new Set([
  "LocalBusiness", "Dentist", "Physician", "MedicalClinic", "MedicalBusiness", "Hospital", "Pharmacy", "BeautySalon", "HairSalon", "NailSalon", "DaySpa",
  "HealthAndBeautyBusiness", "HealthClub", "Restaurant", "FoodEstablishment", "Bakery", "BarOrPub", "CafeOrCoffeeShop", "Store", "ClothingStore",
  "ShoeStore", "ElectronicsStore", "GroceryStore", "Florist", "RealEstateAgent", "LegalService", "Attorney", "AutomotiveBusiness", "AutoRepair",
  "ProfessionalService", "FinancialService", "AccountingService", "Hotel", "LodgingBusiness", "TravelAgency", "EntertainmentBusiness", "ChildCare",
  "Electrician", "Plumber", "HomeAndConstructionBusiness", "MovingCompany", "SportsActivityLocation", "SchoolTypes", "School", "EducationalOrganization",
]);
const BUSINESS_SUFFIX = /(Business|Store|Salon|Clinic|Restaurant|Dentist|Physician|Hospital|Shop)$/;

const tidy = (s: string | undefined | null) => (s ?? "").replace(/\s+/g, " ").trim();
const orNull = (s: string) => (s ? s : null);
const SKIP_TEXT = new Set(["script", "style", "noscript", "template", "svg", "head"]);

/** Visible text, collected without recursion so a page nested 20,000 deep cannot overflow the stack. */
function visibleText($: cheerio.CheerioAPI): string {
  const out: string[] = [];
  const stack: unknown[] = [...($.root().get(0)?.children ?? [])].reverse();
  while (stack.length) {
    const node = stack.pop() as { type: string; data?: string; name?: string; children?: unknown[] };
    if (node.type === "text") {
      if (node.data) out.push(node.data);
    } else if (node.type === "tag" && !(node.name && SKIP_TEXT.has(node.name)) && node.children) {
      for (let i = node.children.length - 1; i >= 0; i--) stack.push(node.children[i]);
    } else if (node.type === "root" && node.children) {
      for (let i = node.children.length - 1; i >= 0; i--) stack.push(node.children[i]);
    }
  }
  return tidy(out.join(" "));
}

function jsonLdTypes($: cheerio.CheerioAPI): string[] {
  const types: string[] = [];
  const addNode = (n: unknown) => {
    if (!n || typeof n !== "object") return;
    const t = (n as Record<string, unknown>)["@type"];
    for (const v of Array.isArray(t) ? t : t ? [t] : []) {
      if (typeof v === "string") types.push(v.replace(/^https?:\/\/schema\.org\//, ""));
    }
  };
  $('script[type="application/ld+json" i]').each((_, el) => {
    let json: unknown;
    try {
      json = JSON.parse($(el).text());
    } catch {
      return;
    }
    for (const top of Array.isArray(json) ? json : [json]) {
      addNode(top);
      const graph = top && typeof top === "object" ? (top as Record<string, unknown>)["@graph"] : undefined;
      if (Array.isArray(graph)) graph.forEach(addNode);
    }
  });
  return types;
}

const CHALLENGE_TITLE = /^(just a moment|attention required|access denied|checking your browser|verify you are human|security check|please wait|one more step)/i;
const CHALLENGE_MARKERS = /cf-browser-verification|cf-chl|challenge-platform|checking your browser before accessing|enable javascript and cookies to continue|error 1020|sucuri website firewall|incapsula incident/i;
const CAPTCHA_MARKERS = /g-recaptcha|h-captcha|cf-turnstile/i;
const HUMAN_TEXT = /verify you are human|prove you are human|i'?m not a robot|are you a robot/i;
const PARKED = /this domain (is|may be) (for sale|available)|buy this domain|domain (is )?parked|parked (free|domain|page)|domain parking|get this domain|the owner of this domain has not|hugedomains|sedo\.com|afternic|dan\.com\/buy/i;
const MAINTENANCE = /under maintenance|we'?ll be back soon|be right back|coming soon|site is being updated|down for maintenance|scheduled maintenance|website under construction/i;

// Parsing time grows with nesting depth (about 2.7 ms per level: a page nested
// 10,000 deep took 27 seconds), and 100,000 levels fit in 500 KB. Real pages are
// rarely over 100 deep, so anything past this depth is cut off before parsing.
const MAX_NESTING = 300;
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
// Elements whose end tag may be left out: they close themselves, so they do not nest.
const OPTIONAL_END = new Set(["p", "li", "dt", "dd", "tr", "td", "th", "tbody", "thead", "tfoot", "option", "optgroup", "rt", "rp", "colgroup", "caption"]);

/** Cuts the page where it nests deeper than MAX_NESTING. Linear time. */
export function limitNesting(source: string, maxDepth = MAX_NESTING): string {
  const stack: string[] = [];
  const lower = source.toLowerCase();
  let i = 0;
  while (i < source.length) {
    const lt = source.indexOf("<", i);
    if (lt === -1) break;
    const next = source[lt + 1];
    if (next === "!") {
      const end = lower.startsWith("<!--", lt) ? lower.indexOf("-->", lt + 4) : source.indexOf(">", lt);
      i = end === -1 ? source.length : end + 1;
      continue;
    }
    const closing = next === "/";
    const m = /^<\/?([a-z][a-z0-9:-]*)/.exec(lower.slice(lt, lt + 40));
    if (!m) {
      i = lt + 1;
      continue;
    }
    const name = m[1];
    const gt = source.indexOf(">", lt);
    if (gt === -1) break;
    const selfClosing = source[gt - 1] === "/";
    if (closing) {
      const at = stack.lastIndexOf(name);
      if (at !== -1) stack.length = at;
    } else if (!VOID.has(name) && !OPTIONAL_END.has(name) && !selfClosing) {
      if (name === "script" || name === "style" || name === "textarea" || name === "title") {
        // Raw text: nothing inside is markup, so skip to the matching close tag.
        const end = lower.indexOf(`</${name}`, gt);
        i = end === -1 ? source.length : end;
        continue;
      }
      stack.push(name);
      if (stack.length > maxDepth) return source.slice(0, lt);
    }
    i = gt + 1;
  }
  return source;
}

export function analyseHtml(rawSource: string, baseUrl: string): PageSignals {
  let source = rawSource;
  source = limitNesting(source);
  const $ = cheerio.load(source);
  const text = visibleText($);
  const textChars = text.length;

  const links = $("a[href]").map((_, a) => $(a).attr("href") ?? "").get();
  const tel = links.filter((h) => /^tel:/i.test(h.trim())).map((h) => h.trim().slice(4));
  const email = links
    .filter((h) => /^mailto:/i.test(h.trim()))
    .map((h) => h.trim().slice(7).split("?")[0])
    .filter(Boolean);
  const whatsapp = links.filter((h) => /(^|\/\/)(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)\b|^whatsapp:/i.test(h.trim()));
  const phonesInText = extractPhones(text);

  const social: PageSignals["social"] = {};
  for (const href of links) {
    const profile = parseSocialUrl(href, baseUrl);
    if (profile && social[profile.platform] === undefined) social[profile.platform] = profile.handle;
  }

  const types = jsonLdTypes($);
  const scriptCount = $("script").filter((_, el) => !/ld\+json/i.test($(el).attr("type") ?? "")).length;
  const title = orNull(tidy($("title").first().text()));
  const lowerHtml = source.toLowerCase();
  const short = textChars < 600;

  return {
    title,
    description: orNull(tidy($('meta[name="description" i]').first().attr("content"))),
    viewport: $('meta[name="viewport" i]').length > 0,
    canonical: orNull(tidy($('link[rel~="canonical" i]').first().attr("href"))),
    lang: orNull(tidy($("html").first().attr("lang"))),
    h1Count: $("h1").length,
    ogImage: tidy($('meta[property="og:image" i]').first().attr("content")) !== "",
    favicon: $('link[rel~="icon" i], link[rel~="apple-touch-icon" i]').length > 0,
    jsonLdTypes: types,
    hasBusinessSchema: types.some((t) => BUSINESS_TYPES.has(t) || BUSINESS_SUFFIX.test(t)),
    contact: { tel, whatsapp, email, phonesInText, any: tel.length + whatsapp.length + email.length + phonesInText.length > 0 },
    social,
    textChars,
    scriptCount,
    jsBuilt: textChars < 300 && scriptCount >= 3,
    botChallenge:
      short && ((title !== null && CHALLENGE_TITLE.test(title)) || CHALLENGE_MARKERS.test(lowerHtml) || (CAPTCHA_MARKERS.test(lowerHtml) && HUMAN_TEXT.test(text))),
    parked: textChars < 1500 && (PARKED.test(text) || PARKED.test(title ?? "")),
    maintenance: textChars < 400 && MAINTENANCE.test(text),
  };
}
