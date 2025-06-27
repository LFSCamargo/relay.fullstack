import { afterEach, describe, expect, it, beforeEach } from "vitest";
import { cleanupDb } from "../../../test/cleanup-db";
import { UserResolvers } from "../resolvers.user";
import { GraphQLContext } from "../../../types/graphql.types";
import { ErrorCodes } from "../../../constants";

describe("Mutation > updateUser", () => {
  afterEach(async () => {
    await cleanupDb();
  });

  beforeEach(async () => {
    await cleanupDb();
  });

  it("should update the user", async () => {
    const payload = {
      email: "johndoe",
      password: "password",
      name: "John Doe",
      clientMutationId: "1",
    };

    const { user } = await UserResolvers.Mutation.signUp({} as unknown, {
      input: payload,
    });

    const updatePayload = {
      email: "johndoe2",
      name: "John Doe",
      clientMutationId: "1",
    };

    const { user: updatedUser } = await UserResolvers.Mutation.updateUser(
      {} as unknown,
      { input: updatePayload },
      { user } as unknown as GraphQLContext,
    );

    expect(updatedUser?.email).toEqual(updatePayload.email);
    expect(updatedUser?.name).toEqual(updatePayload.name);
  });

  it("should throw an error if the user is not logged in", async () => {
    const updatePayload = {
      email: "johndoe2",
      name: "John Doe",
      clientMutationId: "1",
    };

    const promise = UserResolvers.Mutation.updateUser(
      {} as unknown,
      { input: updatePayload },
      { user: null } as unknown as GraphQLContext,
    );

    await expect(promise).rejects.toThrowError(ErrorCodes.UNAUTHORIZED);
  });
});
