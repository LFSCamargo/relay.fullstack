import { describe, it, expect } from "vitest";
import { PasswordUtils } from "../password.utils";

describe("PasswordUtils", () => {
  const password = "testPassword";
  let hashedPassword: string;

  it("should encode a password", () => {
    hashedPassword = PasswordUtils.encodePassword(password);
    expect(hashedPassword).toBeDefined();
    expect(hashedPassword).not.toEqual(password);
  });

  it("should compare password with hash correctly", () => {
    const isValid = PasswordUtils.comparePassword(password, hashedPassword);
    expect(isValid).toBe(true);

    const isInvalid = PasswordUtils.comparePassword(
      "wrongPassword",
      hashedPassword,
    );
    expect(isInvalid).toBe(false);
  });
});
