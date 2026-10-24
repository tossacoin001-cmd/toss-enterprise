import { describe, expect, it } from "vitest";
import { buildDigestEmail, computeDelta, type DigestEntry } from "@/lib/weekly-digest";

const score = (total: number, reviewCount = 0, avgRating = 0) =>
  ({ total, reviewCount, avgRating }) as Parameters<typeof computeDelta>[1];

const links = {
  dashboardUrl: "https://tossvisibilityos.com/dashboard",
  unsubscribeUrl: "https://x.test/u?t=1",
};

describe("computeDelta", () => {
  it("is all zeros for a first score", () => {
    expect(computeDelta(undefined, score(60))).toEqual({ scoreDelta: 0, reviewDelta: 0, ratingDelta: 0 });
  });

  it("reports movement in score, reviews and rating", () => {
    expect(computeDelta(score(60, 10, 4.2), score(66, 14, 4.5))).toEqual({
      scoreDelta: 6,
      reviewDelta: 4,
      ratingDelta: 0.3,
    });
  });
});

describe("buildDigestEmail", () => {
  const steady: DigestEntry = {
    name: "Toss Spa",
    total: 70,
    delta: { scoreDelta: 0, reviewDelta: 0, ratingDelta: 0 },
    topActionItem: {
      key: "social.present",
      title: "Add your Instagram handle",
      description: "Customers check it first.",
      priority: "MEDIUM",
      category: "Social",
    },
  };

  it("leads with the biggest opportunity when nothing moved", () => {
    const { subject, text } = buildDigestEmail([steady], links);
    expect(subject).toContain("Toss Spa");
    expect(text).toContain("holding steady at 70/100");
    expect(text).toContain("Add your Instagram handle");
  });

  it("leads with movement when something changed", () => {
    const moved: DigestEntry = { ...steady, total: 76, delta: { scoreDelta: 6, reviewDelta: 2, ratingDelta: 0 } };
    expect(buildDigestEmail([moved], links).text).toContain("70 -> 76 (+6), 2 new Google reviews");
  });

  it("links back to the dashboard and offers an unsubscribe", () => {
    const { text } = buildDigestEmail([steady], links);
    expect(text).toContain(links.dashboardUrl);
    expect(text).toContain(`Unsubscribe: ${links.unsubscribeUrl}`);
  });

  it("omits the unsubscribe line when no signing secret exists", () => {
    const { text } = buildDigestEmail([steady], { ...links, unsubscribeUrl: null });
    expect(text).not.toContain("Unsubscribe");
  });

  it("uses a plural subject for several businesses", () => {
    expect(buildDigestEmail([steady, { ...steady, name: "Other" }], links).subject).toBe(
      "Your weekly Visibility OS check-in"
    );
  });
});
