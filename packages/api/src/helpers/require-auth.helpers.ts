import { GraphQLError } from "graphql";
import { GraphQLContext } from "../types/graphql.types";
import { ErrorCodes } from "../constants";

export function requireAuth(
  user: GraphQLContext["user"],
): asserts user is NonNullable<GraphQLContext["user"]> {
  if (!user) {
    throw new GraphQLError(ErrorCodes.UNAUTHORIZED);
  }
}
