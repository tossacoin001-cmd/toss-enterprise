import type { Evidence, FindingCause, Group, PlanStep, Priority } from "./types";

/**
 * Every sentence an owner can be shown, in one place, so it can all be audited
 * (tests/engine/copy.test.ts): plain words, no jargon in titles and reasons, no
 * blame, and nothing that sounds certain unless we actually know.
 *
 * Each finding says what it is (title), why it matters to customers or money
 * (why), and how to fix it in a sentence or two (fix). `certain` marks wording
 * that may use certain-sounding words ("does not exist", "has expired").
 */

export type Detail = "broken_link" | "none_found";

type Variant = {
  state: Evidence;
  cause?: FindingCause;
  caveat?: "js_built";
  detail?: Detail;
  certain: boolean;
  title: string;
  why: string;
  fix: string;
};

type Entry = { group: Group; priority: Priority; minutes: number; points: number; tech?: string; variants: Variant[] };

const found = (title: string, why: string, fix = "Nothing to fix here. Keep it up to date."): Variant => ({ state: "found", certain: true, title, why, fix });
const missing = (title: string, why: string, fix: string, extra: Partial<Variant> = {}): Variant => ({ state: "missing", certain: true, title, why, fix, ...extra });
const couldNot = (subject: string): Variant => ({
  state: "could_not_check",
  certain: false,
  title: `We could not check ${subject}`,
  why: `We could not open your page from our side, so ${subject} is not counted in your score.`,
  fix: "Make sure your website opens for everyone, then run the check again.",
});
const SAME_JS = "but sites built with JavaScript can hide it from us";

