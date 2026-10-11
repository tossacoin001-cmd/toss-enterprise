import type { Finding, PlanStep, ScanReport } from "@/lib/scan/types";
import { TOSS_WHATSAPP } from "./constants";
import { HOWTO } from "./howto";
import { PERSONAL_PLAN, isPersonal } from "./personal";

/**
 * Everything a visitor reads on the result page, built as plain data so every rule can be tested
 * without a browser. The React files only draw this. Tests: tests/scan-ui/view.test.ts.
 * Decision A (founder, 2026-10-10): the whole result is shown, nothing is locked, sign-up comes after.
 */

export type ScanApi = { id: string; status: "running" | "done" | "incomplete"; result: ScanReport | null; createdAt: number };
export type ViewContext = { now: number; name?: string | null; city?: string | null; category?: string | null; whatsappNumber?: string };

export type FixView = {
  id: string;
  title: string;
  why: string;
  fix: string;
  minutes: number;
  priority: "Do first" | "Soon" | "Later";
  steps: string[];
  doItForMe: string | null;
};

export type ResultView = {
  state: "running" | "incomplete" | "normal" | "could_not_open" | "dead_domain" | "certificate" | "no_website";
  title: string;
  headline: string;
  nextStep: { title: string; why: string; minutes: number; doItForMe: string | null } | null;
  score:
    | { kind: "number"; value: number; label: string }
    | { kind: "points_available"; points: number; label: string }
    | { kind: "not_scored"; label: string };
  fixes: FixView[];
  good: { id: string; title: string }[];
  couldNot: { id: string; title: string; why: string }[];
  couldNotNote: string | null;
  startHere?: PlanStep[];
  notices: string[];
  signUp: { show: boolean; text: string; dismissible: boolean; emailRequired: false; cardRequired: false };
  ago: string | null;
  canRescan: boolean;
  retry: boolean;
  share: { text: string; path: string };
};

const DAY_MS = 24 * 3600 * 1000;
const PRIORITY_LABEL = { HIGH: "Do first", MEDIUM: "Soon", LOW: "Later" } as const;

/** Visitor-typed text made safe to place in a title or a message: no angle brackets, one line, short. */
const tidy = (s: string | null | undefined, max: number): string => (s ?? "").replace(/[<>\u0000-\u001f]/g, "").replace(/\s+/g, " ").trim().slice(0, max).trim();

