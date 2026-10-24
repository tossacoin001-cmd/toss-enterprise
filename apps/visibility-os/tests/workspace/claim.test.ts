import { beforeEach, describe, expect, it, vi } from "vitest";
import { claimScan, prefillFromScan, type ScanRow } from "@/lib/workspace/claim";

// A free check made before signing up becomes the owner's. Claiming must be authorised, safe to repeat,
// and bound to the signed-in user, so nobody can take someone else's result. Handoff section 4C.

const ID = "a".repeat(32);
const NOW = Date.parse("2026-10-23T10:00:00Z");

const scan = (over: Partial<ScanRow> = {}): ScanRow => ({
  id: ID, siteKey: "toss.example", url: "https://toss.example/", status: "done", claimedByUserId: null, expiresAt: new Date(NOW + 5 * 86_400_000),
  result: { meta: { name: "Toss Spa", city: "Lagos", category: "Spa & Wellness", handles: { instagram: "@tossspa", x: "tossspa" } } },
  ...over,
});

function fakeDb(row: ScanRow | null) {
  const state = { row };
  return {
    state,
    scan: {
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) => (state.row && state.row.id === where.id ? state.row : null)),
      // Conditional update: only changes the row if nobody else has claimed it. Returns how many rows changed.
      updateMany: vi.fn(async ({ where, data }: { where: { id: string; OR?: Array<{ claimedByUserId: string | null }> }; data: { claimedByUserId: string; expiresAt: Date } }) => {
        const r = state.row;
        if (!r || r.id !== where.id) return { count: 0 };
        const allowed = (where.OR ?? []).some((c) => c.claimedByUserId === r.claimedByUserId);
        if (!allowed) return { count: 0 };
        state.row = { ...r, claimedByUserId: data.claimedByUserId, expiresAt: data.expiresAt };
        return { count: 1 };
      }),
    },
  };
}

beforeEach(() => vi.clearAllMocks());

describe("claimScan", () => {
  it("an unclaimed finished result becomes the signed-in user's, and no longer expires", async () => {
    const db = fakeDb(scan());
    const r = await claimScan(db, ID, "user1", NOW);
    expect(r).toEqual({ status: "claimed" });
    expect(db.state.row!.claimedByUserId).toBe("user1");
    expect(db.state.row!.expiresAt.getTime()).toBeGreaterThan(NOW + 365 * 86_400_000);
  });

  it("claiming again as the same user changes nothing and still says it is theirs (safe to repeat)", async () => {
    const db = fakeDb(scan({ claimedByUserId: "user1" }));
    const r = await claimScan(db, ID, "user1", NOW);
    expect(r).toEqual({ status: "already_yours" });
    expect(db.scan.updateMany).not.toHaveBeenCalled();
  });

  it("a result claimed by someone else can never be taken, and is described as unavailable", async () => {
    const db = fakeDb(scan({ claimedByUserId: "someone-else" }));
    const r = await claimScan(db, ID, "user2", NOW);
    expect(r).toEqual({ status: "taken" });
    expect(db.state.row!.claimedByUserId).toBe("someone-else");
  });

  it("two people claiming at the same moment: exactly one wins", async () => {
    const db = fakeDb(scan());
    const [a, b] = await Promise.all([claimScan(db, ID, "user1", NOW), claimScan(db, ID, "user2", NOW)]);
    expect([a.status, b.status].sort()).toEqual(["claimed", "taken"]);
    expect(["user1", "user2"]).toContain(db.state.row!.claimedByUserId);
  });

  it("the change is made only if the result is still unclaimed or already theirs, decided by the database in one step", async () => {
    const db = fakeDb(scan());
    await claimScan(db, ID, "user1", NOW);
    const where = db.scan.updateMany.mock.calls[0][0].where;
    expect(where.id).toBe(ID);
    expect(where.OR).toEqual(expect.arrayContaining([{ claimedByUserId: null }, { claimedByUserId: "user1" }]));
  });

  it.each(["", "short", "../../etc/passwd", "A".repeat(32), "g".repeat(32), `${"a".repeat(31)} `, "a".repeat(65)])("a badly formed id %j is refused without touching the database", async (bad) => {
    const db = fakeDb(scan());
    expect(await claimScan(db, bad, "user1", NOW)).toEqual({ status: "invalid" });
    expect(db.scan.findUnique).not.toHaveBeenCalled();
  });

  it("an unknown id, an expired result, and one still running are all 'not available', never an error", async () => {
    expect(await claimScan(fakeDb(null), ID, "u", NOW)).toEqual({ status: "not_found" });
    expect(await claimScan(fakeDb(scan({ expiresAt: new Date(NOW - 1000) })), ID, "u", NOW)).toEqual({ status: "not_found" });
    expect(await claimScan(fakeDb(scan({ status: "running" })), ID, "u", NOW)).toEqual({ status: "not_ready" });
  });
});

describe("prefillFromScan: what the onboarding form starts with", () => {
  it("fills the business details the visitor gave, and the website the scan checked", () => {
    expect(prefillFromScan(scan(), "user1", NOW)).toEqual({
      scanId: ID, name: "Toss Spa", city: "Lagos", category: "Spa & Wellness", website: "https://toss.example/", instagramHandle: "tossspa",
    });
  });

  it("a scan with no website (a name and handles only) gives no website", () => {
    const r = prefillFromScan(scan({ url: null, siteKey: null }), "user1", NOW);
    expect(r?.website).toBeUndefined();
    expect(r?.instagramHandle).toBe("tossspa");
  });

  it("works for the user who owns it, and for an unclaimed one, but never for someone else's", () => {
    expect(prefillFromScan(scan({ claimedByUserId: "user1" }), "user1", NOW)).not.toBeNull();
    expect(prefillFromScan(scan({ claimedByUserId: null }), "user1", NOW)).not.toBeNull();
    expect(prefillFromScan(scan({ claimedByUserId: "someone-else" }), "user1", NOW)).toBeNull();
  });

  it("nothing for a result that is expired or not finished", () => {
    expect(prefillFromScan(scan({ expiresAt: new Date(NOW - 1) }), "user1", NOW)).toBeNull();
    expect(prefillFromScan(scan({ status: "running" }), "user1", NOW)).toBeNull();
    expect(prefillFromScan(null, "user1", NOW)).toBeNull();
  });

  it("copes with a damaged result, and never passes on anything but the form's own fields", () => {
    const r = prefillFromScan(scan({ result: "junk" as never }), "user1", NOW);
    expect(r).toEqual({ scanId: ID, website: "https://toss.example/" });
    const full = prefillFromScan(scan({ result: { meta: { name: "<b>x</b>", visitorHash: "secret", handles: { instagram: "x".repeat(500) } } } as never }), "user1", NOW);
    expect(Object.keys(full!).sort()).toEqual(["instagramHandle", "name", "scanId", "website"].sort());
    expect(full!.instagramHandle!.length).toBeLessThanOrEqual(60);
    expect(JSON.stringify(full)).not.toContain("secret");
  });
});