const CATALOG: Record<string, Entry> = {
  "site.reachable": {
    group: "website", priority: "HIGH", minutes: 30, points: 25,
    variants: [
      found("Your website opens", "Customers can open your website, which is the first step to winning them.", "Nothing to fix here. Keep your hosting and address paid up."),
      missing(
        "This web address does not exist",
        "No website answers at this address, so customers who type it or tap your link find nothing.",
        "Check the spelling in your settings. If it is right, your domain may have expired, so renew it with your domain seller.",
        { cause: "domain_not_found" }
      ),
      { ...couldNot("your website"), title: "Your home page answered \"not found\" to our check", why: "We could not confirm this: our check got a \"not found\" answer, but visitors may see your page. It is not counted in your score.", fix: "If your site opens on your phone, ignore this; if not, ask your website builder to fix your home page.", cause: "not_found" },
      missing("Your website returned an error when we visited", "Your site answered with an error twice, so visitors may see an error instead of your business.", "Ask your host to check the site. If it keeps happening, move to a steadier host.", { cause: "server_error", certain: false }),
      missing("This address is a file, not a web page", "Visitors who open this address download or see a file, not your website.", "Point this address to your home page instead of a file.", { cause: "not_html" }),
      missing("Your address sends visitors round in circles", "The address keeps passing visitors to another address and never shows a page.", "Ask your website builder to fix it so the address ends on one page.", { cause: "too_many_redirects" }),
      missing("This address shows a parked page, not a website", "The address is not set up with a real website yet, so customers see a placeholder page.", "Build or connect your website to this address, or tell us the right address.", { cause: "parked" }),
      { ...couldNot("your website"), title: "We could not reach your website in time", why: "We could not reach your website from our side, so it is not counted in your score. It may be slow, or it may block automatic visitors.", fix: "Check that your site opens on your phone. If it does, run the check again later.", cause: "timeout" },
      { ...couldNot("your website"), title: "We could not connect to your website", why: "We could not connect to your website from our side, so it is not counted in your score. This is often temporary.", fix: "Check that your site opens on your phone, then run the check again later.", cause: "connection_failed" },
      { ...couldNot("your website"), title: "Your website blocked our check", why: "Your website blocked our check, which is common with protective services, so it is not counted in your score.", fix: "If you use a protection service, allow our visits or run the check again later.", cause: "blocked" },
      { ...couldNot("this address"), title: "We could not check this address", why: "We are not able to check this address, so it is not counted in your score.", fix: "Enter the address of your website.", cause: "unsafe_address" },
      { ...couldNot("this address"), title: "We could not read this address", why: "We could not read this as a website address, so it is not counted in your score.", fix: "Enter the address of your website.", cause: "invalid_url" },
      { ...couldNot("your website"), title: "We could not check your website yet", why: "We could not open your website from our side, so it is not counted in your score.", fix: "Run the check again later, or make sure your website opens for everyone." },
    ],
  },
  "site.https": {
    group: "website", priority: "HIGH", minutes: 20, points: 15, tech: "HTTPS and certificate",
    variants: [
      found("Your site uses a secure connection", "A secure connection shows a padlock in browsers, and customers trust it."),
      missing("Your site does not use a secure connection", "Browsers warn visitors that the site is not secure. That scares customers away and can lower your place on Google.", "Ask your host to turn on a free security certificate for your site."),
      missing("Your security certificate has expired", "Browsers warn visitors when a certificate has expired, and many leave at once.", "Ask your host to renew the certificate today. It is usually free and quick.", { cause: "certificate_expired" }),
      missing("Browsers do not trust your security certificate", "Visitors see a big warning before your site loads, and most of them leave.", "Ask your host to install a proper certificate from a trusted provider.", { cause: "certificate_untrusted" }),
      missing("Your security certificate is for a different address", "Browsers show a warning because the certificate does not match your address.", "Ask your host to issue a certificate for your exact address.", { cause: "certificate_wrong_name" }),
      couldNot("your secure connection"),
    ],
  },
  "site.cert_expiring": {
    group: "website", priority: "MEDIUM", minutes: 15, points: 0,
    variants: [missing("Your security certificate ends soon", "If it ends, browsers will warn your visitors and many will leave.", "Ask your host to renew it this week.")],
  },
  "page.title": {
    group: "website", priority: "MEDIUM", minutes: 10, points: 10, tech: "page title tag",
    variants: [
      found("Your page has a title", "The title is the headline customers see on Google and in their browser tab."),
      missing("Your home page has no title", "The title is the headline people see on Google and in browser tabs. Without it, you lose clicks.", "Add a short title with your name and what you do, like \"Toss Spa, massages in Lekki\"."),
      couldNot("your page title"),
    ],
  },
  "page.description": {
    group: "website", priority: "MEDIUM", minutes: 10, points: 10, tech: "meta description",
    variants: [
      found("Your page has a short description for Google", "This short text under your name on Google tells customers why to choose you."),
      missing("Your home page has no short description for Google", "This is the short text under your name on Google. A good one tells customers why to choose you.", "Write one or two sentences about what you offer and where, and add it in your page settings."),
      missing("We did not find a short description for Google", `This is the short text under your name on Google. We did not find one in the page we received, ${SAME_JS}.`, "Check your page settings. If it is already there, you can ignore this.", { caveat: "js_built" }),
      couldNot("your short description for Google"),
    ],
  },
  "page.mobile": {
    group: "website", priority: "HIGH", minutes: 15, points: 8, tech: "viewport tag",
    variants: [
      found("Your site is set up for phones", "Most of your customers browse on phones, and your site fits their screens."),
      missing("Your site may not fit phone screens", "Most of your customers browse on phones, and Google ranks sites that do not fit phones lower.", "Ask your website builder to make the site fit phone screens."),
      couldNot("whether your site fits phones"),
    ],
  },
  "page.heading": {
    group: "website", priority: "LOW", minutes: 10, points: 4, tech: "h1 heading",
    variants: [
      found("Your page has a main heading", "A clear heading tells visitors and Google what your business does at a glance."),
      missing("Your home page has no main heading", "A clear heading tells visitors and Google what your business does at a glance.", "Put your business name and what you do in a large heading at the top of your page."),
      missing("We did not find a main heading", `A clear heading tells visitors what you do at a glance. We did not find one in the page we received, ${SAME_JS}.`, "Check your page. If it already has a large heading at the top, you can ignore this.", { caveat: "js_built" }),
      couldNot("your main heading"),
    ],
  },
  "page.canonical": {
    group: "website", priority: "LOW", minutes: 10, points: 4, tech: "canonical tag",
    variants: [
      found("Your page tells Google its main address", "This stops Google from treating copies of your page as separate pages."),
      missing("Your page does not name its main address", "Without it, Google may treat copies of your page as separate pages and split your ranking.", "Ask your website builder to set the main address for each page."),
      couldNot("your page's main address"),
    ],
  },
  "trust.contact": {
    group: "website", priority: "HIGH", minutes: 15, points: 8,
    variants: [
      found("Customers can see how to reach you", "A phone number or chat button helps visitors become customers."),
      missing("Customers cannot see a phone number or WhatsApp link", "Visitors who cannot find a number or chat button often leave instead of looking for one.", "Add your phone number and a WhatsApp chat button near the top of your page."),
      missing("We did not find a phone number or WhatsApp link", `Visitors who cannot find a number or chat button often leave. We did not find one in the page we received, ${SAME_JS}.`, "Check your page. If your number and chat button already show, you can ignore this.", { caveat: "js_built" }),
      couldNot("your contact details"),
    ],
  },
  "trust.schema": {
    group: "website", priority: "LOW", minutes: 30, points: 6, tech: "LocalBusiness schema (JSON-LD)",
    variants: [
      found("Search engines can read your business details", "Google can show your hours, area and phone number more clearly."),
      missing("Search engines cannot read your business details", "Google shows your hours, area and phone number more clearly when your site gives them in a form it can read.", "Ask your website builder to add your business details in the form Google reads."),
      missing("We did not find business details that Google can read", `Google shows your hours and area more clearly when your site gives them in a form it can read. We did not find them in the page we received, ${SAME_JS}.`, "Ask your website builder whether they are added. If so, you can ignore this.", { caveat: "js_built" }),
      couldNot("your business details for Google"),
    ],
  },
  "find.robots_sitemap": {
    group: "website", priority: "LOW", minutes: 20, points: 4, tech: "robots.txt and sitemap.xml",
    variants: [
      found("Search engines can find your pages", "A list of your pages helps Google find and show all of them."),
      missing("Search engines have no list of your pages", "A list of your pages helps Google find and show all of them, not only the first one.", "Ask your website builder to create the page list and the file that guides search engines."),
      { state: "could_not_check", certain: false, title: "We could not check your page list", why: "We could not reach these files from our side, so they are not counted in your score.", fix: "Run the check again later." },
    ],
  },
  speed: {
    group: "website", priority: "LOW", minutes: 60, points: 6,
    variants: [
      found("Your site opens quickly for us", "It opened quickly when we visited from our server, which keeps visitors from leaving."),
      missing("Your site opens slowly for us", "It took a while to open when we visited from our server. Slow sites lose visitors before they see anything.", "Ask your host about a faster plan, and shrink large pictures."),
      { state: "could_not_check", certain: false, title: "We could not time your site fairly", why: "We could not time your site fairly from our side, so it is not counted in your score.", fix: "Run the check again later." },
    ],
  },
  "social.present": {
    group: "social", priority: "MEDIUM", minutes: 20, points: 40,
    variants: [
      found("You are active on social media", "Customers look at Instagram or Facebook to see if a business is real."),
      missing("We found no social media for your business", "Customers look at Instagram or Facebook to see if a business is real.", "Open an account on the platform your customers use, and link it from your website."),
      { state: "could_not_check", certain: false, title: "We could not confirm your social accounts", why: "We cannot confirm Instagram, Facebook or TikTok accounts, so this is not in your score.", fix: "Link your account from your website, so customers and our check can find it." },
    ],
  },
  "social.linked": {
    group: "social", priority: "MEDIUM", minutes: 10, points: 30,
    variants: [
      found("Your website links to your social media", "Visitors who like what they see can follow you in one tap."),
      missing("Your website does not link to your social media", "Visitors who like what they see look for your social pages, and a link makes it easy.", "Add your Instagram, Facebook or TikTok link in the footer of your website."),
      missing("We did not find social links on your website", `Visitors who like what they see look for your social pages. We did not find links in the page we received, ${SAME_JS}.`, "Check the bottom of your page. If the links already show, you can ignore this.", { caveat: "js_built" }),
      couldNot("your social links"),
    ],
  },
  "social.verified": {
    group: "social", priority: "MEDIUM", minutes: 10, points: 30,
    variants: [
      found("Your social links lead to live profiles", "Customers who tap your social links find real, active pages."),
      missing("We found no social profile to check", "Without a profile there is nothing for customers to follow.", "Open one account and link it from your website.", { detail: "none_found" }),
      missing("A social link on your website leads nowhere", "Visitors who tap it find an empty page, which makes the business look neglected.", "Open each social link on your site and correct the ones that do not work.", { detail: "broken_link" }),
      { state: "could_not_check", certain: false, title: "We could not confirm your social profiles", why: "We cannot confirm Instagram, Facebook or TikTok accounts, so this is not in your score.", fix: "Keep your links up to date, and check them yourself from time to time." },
    ],
  },
  "site.none": {
    group: "website", priority: "HIGH", minutes: 60, points: 0,
    variants: [missing("Add a website of your own", "Customers who find you on Instagram or Google have nowhere to go next. A simple site with your services, prices and a WhatsApp button turns visitors into customers.", "Start with a one-page site: your services, your prices and a WhatsApp button.")],
  },
  "google.profile": {
    group: "google", priority: "HIGH", minutes: 20, points: 0,
    variants: [
      found("Your Google listing is connected", "Customers who search for you on Google and Maps see your real details."),
      missing("We could not find your business on Google", "Most local customers look on Google Maps first, and a listing puts you in front of them.", "Claim your free Google Business Profile and add your phone number, hours and photos."),
      { state: "could_not_check", certain: false, title: "Connect your Google listing after you sign up", why: "We cannot look up your Google listing yet, so this is not counted in your score. It is the biggest step for local customers.", fix: "Sign up to connect it, or claim your free Google Business Profile today." },
    ],
  },
};

