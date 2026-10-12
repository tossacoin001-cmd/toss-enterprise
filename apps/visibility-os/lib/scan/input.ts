import { isIP } from "node:net";
import { extractPhones, normalizeWhatsapp } from "./phone";
import type { SocialPlatform } from "./types";

/**
 * What did the owner paste into the website box? Social profiles, phone
 * numbers, WhatsApp links, Google Maps links and link pages are all common, and
 * each should go to the right place instead of being scanned as a website or
 * rejected with an error. Tests: tests/engine/input.test.ts.
 */

export type InputKind =
  | { kind: "empty" }
  | { kind: "website"; url: string }
  | { kind: "social"; platform: SocialPlatform; handle: string }
  | { kind: "handle"; handle: string }
  | { kind: "whatsapp"; e164: string }
  | { kind: "phone"; e164: string }
  | { kind: "google_maps" }
  | { kind: "link_page"; host: string }
  | { kind: "ip" }
  | { kind: "local" }
  | { kind: "invalid" };

const MAX_LENGTH = 2000;
const BAD_SCHEMES = /^(javascript|data|file|vbscript|mailto|tel|ftp|gopher|ws|wss|blob):/i;
const INTERNAL = [".local", ".localhost", ".internal", ".lan", ".home.arpa", ".corp", ".intranet", ".private"];
const LINK_PAGES = ["linktr.ee", "bio.link", "beacons.ai", "carrd.co", "linkin.bio", "lnk.bio", "campsite.bio", "taplink.cc", "solo.to", "stan.store"];

const withoutPrefix = (host: string) => host.replace(/^(www|m|mobile|web|l)\./, "");
const clean = (s: string) => decodeURIComponent(s).replace(/^@/, "").trim().toLowerCase();

function social(host: string, path: string[], search: URLSearchParams): InputKind | null {
  const first = path[0] ?? "";
  const make = (platform: SocialPlatform, handle: string): InputKind =>
    handle ? { kind: "social", platform, handle } : { kind: "invalid" };

  if (host === "instagram.com" || host === "instagr.am") {
    return ["p", "reel", "reels", "explore", "accounts", "stories", "tv"].includes(first) ? { kind: "invalid" } : make("instagram", clean(first));
  }
  if (host === "facebook.com" || host === "fb.com" || host === "fb.me") {
    if (first === "profile.php") return make("facebook", search.get("id") ? `id:${search.get("id")}` : "");
    return ["sharer", "sharer.php", "share", "dialog", "plugins", "groups", "events", "watch", "marketplace"].includes(first) ? { kind: "invalid" } : make("facebook", clean(first));
  }
  if (host === "tiktok.com") return first.startsWith("@") ? make("tiktok", clean(first)) : { kind: "invalid" };
  if (host === "x.com" || host === "twitter.com") {
    return ["intent", "share", "home", "i", "search", "hashtag"].includes(first) ? { kind: "invalid" } : make("x", clean(first));
  }
  if (host === "linkedin.com") {
    if (first === "company") return make("linkedin", clean(path[1] ?? ""));
    // A person's page is not a company page and cannot be looked up from a server, so it keeps its "in/" marker:
    // the social check never asks LinkedIn for it and never calls it broken.
    if (first === "in") return path[1] ? make("linkedin", `in/${clean(path[1])}`) : { kind: "invalid" };
    return { kind: "invalid" };
  }
  if (host === "youtube.com" || host === "youtu.be") {
    if (first.startsWith("@")) return make("youtube", `@${clean(first)}`);
    if (["channel", "c", "user"].includes(first) && path[1]) return make("youtube", `${first}/${path[1]}`);
    return { kind: "invalid" };
  }
  return null;
}

