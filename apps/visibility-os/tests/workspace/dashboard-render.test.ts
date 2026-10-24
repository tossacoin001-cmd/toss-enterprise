import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

// The signed-in overview, read as an owner would. Handoff sections 3 and 4D: each state of the data
// looks different, the next three actions lead, and nothing claims more than the code does.

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: () => undefined, refresh: () => undefined }) }));

const { default: DashboardClient } = await import("@/app/(dashboard)/dashboard/DashboardClient");
const { default: ActionPlan } = await import("@/components/workspace/ActionPlan");

const NOW = Date.parse("2026-10-23T10:00:00Z");
const DAY = 86_400_000;
const business = { id: "b1", name: "Toss Spa", category: "Spa", city: "Lagos", googlePlaceId: null as string | null };
const f = (id: string, group: "website" | "social", state: string, points: number) => ({ id, group, state, points, earned: state === "found" ? points : 0 });
const score = (over: Record<string, unknown> = {}) => ({
  total: 62, googleScore: 0, socialScore: 40, websiteScore: 80, reviewCount: 0, avgRating: 0, recordedAt: new Date(NOW - 2 * DAY),
  findings: [f("site.reachable", "website", "found", 25), f("social.present", "social", "found", 40)], ...over,
});
const action = (n: number, over: Record<string, unknown> = {}) => ({
  id: `a${n}`, key: `k${n}`, title: `Do thing ${n}`, description: `Because ${n}`, priority: "MEDIUM", category: "Website", status: "PENDING", note: null, completedAt: null, lastSeenFailingAt: null, ...over,
});

const render = (over: Record<string, unknown> = {}) =>
  renderToStaticMarkup(createElement(DashboardClient, { business, score: score(), actions: [], allBusinesses: [business], googleEnabled: false, now: NOW, ...over } as never));
const text = (html: string) => html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/\s+/g, " ").trim();

describe("no check yet is not a score of zero", () => {
  const t = text(render({ score: null }));
  it("says the check has not been run, offers to run it, and shows no number", () => {
    expect(t).toMatch(/Not checked yet/i);
    expect(t).toMatch(/Run (your )?first check/i);
    expect(t).not.toMatch(/Check again/i);
    expect(t).not.toMatch(/\b0\s*(\/|out of)\s*100/);
  });
});

describe("a genuine zero is shown as a zero", () => {
  it("shows 0, calls it the readiness score, and offers to check again", () => {
    const t = text(render({ score: score({ total: 0, websiteScore: 0, socialScore: 0, findings: [f("site.reachable", "website", "missing", 25)] }) }));
    expect(t).toMatch(/Readiness score/i);
    expect(t).toMatch(/\b0\b/);
    expect(t).toMatch(/Check again/i);
    expect(t).not.toMatch(/Run (your )?first check/i);
    expect(t).not.toMatch(/Not checked yet/i);
  });
});

describe("parts we could not check or that are not connected are not zeros", () => {
  it("with no Google listing, says not connected, never '0 reviews' or a star rating", () => {
    const t = text(render());
    expect(t).toMatch(/Google[^.]{0,40}Not connected/i);
    expect(t).toMatch(/Reviews[^.]{0,40}Not connected/i);
    expect(t).not.toMatch(/\b0 reviews\b/i);
    expect(t).not.toMatch(/★/);
  });

  it("with a listing, zero reviews is a real zero", () => {
    const t = text(render({ business: { ...business, googlePlaceId: "p1" }, score: score({ googleScore: 80, reviewCount: 0 }) }));
    expect(t).toMatch(/0 reviews/i);
  });

  it("a partial check says what share was checked and that the rest is not counted", () => {
    const t = text(render({ score: score({ findings: [f("a", "website", "found", 60), f("b", "website", "could_not_check", 20), f("c", "social", "missing", 20)] }) }));
    expect(t).toMatch(/80%/);
    expect(t).toMatch(/could not check|not counted/i);
  });
});

describe("freshness", () => {
  it("says how old the check is", () => {
    expect(text(render())).toMatch(/Checked 2 days ago/);
  });

  it("a stale check says so and suggests checking again", () => {
    const t = text(render({ score: score({ recordedAt: new Date(NOW - 14 * DAY) }) }));
    expect(t).toMatch(/Checked 14 days ago/);
    expect(t).toMatch(/out of date|older than/i);
  });

  it("a very recent check explains the short wait before checking again", () => {
    const html = render({ score: score({ recordedAt: new Date(NOW - 60_000) }) });
    expect(text(html)).toMatch(/check again in about 4 minutes/i);
    expect(html).toMatch(/<button[^>]*disabled[^>]*>[^<]*Check again/);
  });
});

