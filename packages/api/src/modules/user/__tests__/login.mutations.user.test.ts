import { beforeEach, expect, it, afterEach, describe } from "vitest";
import { UserResolvers } from "../resolvers.user";
import { ErrorCodes } from "../../../constants";
import { cleanupDb } from "../../../test/cleanup-db";
import { createTestUser } from "../../../test/create-test-user";

describe("Mutation > login", () => {
  afterEach(async () => {
    await cleanupDb();
  });

  beforeEach(async () => {
    await cleanupDb();
  });

  it("should not login if the user does not exist", async () => {
    const payload = {
      email: "johndoe2",
      password: "password",
    };

    const promise = UserResolvers.Mutation.login({} as unknown, {
      input: payload,
    });

    await expect(promise).rejects.toThrowError(
      ErrorCodes.INVALID_EMAIL_OR_PASSWORD,
    );
  });

  it("should login", async () => {
    await createTestUser("johndoe", "password", "John Doe");

    const payload = {
      email: "johndoe",
      password: "password",
    };

    const { token, user } = await UserResolvers.Mutation.login({} as unknown, {
      input: payload,
    });

    expect(token).toBeDefined();
    expect(user.email).toEqual(payload.email);
  });

  it("should not login if the user does not exist", async () => {
    const signupPayload = {
      email: "johndoe2",
      password: "12345678",
      name: "John Doe",
      clientMutationId: "1",
    };

    await UserResolvers.Mutation.signUp({} as unknown, {
      input: signupPayload,
    });

    const payload = {
      email: "johndoe2",
      password: "password",
    };

    const promise = UserResolvers.Mutation.login({} as unknown, {
      input: payload,
    });

    await expect(promise).rejects.toThrowError(
      ErrorCodes.INVALID_EMAIL_OR_PASSWORD,
    );
  });
});
