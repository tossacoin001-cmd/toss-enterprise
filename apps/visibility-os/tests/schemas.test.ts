import { describe, expect, it } from "vitest";
import { createBusinessSchema } from "@/lib/schemas";

// Regression: onboarding sent googlePlaceId: null when no Google listing was
// picked and the API answered 400 "Expected string, received null", blocking
// every sign-up while no Places key was configured.
describe("createBusinessSchema", () => {
  const base = { name: "Toss Spa" };

  it("accepts explicit nulls for every optional field", () => {
    const parsed = createBusinessSchema.parse({
      ...base,
      category: null,
      city: null,
      googlePlaceId: null,
      phoneNumber: null,
      website: null,
      instagramHandle: null,
    });
    expect(parsed.googlePlaceId).toBeNull();
    expect(parsed.instagramHandle).toBeNull();
  });

  it("turns blank strings into null and defaults the country", () => {
    const parsed = createBusinessSchema.parse({ ...base, city: "   ", website: "" });
    expect(parsed.city).toBeNull();
    expect(parsed.website).toBeNull();
    expect(parsed.country).toBe("NG");
  });

  it("strips the @ from an Instagram handle", () => {
    expect(createBusinessSchema.parse({ ...base, instagramHandle: "@tossenterprise" }).instagramHandle).toBe(
      "tossenterprise"
    );
  });

  it("accepts the code the onboarding form sends for 'Other'", () => {
    expect(createBusinessSchema.parse({ ...base, country: "zz" }).country).toBe("ZZ");
  });

  it("rejects a too-short name and a malformed country", () => {
    expect(createBusinessSchema.safeParse({ name: "a" }).success).toBe(false);
    expect(createBusinessSchema.safeParse({ ...base, country: "OTHER" }).success).toBe(false);
  });
});
