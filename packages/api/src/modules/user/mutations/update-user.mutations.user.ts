import { db } from "../../../db";
import { requireAuth } from "../../../helpers";

type InputTypesUpdateUser = {
  input: {
    email?: string;
    name?: string;
    picture?: string;
    clientMutationId?: string;
  };
};
import { GraphQLContext } from "../../../types/graphql.types";

export async function updateUser(
  _: unknown,
  { input }: InputTypesUpdateUser,
  { user }: GraphQLContext,
) {
  requireAuth(user);

  const payload: {
    email?: string;
    name?: string;
    picture?: string;
  } = {};

  if (input.email) {
    payload.email = input.email;
  }

  if (input.name) {
    payload.name = input.name;
  }

  if (input.picture) {
    payload.picture = input.picture;
  }

  const updatedUser = await db
    .updateTable("user_data")
    .where("id", "=", user.id)
    .set(payload)
    .returningAll()
    .executeTakeFirst();

  return {
    user: updatedUser,
    clientMutationId: input.clientMutationId,
  };
}
