import { describe, it, expect, vi } from "vitest";
import { OneTimePasswordUtils } from "../otp.utils";

describe("OneTimePasswordUtils", () => {
  describe("generateOTP", () => {
    it("should generate OTP with default length of 6", () => {
      const otp = OneTimePasswordUtils.generateOTP();
      expect(otp.length).toBe(6);
      expect(/^\d+$/.test(otp)).toBe(true);
    });

    it("should generate OTP with custom length", () => {
      const length = 8;
      const otp = OneTimePasswordUtils.generateOTP(length);
      expect(otp.length).toBe(length);
      expect(/^\d+$/.test(otp)).toBe(true);
    });

    it("should generate different OTPs on each call", () => {
      const otp1 = OneTimePasswordUtils.generateOTP();
      const otp2 = OneTimePasswordUtils.generateOTP();
      expect(otp1).not.toBe(otp2);
    });
  });

  describe("validateOTP", () => {
    it("should return true for matching OTPs", () => {
      const otp = "123456";
      const result = OneTimePasswordUtils.validateOTP(otp, otp);
      expect(result).toBe(true);
    });

    it("should return false for non-matching OTPs", () => {
      const result = OneTimePasswordUtils.validateOTP("123456", "654321");
      expect(result).toBe(false);
    });

    it("should be case sensitive", () => {
      const result = OneTimePasswordUtils.validateOTP("123456", "123456");
      expect(result).toBe(true);
    });
  });

  describe("generateExpiryDate", () => {
    it("should generate expiry date 10 minutes from now", () => {
      const now = new Date("2024-01-01T12:00:00Z");
      vi.setSystemTime(now);

      const expiryDate = OneTimePasswordUtils.generateExpiryDate(now);

      const expectedDate = new Date(now);
      expectedDate.setMinutes(expectedDate.getMinutes() + 10);

      expect(expiryDate.getTime()).toBe(expectedDate.getTime());
    });

    it("should handle date near month/year boundary", () => {
      const now = new Date("2024-01-31T23:55:00Z");
      vi.setSystemTime(now);

      const expiryDate = OneTimePasswordUtils.generateExpiryDate(now);

      const expectedDate = new Date(now);
      expectedDate.setMinutes(expectedDate.getMinutes() + 10);

      expect(expiryDate.getTime()).toBe(expectedDate.getTime());
    });
  });

  describe("isOTPExpired", () => {
    it("should return true for expired OTP", () => {
      const now = new Date("2024-01-01T12:00:00Z");
      vi.setSystemTime(now);

      const expiredDate = new Date(now);
      expiredDate.setMinutes(expiredDate.getMinutes() - 1); // 1 minute ago

      const result = OneTimePasswordUtils.isOTPExpired(expiredDate);
      expect(result).toBe(true);
    });

    it("should return false for non-expired OTP", () => {
      const now = new Date("2024-01-01T12:00:00Z");
      vi.setSystemTime(now);

      const futureDate = new Date(now);
      futureDate.setMinutes(futureDate.getMinutes() + 1); // 1 minute in future

      const result = OneTimePasswordUtils.isOTPExpired(futureDate);
      expect(result).toBe(false);
    });

    it("should return true for OTP expiring exactly now", () => {
      const now = new Date("2024-01-01T12:00:00Z");
      vi.setSystemTime(now);

      const result = OneTimePasswordUtils.isOTPExpired(now);
      expect(result).toBe(true);
    });
  });
});
