import { describe, expect, it } from "vitest";
import { parseResourceId, readJson } from "./http";

describe("HTTP input boundaries", () => {
  it("reads valid JSON within the body limit", async () => {
    const request = new Request("http://localhost/api/test", {
      method: "POST",
      body: JSON.stringify({ value: "ok" }),
    });

    await expect(readJson(request)).resolves.toEqual({ value: "ok" });
  });

  it("rejects oversized bodies even without a Content-Length header", async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(`"${"a".repeat(16_384)}"`));
        controller.close();
      },
    });
    const request = new Request("http://localhost/api/test", {
      method: "POST",
      body: stream,
      duplex: "half",
    } as RequestInit & { duplex: "half" });

    await expect(readJson(request)).rejects.toMatchObject({
      status: 413,
      code: "payload_too_large",
    });
  });

  it("rejects malformed JSON safely", async () => {
    const request = new Request("http://localhost/api/test", {
      method: "POST",
      body: "{",
    });

    await expect(readJson(request)).rejects.toMatchObject({
      status: 400,
      code: "invalid_json",
    });
  });

  it("accepts UUID resource IDs and rejects malformed values", () => {
    const id = "e69f2c70-7c90-4f1d-94a8-3bc95c783327";
    expect(parseResourceId(id, "Connection")).toBe(id);
    expect(() => parseResourceId("../account", "Connection")).toThrowError(
      expect.objectContaining({
        status: 422,
        code: "validation_error",
      }),
    );
  });
});