export function agoText(createdAt: number, now: number): string {
  const diff = now - createdAt;
  if (diff < 60_000) return "just now";
  const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? "" : "s"} ago`;
  if (diff < 3_600_000) return plural(Math.floor(diff / 60_000), "minute");
  if (diff < DAY_MS) return plural(Math.floor(diff / 3_600_000), "hour");
  return plural(Math.floor(diff / DAY_MS), "day");
}

const STEPS = [
  "Opening your website",
  "Checking that the connection is secure",
  "Reading your page title and description",
  "Checking how your site looks on a phone",
  "Looking for your phone number and WhatsApp",
  "Checking your social links",
];
const STEP_MS = 2500;

/** What the waiting screen says. These are the checks the scan makes; the words never say it is finished. */
export function progressStep(elapsedMs: number): { label: string; index: number } {
  const t = Math.max(0, elapsedMs);
  const index = Math.floor(t / STEP_MS);
  if (index < STEPS.length) return { label: STEPS[index], index };
  const seconds = Math.floor(t / 1000);
  return { label: `Still checking. Some websites are slow to answer (${seconds}s)`, index: STEPS.length + (seconds - Math.ceil((STEPS.length * STEP_MS) / 1000)) };
}

const NOT_SCORED = (label: string) => ({ kind: "not_scored" as const, label });

function emptyView(title: string, state: ResultView["state"], headline: string, id: string, retry: boolean): ResultView {
  return {
    state, title, headline, nextStep: null, score: NOT_SCORED(retry ? "No score, because the check did not finish." : "Your score will show here."),
    fixes: [], good: [], couldNot: [], couldNotNote: null, notices: [],
    signUp: { show: false, text: "", dismissible: true, emailRequired: false, cardRequired: false },
    ago: null, canRescan: false, retry, share: { text: title, path: `/scan/${id}` },
  };
}

export function buildView(api: ScanApi, ctx: ViewContext): ResultView {
  const report = api.result;
  const name = tidy(ctx.name, 60);
  const city = tidy(ctx.city, 40);
  const host = report?.site ? new URL(report.site.finalUrl).hostname.replace(/^www\./, "") : "";
  const title = name ? (city ? `${name} in ${city}` : name) : host || "Your business";

  if (api.status === "running" && !report) return emptyView(title, "running", `Checking ${title}`, api.id, false);
  if (!report || api.status === "incomplete") {
    return emptyView(title, "incomplete", "We could not finish this check. Please try again in a minute.", api.id, true);
  }

  const find = (id: string) => report.findings.find((f) => f.id === id);
  const reach = find("site.reachable");
  const https = find("site.https");

  let state: ResultView["state"] = "normal";
  if (report.path === "no_website") state = "no_website";
  else if (reach?.cause === "domain_not_found") state = "dead_domain";
  else if (https?.cause === "certificate_expired" || https?.cause === "certificate_untrusted" || https?.cause === "certificate_wrong_name") state = "certificate";
  else if (report.score.website === null) state = "could_not_open";

  const personal = isPersonal(report.meta?.category ?? ctx.category);
  const who = name || host || "my business";
  const message = (f: Pick<Finding, "title">) => `Hi Toss, I just ran a free Visibility OS scan for ${who}. Please help me with: ${tidy(f.title, 90)}.`;
  const href = (f: Pick<Finding, "title">) => `https://wa.me/${ctx.whatsappNumber ?? TOSS_WHATSAPP}?text=${encodeURIComponent(message(f))}`;

  // With no social media at all, "open an account" already covers linking it and checking it: show one fix, not three.
  const noSocial = report.findings.some((f) => f.id === "social.present" && f.state === "missing");
  const shown = noSocial ? report.fixes.filter((f) => f.id !== "social.linked" && !(f.id === "social.verified" && f.detail === "none_found")) : report.fixes;
  const fixes: FixView[] = shown.filter((f) => !(personal && f.id === "google.profile")).map((f) => ({
    id: f.id, title: f.title, why: f.why, fix: f.fix, minutes: f.minutes, priority: PRIORITY_LABEL[f.priority], steps: HOWTO[f.id] ?? [], doItForMe: href(f),
  }));

  let nextStep: ResultView["nextStep"] = null;
  const plan = state === "no_website" ? (personal ? [...PERSONAL_PLAN] : report.startHere) : undefined;
  const first = plan?.[0];
  if (state === "no_website" && first) nextStep = { title: first.title, why: first.why, minutes: first.minutes, doItForMe: href(first) };
  else if (fixes[0]) nextStep = { title: fixes[0].title, why: fixes[0].why, minutes: fixes[0].minutes, doItForMe: fixes[0].doItForMe };

  const score: ResultView["score"] =
    report.score.total !== null
      ? { kind: "number", value: report.score.total, label: `${report.score.total} out of 100` }
      : state === "no_website"
        ? { kind: "points_available", points: report.score.pointsAvailable, label: `${report.score.pointsAvailable} points are waiting for you` }
        : NOT_SCORED("We could not check your site this time, so we are not giving a score.");

  const headline = nextStep
    ? `Start with this: ${nextStep.title}`
    : state === "could_not_open"
      ? `We could not look at ${title} this time`
      : `Good news. ${title} has the basics covered.`;

  const couldNot = report.findings.filter((f) => f.state === "could_not_check" && !(personal && f.id === "google.profile")).map((f) => ({ id: f.id, title: f.title, why: f.why }));
  const notices = ["This scan only looks at public information on the internet."];
  if (report.findings.some((f) => f.caveat === "js_built")) notices.push("Your site builds some pages in the browser, so we may have missed things that are there.");
  const unverifiable = (report.meta?.platforms ?? []).filter((p) => p === "instagram" || p === "facebook" || p === "tiktok");
  if (unverifiable.length) notices.push("We cannot look inside Instagram, Facebook or TikTok from outside, so we took your word for those. They are not counted in your score.");
  if (report.site?.movedToOtherDomain) notices.push(`Your address leads to ${host}, so we checked that site.`);

  return {
    state, title, headline, nextStep, score, fixes,
    good: report.findings.filter((f) => f.state === "found" && f.points > 0).map((f) => ({ id: f.id, title: f.title })),
    couldNot,
    couldNotNote: couldNot.length ? "We could not check these, so they are not counted in your score." : null,
    startHere: plan,
    notices,
    signUp: {
      show: true,
      text: "Save this result for free. We will track your score and email you a short weekly list of what to fix next. No card needed.",
      dismissible: true, emailRequired: false, cardRequired: false,
    },
    ago: agoText(api.createdAt, ctx.now),
    canRescan: ctx.now - api.createdAt >= DAY_MS,
    retry: false,
    share: { text: `${title}: my free visibility check`, path: `/scan/${api.id}` },
  };
}
