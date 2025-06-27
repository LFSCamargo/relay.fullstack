import { describe, expect, it } from "vitest";
import { HealthResolvers } from "../resolvers.health";

describe("HealthResolvers", () => {
  it("should return health status", () => {
    const result = HealthResolvers.Query.healthCheck();
    expect(result).toEqual({
      message: "Server is up and Running",
    });
  });
});
