/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from "vitest";
import { requireAuth } from "../require-auth.helpers";
import { GraphQLError } from "graphql";
import { ErrorCodes } from "../../constants";

describe("requireAuth", () => {
  it("should throw an error if the user is not logged in", () => {
    try {
      requireAuth(null);
    } catch (error) {
      expect(error).toBeInstanceOf(GraphQLError);
      expect((error as GraphQLError).message).toBe(ErrorCodes.UNAUTHORIZED);
    }
  });

  it("should not throw an error if the user is logged in", () => {
    const user = {
      id: "123",
      name: "John Doe",
      email: "johndoe",
    };
    expect(() => requireAuth(user as any)).not.toThrow();
  });
});
