import { describe, it, expect } from "vitest";
import { UserResolvers } from "../resolvers.user";
import { toGlobalId } from "graphql-relay";
import { UserData } from "../../../db/types/tables";

describe("Root > User", () => {
  it("should be able to create a global id", () => {
    const mockedUser = {
      id: 1,
      name: "John Doe",
      email: "johndoe",
      password: "password",
      picture: "https://example.com/picture.jpg",
      created_at: new Date().toISOString(),
    };

    const globalId = toGlobalId("User", mockedUser.id);

    const result = UserResolvers.User.id(mockedUser as unknown as UserData);

    expect(result).toEqual(globalId);
  });
});
