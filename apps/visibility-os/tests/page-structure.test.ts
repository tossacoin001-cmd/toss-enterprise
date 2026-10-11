import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Structure guards for speed. These read the source because the rules are about
// WHERE things are wired (what loads on which page), and a regression here is
// silent: the site still works, it just gets slower for every visitor.
const src = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

describe("the public front door stays light (QL-01, QL-05, XP-01)", () => {
  it("the root layout does not load Clerk for every visitor", () => {
    const layout = src("app/layout.tsx");
    expect(layout).not.toMatch(/ClerkProvider/);
    expect(layout).not.toMatch(/@clerk\/nextjs/);
  });

  it("the landing page does not import Clerk", () => {
    expect(src("app/page.tsx")).not.toMatch(/@clerk/);
  });

  it.each([
    "app/(auth)/layout.tsx",
    "app/(dashboard)/layout.tsx",
  ])("%s mounts the Clerk provider where Clerk is needed", (file) => {
    expect(src(file)).toMatch(/ClerkProvider/);
  });

  it("onboarding gets the provider too, since it sits outside the groups", () => {
    const onboarding = src("app/onboarding/layout.tsx");
    expect(onboarding).toMatch(/ClerkProvider/);
  });
});

describe("sign-in and sign-up are prerendered, not built per visit (QL-04)", () => {
  it.each(["app/(auth)/sign-up/[[...sign-up]]/page.tsx", "app/(auth)/sign-in/[[...sign-in]]/page.tsx"])(
    "%s exports generateStaticParams for the bare path",
    (file) => {
      const page = src(file);
      expect(page).toMatch(/export (async )?function generateStaticParams/);
    }
  );

  it("the auth layout shows a skeleton form while Clerk's script loads", () => {
    expect(src("app/(auth)/layout.tsx")).toMatch(/ClerkLoading/);
  });

});
