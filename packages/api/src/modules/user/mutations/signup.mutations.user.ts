import { GraphQLError } from "graphql";
import { ErrorCodes } from "../../../constants";
import { db } from "../../../db";
import { PasswordUtils, TokenUtils } from "../../../utils";

type InputTypesSignup = {
  input: {
    email: string;
    password: string;
    name: string;
    clientMutationId?: string;
  };
};

export async function signUp(_: unknown, { input }: InputTypesSignup) {
  const user = await db
    .selectFrom("user_data")
    .selectAll()
    .where("email", "=", input.email)
    .executeTakeFirst();

  if (user) {
    throw new GraphQLError(ErrorCodes.USER_ALREADY_EXISTS);
  }

  const newUser = await db
    .insertInto("user_data")
    .values({
      email: input.email,
      password: PasswordUtils.encodePassword(input.password),
      name: input.name,
      created_at: new Date().toISOString(),
    })
    .returningAll()
    .executeTakeFirst();

  return {
    token: TokenUtils.encodeJWT(newUser!.email),
    user: newUser,
    clientMutationId: input.clientMutationId,
  };
}
