import { beforeAll, describe, expect, it } from "vitest";
import bcrypt from "bcryptjs";
import { createSessionToken, verifyAdminPassword, verifySessionToken } from "@/lib/invoice/auth";

beforeAll(() => {
  process.env.INVOICE_SESSION_SECRET = "test-session-secret-value-1234567890";
  process.env.INVOICE_ADMIN_PASSWORD_HASH = bcrypt.hashSync("correct-password", 10);
});

describe("session tokens", () => {
  it("denies access when no valid token is provided (invalid/garbage token)", async () => {
    const isValid = await verifySessionToken("not-a-real-token");
    expect(isValid).toBe(false);
  });

  it("grants access with a freshly created, valid session token", async () => {
    const token = await createSessionToken();
    const isValid = await verifySessionToken(token);
    expect(isValid).toBe(true);
  });
});

describe("verifyAdminPassword", () => {
  it("accepts the correct password", async () => {
    expect(await verifyAdminPassword("correct-password")).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    expect(await verifyAdminPassword("wrong-password")).toBe(false);
  });
});
