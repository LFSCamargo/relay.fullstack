import { GraphQLError } from "graphql";
import { db } from "../../../db";
import { ErrorCodes } from "../../../constants";
import { PasswordUtils, TokenUtils } from "../../../utils";

type InputTypesLogin = {
  input: { email: string; password: string; clientMutationId?: string };
};

export async function login(_: unknown, { input }: InputTypesLogin) {
  const user = await db
    .selectFrom("user_data")
    .selectAll()
    .where("email", "=", input.email)
    .executeTakeFirst();

  if (!user) {
    throw new GraphQLError(ErrorCodes.INVALID_EMAIL_OR_PASSWORD);
  }

  const isPasswordValid = PasswordUtils.comparePassword(
    input.password,
    user.password,
  );

  if (!isPasswordValid) {
    throw new GraphQLError(ErrorCodes.INVALID_EMAIL_OR_PASSWORD);
  }

  return {
    token: TokenUtils.encodeJWT(user.email),
    user,
    clientMutationId: input.clientMutationId,
  };
}