describe("the next three actions lead the page", () => {
  const many = [action(1, { priority: "LOW" }), action(2, { priority: "HIGH" }), action(3, { priority: "MEDIUM" }), action(4, { priority: "HIGH" }), action(5, { priority: "LOW" }), action(6, { status: "DONE", completedAt: new Date(NOW - DAY) })];

  it("shows exactly the three most important open actions, high first, and points to the full plan", () => {
    const t = text(render({ actions: many }));
    const shown = [...t.matchAll(/Do thing (\d)/g)].map((m) => m[1]);
    expect(shown.slice(0, 3)).toEqual(["2", "4", "3"]);
    expect(new Set(shown).size).toBe(3);
    expect(render({ actions: many })).toMatch(/href="\/actions[^"]*"/);
  });

  it("summarises progress in words", () => {
    const t = text(render({ actions: [action(1), action(2, { status: "IN_PROGRESS" }), action(3, { status: "DONE" }), action(4, { status: "DONE" })] }));
    expect(t).toMatch(/1 to do/i);
    expect(t).toMatch(/1 in progress/i);
    expect(t).toMatch(/2 done/i);
  });

  it("with nothing open, says so without calling it a failure", () => {
    const t = text(render({ actions: [action(1, { status: "DONE" })] }));
    expect(t).toMatch(/nothing (left )?to do|all done/i);
    expect(t).not.toMatch(/error|failed/i);
  });
});

describe("it says only what is true", () => {
  const html = render({ actions: [action(1)] });
  const t = text(html);

  it("never calls the checks AI, and never advertises a plan that cannot be bought", () => {
    expect(t).not.toMatch(/AI[- ](audit|generated|powered|action|written)|artificial intelligence/i);
    expect(t).not.toMatch(/upgrade/i);
  });

  it("has one main heading, and every button and link has words", () => {
    expect((html.match(/<h1\b/g) ?? []).length).toBe(1);
    for (const m of html.matchAll(/<(a|button)\b[^>]*>([\s\S]*?)<\/\1>/g)) {
      const label = text(m[2]) || m[0].match(/aria-label="([^"]+)"/)?.[1] || "";
      expect(label.length, m[0].slice(0, 100)).toBeGreaterThan(1);
    }
  });

  it("priority and status are words, not only colours", () => {
    expect(t).toMatch(/Medium priority|Priority: Medium/i);
    expect(t).toMatch(/To do|In progress|Done/);
  });
});

describe("ActionPlan: one action at a time, with the right buttons", () => {
  const plan = (items: unknown[], extra: Record<string, unknown> = {}) => renderToStaticMarkup(createElement(ActionPlan, { businessId: "b1", items, now: NOW, ...extra } as never));

  it("a to-do item offers Start and Mark done", () => {
    const t = text(plan([action(1)]));
    expect(t).toMatch(/Start/);
    expect(t).toMatch(/Mark done/);
    expect(t).not.toMatch(/Reopen/);
  });

  it("an item in progress offers Mark done and Back to to-do", () => {
    const t = text(plan([action(1, { status: "IN_PROGRESS" })]));
    expect(t).toMatch(/Mark done/);
    expect(t).toMatch(/Back to to-do/);
  });

  it("a done item offers Reopen, and shows when it was done", () => {
    const t = text(plan([action(1, { status: "DONE", completedAt: new Date(NOW - 2 * DAY) })], { filter: "all" }));
    expect(t).toMatch(/Reopen/);
    expect(t).toMatch(/Done 2 days ago/);
  });

  it("a done item that the last check still finds says so plainly and offers to reopen it", () => {
    const t = text(plan([action(1, { status: "DONE", completedAt: new Date(NOW - 2 * DAY), lastSeenFailingAt: new Date(NOW - DAY) })], { filter: "all" }));
    expect(t).toMatch(/still found|still showing|still fails/i);
    expect(t).toMatch(/Reopen/);
  });

  it("shows the owner's note and a way to add one", () => {
    const t = text(plan([action(1, { note: "Asked Ada to do it" })]));
    expect(t).toMatch(/Asked Ada to do it/);
    expect(t).toMatch(/note/i);
  });

  it("filters by status, and says when a filter has nothing in it", () => {
    const items = [action(1), action(2, { status: "DONE" })];
    expect(text(plan(items, { filter: "open" }))).toMatch(/Do thing 1/);
    expect(text(plan(items, { filter: "open" }))).not.toMatch(/Do thing 2/);
    expect(text(plan(items, { filter: "done" }))).toMatch(/Do thing 2/);
    expect(text(plan([action(1)], { filter: "done" }))).toMatch(/Nothing here yet/i);
  });

  it("every item's text is shown as text, never as markup", () => {
    const html = plan([action(1, { title: "<img src=x onerror=alert(1)>", note: "<script>alert(2)</script>" })]);
    expect(html).not.toMatch(/<img src=x/);
    expect(html).not.toMatch(/<script>alert/);
  });
});
