import "server-only";

/**
 * Visibility scoring v1: deterministic checks that need no external API keys.
 * Weights: Google presence 40%, website 40%, social 20%.
 * The visibility-agent (docs/03-ai/agents/visibility-agent.md) will extend
 * this with live Google and social data on a schedule; the same subscore
 * fields are reused, so the dashboard needs no changes when it does.
 * Decision record: docs/01-architecture/decisions/0007.
 */

export type BusinessInput = {
  name: string;
  category: string | null;
  city: string | null;
  googleBizUrl: string | null;
  phoneNumber: string | null;
  website: string | null;
  instagramHandle: string | null;
};

export type ActionItemDraft = {
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  category: "Google" | "Website" | "Social" | "Profile";
};

export type ScoreResult = {
  total: number;
  googleScore: number;
  socialScore: number;
  websiteScore: number;
  actionItems: ActionItemDraft[];
};

/** Blocks non-http(s) URLs and private/loopback hosts before a server-side fetch. */
export function isSafeExternalUrl(raw: string): URL | null {
  let url: URL;
  try {
    url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host === "0.0.0.0" ||
    host === "[::1]" ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    !host.includes(".")
  ) {
    return null;
  }
  return url;
}

type WebsiteCheck = {
  score: number;
  actionItems: ActionItemDraft[];
};

