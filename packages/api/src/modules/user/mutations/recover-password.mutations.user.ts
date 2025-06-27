import { GraphQLError } from "graphql";
import { db } from "../../../db";
import { ErrorCodes } from "../../../constants";
import { GraphQLContext } from "../../../types/graphql.types";
import { MailingUtils, MaskingUtils } from "../../../utils";
import { OneTimePasswordUtils } from "../../../utils/otp.utils";

type InputTypesResetPassword = {
  input: { email: string; clientMutationId?: string };
};

export async function recoverPassword(
  _: unknown,
  { input }: InputTypesResetPassword,
  ctx: GraphQLContext,
) {
  const user = await db
    .selectFrom("user_data")
    .selectAll()
    .where("email", "=", input.email)
    .executeTakeFirst();

  if (!user) {
    throw new GraphQLError(ErrorCodes.USER_NOT_FOUND);
  }

  const now = new Date();

  const payload = {
    user_email: user.email,
    otp: OneTimePasswordUtils.generateOTP(),
    expires_at: OneTimePasswordUtils.generateExpiryDate(now).toISOString(),
    used: false,
    created_at: now.toISOString(),
  };

  await MailingUtils.sendResetPasswordEmail(user.email, payload.otp, ctx);

  await db.insertInto("password_recovery_data").values(payload).execute();

  return {
    message: `A reset password email has been sent to ${MaskingUtils.maskEmail(
      user.email,
    )}. Please check your inbox.`,
    clientMutationId: input.clientMutationId,
  };
}
