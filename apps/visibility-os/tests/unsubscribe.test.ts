import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { isValidUnsubscribeToken, unsubscribeUrl } from "@/lib/unsubscribe";
import { isDeliverableEmail, pendingEmail } from "@/lib/utils";

describe("unsubscribe links", () => {
  const saved = process.env.CRON_SECRET;
  beforeEach(() => {
    process.env.CRON_SECRET = "test-secret";
  });
  afterEach(() => {
    if (saved === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = saved;
  });

  function tokenFor(userId: string) {
    return new URL(unsubscribeUrl(userId)!).searchParams.get("t")!;
  }

  it("accepts the token it issued", () => {
    expect(isValidUnsubscribeToken("user_1", tokenFor("user_1"))).toBe(true);
  });

  it("rejects a token issued for a different user", () => {
    expect(isValidUnsubscribeToken("user_2", tokenFor("user_1"))).toBe(false);
  });

  it("rejects garbage and empty tokens", () => {
    expect(isValidUnsubscribeToken("user_1", "nope")).toBe(false);
    expect(isValidUnsubscribeToken("user_1", "")).toBe(false);
  });

  it("issues no link and accepts no token without a secret", () => {
    delete process.env.CRON_SECRET;
    expect(unsubscribeUrl("user_1")).toBeNull();
    expect(isValidUnsubscribeToken("user_1", "a".repeat(32))).toBe(false);
  });

  it("builds the link on the public origin", () => {
    expect(unsubscribeUrl("user_1")).toMatch(
      /^https:\/\/tossvisibilityos\.com\/api\/unsubscribe\?u=user_1&t=[0-9a-f]{32}$/
    );
  });
});

describe("placeholder emails", () => {
  it("are per-user and never deliverable", () => {
    expect(pendingEmail("user_1")).not.toBe(pendingEmail("user_2"));
    expect(isDeliverableEmail(pendingEmail("user_1"))).toBe(false);
    expect(isDeliverableEmail("")).toBe(false);
    expect(isDeliverableEmail("ada@example.com")).toBe(true);
  });
});
