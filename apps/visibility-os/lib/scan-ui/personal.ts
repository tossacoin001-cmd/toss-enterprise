import type { PlanStep } from "@/lib/scan/types";

/**
 * For a person whose name is the brand (a creator, freelancer, consultant), the first steps are about
 * being easy to find and trust by name, not about a shop listing. Tests: tests/scan-ui/view.test.ts.
 */
export const PERSONAL_PLAN: ReadonlyArray<PlanStep> = [
  { id: "personal.bio", title: "Put your name, what you do and one link in every bio", why: "People who find you in one place should be able to find you everywhere.", cost: "free", minutes: 10 },
  { id: "personal.contact", title: "Make it easy to reach you: add a WhatsApp or email link", why: "A chance to work with you is lost when people cannot find a way to ask.", cost: "free", minutes: 10 },
  { id: "personal.pin", title: "Pin or feature your three best pieces of work", why: "New people decide in seconds, so show your best first.", cost: "free", minutes: 20 },
  { id: "personal.proof", title: "Ask three people you worked with for a short testimonial", why: "What others say about you is trusted more than what you say.", cost: "free", minutes: 30 },
  { id: "personal.site", title: "Get a one-page site with your own name as the address", why: "It is the one place you own, and it comes up when people search your name.", cost: "low", minutes: 60 },
];

/** True when the visitor describes themselves as a person building a name, not a shop. */
export const isPersonal = (category: string | null | undefined): boolean => /\b(personal|creator|freelanc\w*|consultant|influencer|coach|artist|writer|photographer)\b/i.test(category ?? "");
