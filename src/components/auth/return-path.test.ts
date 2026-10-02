import { describe, expect, it } from "vitest";
import { safeAuthReturnPath } from "./return-path";

describe("authentication return paths", () => {
  it("allows only token-shaped invitation paths", () => {
    const token = "a".repeat(43);
    expect(safeAuthReturnPath(`/share/${token}`)).toBe(`/share/${token}`);
  });

  it.each([
    null,
    "",
    "/",
    "/account",
    "/share/short",
    `/share/${"a".repeat(257)}`,
    `/share/${"a".repeat(20)}/extra`,
    `/share/${"a".repeat(20)}/../account`,
    "//example.com/share/token",
    "https://example.com/share/token",
  ])("falls back to the account page for %s", (value) => {
    expect(safeAuthReturnPath(value)).toBe("/account");
  });
});
