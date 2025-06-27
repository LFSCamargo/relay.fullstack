/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, expect, it, afterEach, describe, vi } from "vitest";
import { UserResolvers } from "../resolvers.user";
import { ErrorCodes } from "../../../constants";
import { cleanupDb } from "../../../test/cleanup-db";
import { createTestUser } from "../../../test/create-test-user";
import { db } from "../../../db";
import { MailingUtils } from "../../../utils";

// Mock MailingUtils to avoid sending actual emails in tests
vi.mock("../../../utils/mailing.utils", () => ({
  MailingUtils: {
    sendResetPasswordEmail: vi.fn(),
  },
}));

describe("Mutation > recoverPassword", () => {
  afterEach(async () => {
    await cleanupDb();
    vi.clearAllMocks();
  });

  beforeEach(async () => {
    await cleanupDb();
    vi.clearAllMocks();
  });

  it("should throw error if user does not exist", async () => {
    const payload = {
      email: "nonexistent@example.com",
      clientMutationId: "1",
    };

    const promise = UserResolvers.Mutation.recoverPassword(
      {} as unknown,
      { input: payload },
      { req: { headers: {} } } as any,
    );

    await expect(promise).rejects.toThrowError(ErrorCodes.USER_NOT_FOUND);
  });

  it("should create password recovery record for existing user", async () => {
    await createTestUser("test@example.com", "password123", "Test User");

    const payload = {
      email: "test@example.com",
      clientMutationId: "1",
    };

    const result = await UserResolvers.Mutation.recoverPassword(
      {} as unknown,
      { input: payload },
      { req: { headers: {} } } as any,
    );

    // Check that the result contains success message
    expect(result.message).toContain("reset password email has been sent");
    expect(result.clientMutationId).toBe("1");

    // Verify that a recovery record was created in the database
    const recoveryRecord = await db
      .selectFrom("password_recovery_data")
      .selectAll()
      .where("user_email", "=", "test@example.com")
      .executeTakeFirst();

    expect(recoveryRecord).toBeDefined();
    expect(recoveryRecord?.user_email).toBe("test@example.com");
    expect(recoveryRecord?.otp).toBeDefined();
    expect(recoveryRecord?.expires_at).toBeDefined();
    expect(recoveryRecord?.used).toBe(false);
  });

  it("should send reset password email", async () => {
    await createTestUser("test@example.com", "password123", "Test User");

    const payload = {
      email: "test@example.com",
      clientMutationId: "1",
    };

    const mockContext = { req: { headers: {} } } as any;

    await UserResolvers.Mutation.recoverPassword(
      {} as unknown,
      { input: payload },
      mockContext,
    );

    // Verify that the email sending function was called
    expect(MailingUtils.sendResetPasswordEmail).toHaveBeenCalledOnce();
    expect(MailingUtils.sendResetPasswordEmail).toHaveBeenCalledWith(
      "test@example.com",
      expect.any(String), // OTP
      mockContext,
    );
  });

  it("should generate unique OTP for each request", async () => {
    await createTestUser("test@example.com", "password123", "Test User");

    const payload = {
      email: "test@example.com",
      clientMutationId: "1",
    };

    const mockContext = { req: { headers: {} } } as any;

    // First request
    await UserResolvers.Mutation.recoverPassword(
      {} as unknown,
      { input: payload },
      mockContext,
    );

    // Second request
    await UserResolvers.Mutation.recoverPassword(
      {} as unknown,
      { input: payload },
      mockContext,
    );

    // Verify that two different OTPs were created
    const recoveryRecords = await db
      .selectFrom("password_recovery_data")
      .selectAll()
      .where("user_email", "=", "test@example.com")
      .execute();

    expect(recoveryRecords).toHaveLength(2);
    expect(recoveryRecords[0].otp).not.toBe(recoveryRecords[1].otp);
  });

  it("should set correct expiry date for OTP", async () => {
    await createTestUser("test@example.com", "password123", "Test User");

    const payload = {
      email: "test@example.com",
      clientMutationId: "1",
    };

    await UserResolvers.Mutation.recoverPassword(
      {} as unknown,
      { input: payload },
      { req: { headers: {} } } as any,
    );

    const recoveryRecord = await db
      .selectFrom("password_recovery_data")
      .selectAll()
      .where("user_email", "=", "test@example.com")
      .executeTakeFirst();

    expect(recoveryRecord).toBeDefined();

    const expiryDate = new Date(recoveryRecord!.expires_at);
    const createdDate = new Date(recoveryRecord!.created_at);

    // OTP should expire after the creation time
    expect(expiryDate.getTime()).toBeGreaterThan(createdDate.getTime());

    // OTP should expire within a reasonable timeframe (e.g., 15 minutes)
    const timeDifference = expiryDate.getTime() - createdDate.getTime();
    expect(timeDifference).toBeGreaterThan(0);
    expect(timeDifference).toBeLessThanOrEqual(15 * 60 * 1000); // 15 minutes
  });

  it("should handle case-sensitive email matching", async () => {
    await createTestUser("Test@Example.com", "password123", "Test User");

    const payload = {
      email: "test@example.com", // Different case
      clientMutationId: "1",
    };

    const promise = UserResolvers.Mutation.recoverPassword(
      {} as unknown,
      { input: payload },
      { req: { headers: {} } } as any,
    );

    // Should fail if email matching is case-sensitive
    await expect(promise).rejects.toThrowError(ErrorCodes.USER_NOT_FOUND);
  });

  it("should work without clientMutationId", async () => {
    await createTestUser("test@example.com", "password123", "Test User");

    const payload = {
      email: "test@example.com",
    };

    const result = await UserResolvers.Mutation.recoverPassword(
      {} as unknown,
      { input: payload },
      { req: { headers: {} } } as any,
    );

    expect(result.message).toContain("reset password email has been sent");
    expect(result.clientMutationId).toBeUndefined();
  });
});
