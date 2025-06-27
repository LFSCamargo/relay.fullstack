import { describe, it, expect } from "vitest";
import { MaskingUtils } from "../masking.utils";

describe("MaskingUtils", () => {
  describe("maskEmail", () => {
    it("should mask email with long local part", () => {
      const email = "john.doe@example.com";
      const masked = MaskingUtils.maskEmail(email);
      expect(masked).toBe("j******e@example.com");
    });

    it("should mask email with short local part (2 characters)", () => {
      const email = "ab@example.com";
      const masked = MaskingUtils.maskEmail(email);
      expect(masked).toBe("**@example.com");
    });

    it("should mask email with very short local part (1 character)", () => {
      const email = "a@example.com";
      const masked = MaskingUtils.maskEmail(email);
      expect(masked).toBe("*@example.com");
    });

    it("should return original email if invalid format (no @)", () => {
      const email = "invalid.email";
      const masked = MaskingUtils.maskEmail(email);
      expect(masked).toBe(email);
    });

    it("should preserve domain part exactly", () => {
      const email = "test.user@sub.domain.com";
      const masked = MaskingUtils.maskEmail(email);
      expect(masked).toBe("t*******r@sub.domain.com");
    });

    it("should handle email with numbers in local part", () => {
      const email = "user123@example.com";
      const masked = MaskingUtils.maskEmail(email);
      expect(masked).toBe("u*****3@example.com");
    });

    it("should handle email with special characters in local part", () => {
      const email = "user.name+tag@example.com";
      const masked = MaskingUtils.maskEmail(email);
      expect(masked).toBe("u***********g@example.com");
    });
  });
});
