import { describe, expect, it } from "vitest";
import { pollDecision, pollDelayMs } from "@/lib/scan-ui/poll";
import { didYouMean } from "@/lib/scan-ui/typos";

describe("RL-04: polling is gentle", () => {
  it("starts quickly, slows down, and never waits more than 5 seconds", () => {
    expect(pollDelayMs(0)).toBeLessThanOrEqual(1000);
    let last = 0;
    for (let a = 0; a < 200; a++) {
      const d = pollDelayMs(a);
      expect(d).toBeGreaterThanOrEqual(last);
      expect(d).toBeLessThanOrEqual(5000);
      last = d;
    }
  });

  it("makes at most 25 requests in the first minute and at most 45 before giving up at two minutes", () => {
    const count = (limitMs: number) => {
      let t = 0;
      let n = 0;
      while (t < limitMs) {
        t += pollDelayMs(n++);
      }
      return n;
    };
    expect(count(60_000)).toBeLessThanOrEqual(25);
    expect(count(120_000)).toBeLessThanOrEqual(45);
  });

  it.each([
    [{ status: "done", elapsedMs: 4000, hidden: false }, "stop"],
    [{ status: "incomplete", elapsedMs: 4000, hidden: false }, "stop"],
    [{ status: "running", elapsedMs: 4000, hidden: false }, "wait"],
    [{ status: "running", elapsedMs: 4000, hidden: true }, "pause"],
    [{ status: "running", elapsedMs: 121_000, hidden: false }, "give_up"],
    [{ status: "done", elapsedMs: 500_000, hidden: true }, "stop"],
  ] as const)("%j is %s", (state, expected) => {
    expect(pollDecision(state)).toBe(expected);
  });
});

describe("IN-06: typos get a suggestion, never a silent correction", () => {
  it.each([
    ["example.con", "example.com"],
    ["example.cmo", "example.com"],
    ["example.vom", "example.com"],
    ["example.ocm", "example.com"],
    ["www.example.con", "www.example.com"],
    ["http//example.com", "example.com"],
    ["https//example.com", "example.com"],
    ["examplecom", "example.com"],
    ["mybusinesscom", "mybusiness.com"],
    ["shop.example.com.n", "shop.example.com.ng"],
    ["example.com.ng,", "example.com.ng"],
    ["example,com", "example.com"],
  ])("%s -> did you mean %s", (input, suggestion) => {
    expect(didYouMean(input)).toBe(suggestion);
  });

  it.each(["example.com", "example.co", "example.ng", "example.com.ng", "https://example.com", "tossspa", "@tossspa", "", "   ", "my business", "0803 123 4567", "bücher.example"])(
    "%j needs no suggestion",
    (input) => expect(didYouMean(input)).toBeNull()
  );

  it("never returns something unsafe or longer than the input plus a few characters", () => {
    for (const s of ["x".repeat(5000) + ".con", "javascript:alert(1).con", "<script>.con"]) {
      const out = didYouMean(s);
      expect(out === null || (out.length <= s.length + 3 && !/[<>\s]/.test(out))).toBe(true);
    }
  });
});
