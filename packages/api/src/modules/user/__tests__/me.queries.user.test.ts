import { describe, expect, it } from "vitest";
import { UserResolvers } from "../resolvers.user";
import { GraphQLContext } from "../../../types/graphql.types";

describe("Query > me", () => {
  it("should return the current user", async () => {
    const mockedUser = {
      id: 1,
      name: "John Doe",
      email: "johndoe",
      password: "password",
      picture: "https://example.com/picture.jpg",
      created_at: new Date().toISOString(),
    };

    const result = await UserResolvers.Query.me(
      {} as unknown,
      {} as unknown,
      { user: mockedUser } as unknown as GraphQLContext,
    );

    expect(result).toEqual(mockedUser);
  });

  it("should throw an error if the user is not logged in", async () => {
    const mockedUser = null;

    const promise = UserResolvers.Query.me(
      {} as unknown,
      {} as unknown,
      { user: mockedUser } as unknown as GraphQLContext,
    );

    await expect(promise).rejects.toThrowError("UNAUTHORIZED");
  });
});