export const FINDING_IDS = Object.keys(CATALOG);

export type CopyQuery = { state: Evidence; cause?: FindingCause; caveat?: "js_built"; detail?: Detail };

/** The best wording for a finding: the variant that matches the most of what we know. */
export function variantFor(id: string, q: CopyQuery): Variant & { tech?: string } {
  const entry = CATALOG[id];
  if (!entry) throw new Error(`no copy for finding ${id}`);
  let best: Variant | undefined;
  let bestScore = -1;
  for (const v of entry.variants) {
    if (v.state !== q.state) continue;
    if (v.cause !== undefined && v.cause !== q.cause) continue;
    if (v.caveat !== undefined && v.caveat !== q.caveat) continue;
    if (v.detail !== undefined && v.detail !== q.detail) continue;
    const score = (v.cause ? 4 : 0) + (v.caveat ? 2 : 0) + (v.detail ? 1 : 0);
    if (score > bestScore) {
      best = v;
      bestScore = score;
    }
  }
  if (!best) throw new Error(`no ${q.state} copy for ${id} (${q.cause ?? q.caveat ?? q.detail ?? "default"})`);
  return { ...best, tech: entry.tech };
}

export function entryMeta(id: string): { group: Group; priority: Priority; minutes: number; points: number } {
  const { group, priority, minutes, points } = CATALOG[id];
  return { group, priority, minutes, points };
}

