import { GraphQLError } from "graphql";
import { db } from "../../../db";
import { ErrorCodes } from "../../../constants";
import { PasswordUtils } from "../../../utils";
import { OneTimePasswordUtils } from "../../../utils/otp.utils";

type InputTypesResetPassword = {
  input: { password: string; clientMutationId?: string; otp: string };
};

export async function validateOTPResetPassword(
  _: unknown,
  { input }: InputTypesResetPassword,
) {
  const recoveryData = await db
    .selectFrom("password_recovery_data")
    .selectAll()
    .where("otp", "=", input.otp)
    .where("used", "=", false)
    .executeTakeFirst();

  if (
    !recoveryData ||
    OneTimePasswordUtils.isOTPExpired(recoveryData.expires_at)
  ) {
    throw new GraphQLError(ErrorCodes.INVALID_OTP);
  }

  const user = await db
    .selectFrom("user_data")
    .selectAll()
    .where("email", "=", recoveryData.user_email)
    .executeTakeFirst();

  if (!user) {
    throw new GraphQLError(ErrorCodes.USER_NOT_FOUND);
  }

  await db
    .updateTable("user_data")
    .set({
      password: PasswordUtils.encodePassword(input.password),
    })
    .where("id", "=", user.id)
    .execute();

  await db
    .updateTable("password_recovery_data")
    .set({
      used: true,
    })
    .where("id", "=", recoveryData.id)
    .execute();

  return {
    message: `Your password has been successfully reset. Please log in with your new password.`,
    clientMutationId: input.clientMutationId,
  };
}
