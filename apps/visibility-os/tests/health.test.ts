import { describe, expect, it, vi } from "vitest";
import { checkHealth } from "@/lib/health";

describe("checkHealth", () => {
  it("is ok when the probe succeeds", async () => {
    expect(await checkHealth(async () => ({ id: "x" }))).toEqual({ status: "ok" });
  });

  it("is ok when the database is empty (a null read still proves it answered)", async () => {
    expect(await checkHealth(async () => null)).toEqual({ status: "ok" });
  });

  it("is down, and logs the reason, when the probe throws", async () => {
    const onError = vi.fn();
    const result = await checkHealth(
      async () => {
        throw new Error("Can't reach database server");
      },
      { onError }
    );
    expect(result).toEqual({ status: "down" });
    expect(onError).toHaveBeenCalledOnce();
  });

  it("never puts the failure reason in the public result", async () => {
    const result = await checkHealth(async () => {
      throw new Error("postgres://user:secret@host/db");
    });
    expect(JSON.stringify(result)).not.toContain("secret");
  });

  it("is down when the probe hangs past the time limit", async () => {
    const result = await checkHealth(() => new Promise(() => {}), { timeoutMs: 20 });
    expect(result).toEqual({ status: "down" });
  });
});
