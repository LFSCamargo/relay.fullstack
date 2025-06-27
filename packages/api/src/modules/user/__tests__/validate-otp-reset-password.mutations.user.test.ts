import { beforeEach, expect, it, afterEach, describe, vi } from "vitest";
import { UserResolvers } from "../resolvers.user";
import { ErrorCodes } from "../../../constants";
import { cleanupDb } from "../../../test/cleanup-db";
import { createTestUser } from "../../../test/create-test-user";
import { db } from "../../../db";
import { OneTimePasswordUtils } from "../../../utils/otp.utils";

describe("Mutation > validateOTPResetPassword", () => {
  afterEach(async () => {
    await cleanupDb();
    vi.clearAllMocks();
  });

  beforeEach(async () => {
    await cleanupDb();
    vi.clearAllMocks();
  });

  it("should throw error if OTP is invalid", async () => {
    const payload = {
      otp: "invalid-otp",
      password: "newPassword123",
      clientMutationId: "1",
    };

    const promise = UserResolvers.Mutation.validateOTPResetPassword(
      {} as unknown,
      { input: payload },
    );

    await expect(promise).rejects.toThrowError(ErrorCodes.INVALID_OTP);
  });

  it("should throw error if OTP is expired", async () => {
    // Create a test user
    await createTestUser("test@example.com", "password123", "Test User");

    // Create an expired OTP record from a day ago
    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() - 1); // 1 day ago

    await db
      .insertInto("password_recovery_data")
      .values({
        user_email: "test@example.com",
        otp: "123456",
        expires_at: expiredDate.toISOString(),
        used: false,
        created_at: expiredDate.toISOString(),
      })
      .execute();

    const payload = {
      otp: "123456",
      password: "newPassword123",
      clientMutationId: "1",
    };

    const promise = UserResolvers.Mutation.validateOTPResetPassword(
      {} as unknown,
      { input: payload },
    );

    await expect(promise).rejects.toThrowError(ErrorCodes.INVALID_OTP);
  });

  it("should throw error if user is not found", async () => {
    // Create an OTP record for a non-existent user
    await db
      .insertInto("password_recovery_data")
      .values({
        user_email: "nonexistent@example.com",
        otp: "123456",
        expires_at: OneTimePasswordUtils.generateExpiryDate(
          new Date(),
        ).toISOString(),
        used: false,
        created_at: new Date().toISOString(),
      })
      .execute();

    const payload = {
      otp: "123456",
      password: "newPassword123",
      clientMutationId: "1",
    };

    const promise = UserResolvers.Mutation.validateOTPResetPassword(
      {} as unknown,
      { input: payload },
    );

    await expect(promise).rejects.toThrowError(ErrorCodes.USER_NOT_FOUND);
  });

  it("should successfully reset password with valid OTP", async () => {
    // Create a test user
    await createTestUser("test@example.com", "oldPassword123", "Test User");

    // Create a valid OTP record
    const now = new Date();
    await db
      .insertInto("password_recovery_data")
      .values({
        user_email: "test@example.com",
        otp: "123456",
        expires_at: OneTimePasswordUtils.generateExpiryDate(now).toISOString(),
        used: false,
        created_at: now.toISOString(),
      })
      .execute();

    const payload = {
      otp: "123456",
      password: "newPassword123",
      clientMutationId: "1",
    };

    const result = await UserResolvers.Mutation.validateOTPResetPassword(
      {} as unknown,
      { input: payload },
    );

    // Verify success message
    expect(result.message).toContain("password has been successfully reset");
    expect(result.clientMutationId).toBe("1");

    // Verify password was updated
    const updatedUser = await db
      .selectFrom("user_data")
      .selectAll()
      .where("email", "=", "test@example.com")
      .executeTakeFirst();

    expect(updatedUser).toBeDefined();
    expect(updatedUser?.password).not.toBe("oldPassword123");

    // Verify OTP was marked as used
    const usedOtp = await db
      .selectFrom("password_recovery_data")
      .selectAll()
      .where("otp", "=", "123456")
      .executeTakeFirst();

    expect(usedOtp).toBeDefined();
    expect(usedOtp?.used).toBe(true);
  });

  it("should work without clientMutationId", async () => {
    // Create a test user
    await createTestUser("test@example.com", "oldPassword123", "Test User");

    // Create a valid OTP record
    const now = new Date();
    await db
      .insertInto("password_recovery_data")
      .values({
        user_email: "test@example.com",
        otp: "123456",
        expires_at: OneTimePasswordUtils.generateExpiryDate(now).toISOString(),
        used: false,
        created_at: now.toISOString(),
      })
      .execute();

    const payload = {
      otp: "123456",
      password: "newPassword123",
    };

    const result = await UserResolvers.Mutation.validateOTPResetPassword(
      {} as unknown,
      { input: payload },
    );

    expect(result.message).toContain("password has been successfully reset");
    expect(result.clientMutationId).toBeUndefined();
  });

  it("should not allow reusing the same OTP", async () => {
    // Create a test user
    await createTestUser("test@example.com", "oldPassword123", "Test User");

    // Create a valid OTP record
    const now = new Date();
    await db
      .insertInto("password_recovery_data")
      .values({
        user_email: "test@example.com",
        otp: "123456",
        expires_at: OneTimePasswordUtils.generateExpiryDate(now).toISOString(),
        used: false,
        created_at: now.toISOString(),
      })
      .execute();

    const payload = {
      otp: "123456",
      password: "newPassword123",
      clientMutationId: "1",
    };

    // First attempt - should succeed
    await UserResolvers.Mutation.validateOTPResetPassword({} as unknown, {
      input: payload,
    });

    // Second attempt with the same OTP - should fail
    const promise = UserResolvers.Mutation.validateOTPResetPassword(
      {} as unknown,
      { input: payload },
    );

    await expect(promise).rejects.toThrowError(ErrorCodes.INVALID_OTP);
  });
});
