// Temporary live-fire test for lib/scoring.ts. Not committed; deleted after run.
import { scoreBusiness, isSafeExternalUrl } from "./lib/scoring.ts";

console.log("SSRF guard:", {
  localhost: isSafeExternalUrl("http://localhost:3000"),
  privateIp: isSafeExternalUrl("http://192.168.1.1"),
  valid: isSafeExternalUrl("toss-enterprise.vercel.app")?.hostname,
});

const full = await scoreBusiness({
  name: "Toss",
  category: "Technology",
  city: "Lagos",
  googleBizUrl: "https://maps.google.com/x",
  phoneNumber: "+2340000000000",
  website: "https://toss-enterprise.vercel.app",
  instagramHandle: "@toss.enterprise",
});
console.log("well-set-up:", {
  total: full.total,
  google: full.googleScore,
  website: full.websiteScore,
  social: full.socialScore,
  items: full.actionItems.map((a) => a.title),
});

const bare = await scoreBusiness({
  name: "Bare",
  category: null,
  city: null,
  googleBizUrl: null,
  phoneNumber: null,
  website: null,
  instagramHandle: null,
});
console.log("bare:", {
  total: bare.total,
  items: bare.actionItems.map((a) => `${a.priority}: ${a.title}`),
});

const dead = await scoreBusiness({
  name: "Dead",
  category: "Retail Store",
  city: "Abuja",
  googleBizUrl: "https://maps.google.com/y",
  phoneNumber: "0801",
  website: "https://this-domain-does-not-exist-xyz123.com",
  instagramHandle: "shop",
});
console.log("dead-site:", { total: dead.total, website: dead.websiteScore, items: dead.actionItems.map((a) => a.title) });