async function checkWebsite(rawUrl: string | null): Promise<WebsiteCheck> {
  const actionItems: ActionItemDraft[] = [];

  if (!rawUrl || rawUrl.trim() === "") {
    return {
      score: 0,
      actionItems: [
        {
          title: "Get a website",
          description:
            "You have no website on file. Customers who find you on Google or Instagram have nowhere to go next. Even a one-page site with your services, prices, and WhatsApp button changes that.",
          priority: "HIGH",
          category: "Website",
        },
      ],
    };
  }

  const url = isSafeExternalUrl(rawUrl.trim());
  if (!url) {
    return {
      score: 0,
      actionItems: [
        {
          title: "Fix your website address",
          description: `"${rawUrl}" is not a valid public website address. Update it in your business settings so we can audit the site.`,
          priority: "HIGH",
          category: "Website",
        },
      ],
    };
  }

  let score = 0;
  const startedAt = Date.now();
  let html = "";
  let finalUrl = url;

  try {
    const res = await fetch(url.toString(), {
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
      headers: { "user-agent": "TossVisibilityBot/1.0 (+https://toss-enterprise.vercel.app)" },
    });
    const elapsedMs = Date.now() - startedAt;
    finalUrl = new URL(res.url || url.toString());

    if (!res.ok) {
      return {
        score: 0,
        actionItems: [
          {
            title: "Your website is not loading",
            description: `${url.hostname} responded with an error (HTTP ${res.status}). Anyone clicking through from Google or Instagram right now hits a dead end.`,
            priority: "HIGH",
            category: "Website",
          },
        ],
      };
    }

    score += 30; // reachable
    html = (await res.text()).slice(0, 500_000);

    if (finalUrl.protocol === "https:") {
      score += 20;
    } else {
      actionItems.push({
        title: "Secure your website with HTTPS",
        description:
          "Your site loads over plain HTTP. Browsers mark it 'Not secure', which scares customers off and hurts your Google ranking. Your host can enable HTTPS, usually for free.",
        priority: "HIGH",
        category: "Website",
      });
    }

    if (/<title[^>]*>[^<]{3,}<\/title>/i.test(html)) {
      score += 15;
    } else {
      actionItems.push({
        title: "Add a page title to your website",
        description:
          "Your homepage has no title tag. The title is the blue headline people see on Google; without it, Google guesses and you lose clicks.",
        priority: "MEDIUM",
        category: "Website",
      });
    }

    if (/<meta[^>]+name=["']description["'][^>]+content=["'][^"']{20,}/i.test(html)) {
      score += 15;
    } else {
      actionItems.push({
        title: "Add a search description to your website",
        description:
          "Your homepage has no meta description. That is the text under your name in Google results; a good one tells customers why to pick you.",
        priority: "MEDIUM",
        category: "Website",
      });
    }

    if (/<meta[^>]+name=["']viewport["']/i.test(html)) {
      score += 10;
    } else {
      actionItems.push({
        title: "Make your website mobile-friendly",
        description:
          "Your homepage is missing the mobile viewport setting. Most of your customers browse on phones, and Google ranks mobile-unfriendly sites lower.",
        priority: "HIGH",
        category: "Website",
      });
    }

    if (elapsedMs <= 3000) {
      score += 10;
    } else {
      actionItems.push({
        title: "Speed up your website",
        description: `Your homepage took ${(elapsedMs / 1000).toFixed(1)}s to respond. Slow sites lose visitors before they see anything; aim for under 3 seconds.`,
        priority: "LOW",
        category: "Website",
      });
    }
  } catch {
    return {
      score: 0,
      actionItems: [
        {
          title: "Your website is unreachable",
          description: `We could not reach ${url.hostname} at all. If the site is down or the domain expired, every ad, bio link, and Google listing pointing at it is wasted.`,
          priority: "HIGH",
          category: "Website",
        },
      ],
    };
  }

  return { score, actionItems };
}

function checkGooglePresence(b: BusinessInput): WebsiteCheck {
  const actionItems: ActionItemDraft[] = [];
  let score = 0;

  if (b.googleBizUrl && b.googleBizUrl.trim() !== "") {
    score += 60;
  } else {
    actionItems.push({
      title: "Claim your Google Business Profile",
      description:
        "You have no Google Business Profile on file. It is free, and it is how customers nearby find you on Google Maps and Search. This is the single highest-impact fix on this list.",
      priority: "HIGH",
      category: "Google",
    });
  }

  if (b.phoneNumber && b.phoneNumber.trim() !== "") {
    score += 20;
  } else {
    actionItems.push({
      title: "Add a phone number customers can call",
      description:
        "No phone number is on file. A visible number (ideally WhatsApp-enabled) turns searches into conversations.",
      priority: "MEDIUM",
      category: "Profile",
    });
  }

  if (b.category && b.category.trim() !== "") score += 10;
  if (b.city && b.city.trim() !== "") score += 10;

  return { score, actionItems };
}

function checkSocialPresence(b: BusinessInput): WebsiteCheck {
  const actionItems: ActionItemDraft[] = [];
  let score = 0;

  const handle = (b.instagramHandle ?? "").trim().replace(/^@/, "");
  if (handle.length > 0) {
    score += 70;
    if (/^[A-Za-z0-9._]{2,30}$/.test(handle)) {
      score += 30;
    } else {
      actionItems.push({
        title: "Fix your Instagram handle",
        description: `"${b.instagramHandle}" does not look like a valid Instagram handle. Update it so customers (and our audits) can find your profile.`,
        priority: "LOW",
        category: "Social",
      });
    }
  } else {
    actionItems.push({
      title: "Add your Instagram handle",
      description:
        "No Instagram profile is on file. For local businesses, Instagram is often the first place customers check whether you are real and active.",
      priority: "MEDIUM",
      category: "Social",
    });
  }

  return { score, actionItems };
}

export async function scoreBusiness(b: BusinessInput): Promise<ScoreResult> {
  const [website, google, social] = await Promise.all([
    checkWebsite(b.website),
    Promise.resolve(checkGooglePresence(b)),
    Promise.resolve(checkSocialPresence(b)),
  ]);

  const total = Math.round(0.4 * google.score + 0.4 * website.score + 0.2 * social.score);

  const priorityRank = { HIGH: 0, MEDIUM: 1, LOW: 2 } as const;
  const actionItems = [...google.actionItems, ...website.actionItems, ...social.actionItems].sort(
    (a, z) => priorityRank[a.priority] - priorityRank[z.priority]
  );

  return {
    total,
    googleScore: google.score,
    socialScore: social.score,
    websiteScore: website.score,
    actionItems,
  };
}
