import { afterEach, describe, beforeEach, it, expect } from "vitest";
import { cleanupDb } from "../../../test/cleanup-db";
import { UserResolvers } from "../resolvers.user";

describe("Mutation > signUp", () => {
  afterEach(async () => {
    await cleanupDb();
  });

  beforeEach(async () => {
    await cleanupDb();
  });

  it("should throw an error if the user already exists", async () => {
    const payload = {
      email: "johndoe",
      password: "password",
      name: "John Doe",
      clientMutationId: "1",
    };

    await UserResolvers.Mutation.signUp({} as unknown, {
      input: payload,
    });

    const promise = UserResolvers.Mutation.signUp({} as unknown, {
      input: payload,
    });

    await expect(promise).rejects.toThrowError("USER_ALREADY_EXISTS");
  });

  it("should create a new user", async () => {
    const payload = {
      email: "johndoe",
      password: "password",
      name: "John Doe",
      clientMutationId: "1",
    };

    const { token, user } = await UserResolvers.Mutation.signUp({} as unknown, {
      input: payload,
    });

    expect(token).toBeDefined();

    expect(user?.email).toEqual(payload.email);
    expect(user?.name).toEqual(payload.name);
  });
});
