import { TokenUtils } from "../token.utils";
import { describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";
import { Env } from "../../env";

describe("TokenUtils", () => {
  it("should encode and decode a token", () => {
    const email = "test@example.com";
    const token = TokenUtils.encodeJWT(email);
    const decodedEmail = TokenUtils.decodeJWT(token);

    expect(decodedEmail).toEqual(email);
  });

  it("should return null for an invalid token", () => {
    const token = "invalid token";
    const decodedEmail = TokenUtils.decodeJWT(token);

    expect(decodedEmail).toBeNull();
  });

  it("should return null for a token with an invalid type", () => {
    const token = " invalid token";
    const decodedEmail = TokenUtils.decodeJWT(token);

    expect(decodedEmail).toBeNull();
  });

  it("should return null for a token with an expired payload", async () => {
    const email = "test@example.com";
    const token = jwt.sign({ email }, Env.SECRET, {
      expiresIn: "-12h",
    });

    const decodedEmail = TokenUtils.decodeJWT(`Bearer ${token}`);

    expect(decodedEmail).toBeNull();
  });

  it("should return null for a token with an empty payload", async () => {
    const token = jwt.sign({}, Env.SECRET, {
      expiresIn: "12h",
    });

    const decodedEmail = TokenUtils.decodeJWT(`Bearer ${token}`);

    expect(decodedEmail).toBeNull();
  });

  it("should return null for a token with a payload without an email", async () => {
    const token = jwt.sign({ foo: "bar" }, Env.SECRET, {
      expiresIn: "12h",
    });

    const decodedEmail = TokenUtils.decodeJWT(`Bearer ${token}`);

    expect(decodedEmail).toBeNull();
  });

  it("should return null for a token with a payload with a non-string email", async () => {
    const token = jwt.sign({ email: 123 }, Env.SECRET, {
      expiresIn: "12h",
    });

    const decodedEmail = TokenUtils.decodeJWT(`Bearer ${token}`);

    expect(decodedEmail).toBeNull();
  });
});