/** A profile (not a share button or a post) behind a link on a page, or null. */
export function parseSocialUrl(href: string, base: string): { platform: SocialPlatform; handle: string } | null {
  let url: URL;
  try {
    url = new URL(href, base);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = withoutPrefix(url.hostname.toLowerCase());
  const found = social(host, url.pathname.split("/").filter(Boolean), url.searchParams);
  return found && found.kind === "social" ? { platform: found.platform, handle: found.handle } : null;
}

export function classifyWebsiteInput(raw: string): InputKind {
  const text = raw.trim();
  if (!text) return { kind: "empty" };
  if (text.length > MAX_LENGTH) return { kind: "invalid" };

  // A phone number: only phone characters, and a number we recognise.
  // (Anything made only of digits that is not a phone number, such as 93.184.216.34, falls through.)
  if (/^[+\d\s().-]+$/.test(text)) {
    const phones = extractPhones(text);
    if (phones.length === 1) return { kind: "phone", e164: phones[0] };
  }
  if (/^@[A-Za-z0-9._]{2,30}$/.test(text)) return { kind: "handle", handle: text.slice(1).toLowerCase() };
  if (BAD_SCHEMES.test(text) || /\s/.test(text)) return { kind: "invalid" };

  let url: URL;
  try {
    url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(text) ? text : `https://${text}`);
  } catch {
    return { kind: "invalid" };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return { kind: "invalid" };

  const rawHost = url.hostname.toLowerCase().replace(/\.$/, "");
  if (rawHost.startsWith("[") || isIP(rawHost) !== 0) return { kind: "ip" };
  if (url.username || url.password || url.port) return { kind: "invalid" };
  if (!rawHost.includes(".") || INTERNAL.some((s) => rawHost.endsWith(s))) return { kind: "local" };

  const host = withoutPrefix(rawHost);
  const path = url.pathname.split("/").filter(Boolean);

  if (host === "wa.me" || host === "api.whatsapp.com" || host === "whatsapp.com") {
    const w = normalizeWhatsapp(url.toString());
    return w ? { kind: "whatsapp", e164: w.e164 } : { kind: "link_page", host };
  }
  if (
    (host === "goo.gl" && path[0] === "maps") || host === "maps.app.goo.gl" || host === "maps.google.com" || host === "g.page" ||
    (/^google\.[a-z.]+$/.test(host) && path[0] === "maps")
  ) {
    return { kind: "google_maps" };
  }
  if (LINK_PAGES.some((p) => host === p || host.endsWith(`.${p}`))) return { kind: "link_page", host };

  const s = social(host, path, url.searchParams);
  if (s) return s;

  return { kind: "website", url: url.toString() };
}

const PLATFORM_NAME: Record<SocialPlatform, string> = {
  instagram: "Instagram", facebook: "Facebook", tiktok: "TikTok", x: "X", youtube: "YouTube", linkedin: "LinkedIn",
};

/** A short, friendly message for something that is not a website, or null for a website. */
export function describeInput(input: InputKind): string | null {
  switch (input.kind) {
    case "website":
      return null;
    case "empty":
      return "Paste or type your website address, like yourbusiness.com.";
    case "social": {
      const name = PLATFORM_NAME[input.platform];
      const noun = input.platform === "facebook" ? "page" : "profile";
      return `That looks like your ${name} ${noun}, not a website. We can use it to check your ${name}. You can add your website separately.`;
    }
    case "handle":
      return "That looks like a social media handle, not a website. We can use it to check your profile. You can add your website separately.";
    case "whatsapp":
      return "That is a WhatsApp chat link, not a website. We will use the number for your chat button. You can add your website separately.";
    case "phone":
      return "That looks like a phone number, not a website. We can keep it as your contact number. Enter your website address if you have one.";
    case "google_maps":
      return "That is a Google Maps link, not a website. Your Google listing matters a lot, and we will help you connect it after you sign up.";
    case "link_page":
      return "That is a link page, not a full website of your own. We can look at it, but a proper website helps you more.";
    case "ip":
      return "That is a set of numbers, not a website address. Enter your website address, like yourbusiness.com.";
    case "local":
      return "That is not a public website address. Enter your real website address, like yourbusiness.com.";
    case "invalid":
      return "We could not read that as a website address. Try something like yourbusiness.com.";
  }
}
