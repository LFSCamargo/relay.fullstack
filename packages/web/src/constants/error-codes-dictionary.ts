export const ErrorCodesDictionary = {
  USER_ALREADY_EXISTS: "There's already an account with this email",
  USER_NOT_FOUND: "No user found with this email",
  INVALID_EMAIL_OR_PASSWORD: "Invalid email or password",
  UNAUTHORIZED: "Unauthorized access",
  INVALID_OTP: "Invalid or expired OTP",
} as Record<string, string | undefined>;
