import { describe, expect, it } from "vitest";
import { emailSettings } from "@/lib/email-config";

describe("emailSettings", () => {
  it("is empty when nothing is configured, so the safe defaults apply", () => {
    expect(emailSettings({})).toEqual({ from: undefined, replyTo: undefined });
  });

  it("treats blank values (as left in .env.example) as unset", () => {
    expect(emailSettings({ EMAIL_FROM: "", EMAIL_REPLY_TO: "   " })).toEqual({
      from: undefined,
      replyTo: undefined,
    });
  });

  it("trims and passes through configured values", () => {
    expect(
      emailSettings({
        EMAIL_FROM: " Visibility OS <hello@tossvisibilityos.com> ",
        EMAIL_REPLY_TO: "owner@example.com",
      })
    ).toEqual({ from: "Visibility OS <hello@tossvisibilityos.com>", replyTo: "owner@example.com" });
  });
});
