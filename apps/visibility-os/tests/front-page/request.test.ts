import { describe, expect, it } from "vitest";
import { buildScanRequest } from "@/lib/scan-ui/request";

// What each audience's form sends to the scan. The API is already tested (tests/scan-limits); this
// pins what the page puts into it, so a person is never scanned as a shop.

describe("buildScanRequest", () => {
  it("business: just the website address and the safety token", () => {
    expect(buildScanRequest("business", { website: "  toss.example " }, "tok")).toEqual({ website: "toss.example", token: "tok" });
  });

  it("business on Instagram or WhatsApp: name, area, what you do, Instagram and WhatsApp", () => {
    expect(buildScanRequest("social", { name: "Ada Salon", city: "Lagos", category: "Hair salon", instagram: "@adasalon", whatsapp: "0803 123 4567" }, "tok")).toEqual({
      name: "Ada Salon", city: "Lagos", category: "Hair salon", handles: { instagram: "@adasalon" }, whatsapp: "0803 123 4567", token: "tok",
    });
  });

  it("a person is sent as a personal brand even if they leave 'what you do' empty", () => {
    const r = buildScanRequest("personal", { name: "Ada Creates", instagram: "adacreates", x: "adacreates", linkedin: "ada-creates" }, "tok");
    expect(r).toMatchObject({ name: "Ada Creates", category: "Personal brand", handles: { instagram: "adacreates", x: "adacreates", linkedin: "ada-creates" } });
  });

  it("a person who says what they do keeps their own words", () => {
    const r = buildScanRequest("personal", { name: "Ada", category: "Photographer" }, "tok") as { category: string };
    expect(r.category).toBe("Photographer");
  });

  it("leaves out anything left blank, so nothing empty is sent", () => {
    const r = buildScanRequest("social", { name: "Ada", instagram: "   ", whatsapp: "" }, "tok") as Record<string, unknown>;
    expect(r.handles).toBeUndefined();
    expect(r.whatsapp).toBeUndefined();
    expect(Object.values(r).every((v) => v !== "")).toBe(true);
  });

  it("never sends the wrong audience's fields", () => {
    const r = buildScanRequest("business", { website: "toss.example", name: "x", instagram: "y" }, "tok") as Record<string, unknown>;
    expect(Object.keys(r).sort()).toEqual(["token", "website"]);
  });
});
