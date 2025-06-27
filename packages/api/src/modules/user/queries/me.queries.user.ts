import { requireAuth } from "../../../helpers";
import { GraphQLContext } from "../../../types/graphql.types";

export async function me(_: unknown, __: unknown, { user }: GraphQLContext) {
  requireAuth(user);

  return user;
}