// ---- the "Start here" plan for people with no website yet ----------------------------------

export const PLAN: ReadonlyArray<PlanStep> = [
  { id: "google.profile", title: "Claim your free Google Business Profile", why: "Most local customers find businesses on Google Maps first, and it costs you nothing.", cost: "free", minutes: 20 },
  { id: "whatsapp.business", title: "Set up WhatsApp Business with your services", why: "Customers can message you in one tap, and you can show your prices and photos.", cost: "free", minutes: 15 },
  { id: "social.bio", title: "Put your phone number, area and a link in your social bio", why: "People who like your posts then know how to reach you.", cost: "free", minutes: 10 },
  { id: "reviews.first10", title: "Ask your first ten customers for a Google review", why: "Reviews make new customers trust you faster than anything you write yourself.", cost: "free", minutes: 30 },
  { id: "website.first", title: "Get a simple website of your own", why: "Your own site is where customers go to learn more, and it works with your Google and social pages.", cost: "low", minutes: 60 },
];

// ---- for the audit tests --------------------------------------------------------------------

export type CopyEntry = {
  id: string;
  field: "title" | "why" | "fix";
  state: Evidence;
  cause?: FindingCause;
  caveat?: "js_built";
  detail?: Detail;
  certain: boolean;
  text: string;
};

/** Every customer-facing sentence, flattened, so tests can audit all of it at once. */
export function allCustomerCopy(): CopyEntry[] {
  const out: CopyEntry[] = [];
  for (const id of FINDING_IDS) {
    for (const v of CATALOG[id].variants) {
      for (const field of ["title", "why", "fix"] as const) {
        out.push({ id, field, state: v.state, cause: v.cause, caveat: v.caveat, detail: v.detail, certain: v.certain, text: v[field] });
      }
    }
  }
  for (const step of PLAN) {
    out.push({ id: `plan.${step.id}`, field: "title", state: "missing", certain: true, text: step.title });
    out.push({ id: `plan.${step.id}`, field: "why", state: "missing", certain: true, text: step.why });
  }
  return out;
}
