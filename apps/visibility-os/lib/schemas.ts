import { z } from "zod";

// nullish, not optional: the onboarding form sends explicit nulls (e.g.
// googlePlaceId when no Google listing was picked), which .optional() rejects.
const optionalTrimmed = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((v) => (v && v.length > 0 ? v : null));

export const createBusinessSchema = z.object({
  name: z.string().trim().min(2, "Business name is required").max(120),
  category: optionalTrimmed(80),
  city: optionalTrimmed(80),
  country: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{2,3}$/, "Country must be a 2-3 letter code")
    .transform((v) => v.toUpperCase())
    .default("NG"),
  googlePlaceId: optionalTrimmed(120),
  phoneNumber: optionalTrimmed(30),
  website: optionalTrimmed(300),
  instagramHandle: optionalTrimmed(60).transform((v) => (v ? v.replace(/^@/, "") : v)),
  // A free check made before signing up, to be saved to this account along with the business.
  scanId: optionalTrimmed(64),
});

/** What the owner may change on an existing business. The Google link and the owner are not editable here. */
export const editBusinessSchema = createBusinessSchema.pick({
  name: true,
  category: true,
  city: true,
  phoneNumber: true,
  website: true,
  instagramHandle: true,
});
