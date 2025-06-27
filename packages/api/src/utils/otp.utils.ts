export const OneTimePasswordUtils = {
  generateOTP: (length: number = 6): string => {
    const digits = "0123456789";
    let otp = "";
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)];
    }
    return otp;
  },

  validateOTP: (otp: string, expectedOtp: string): boolean => {
    return otp === expectedOtp;
  },
  generateExpiryDate: (currentDate: Date): Date => {
    const expiryDate = new Date(currentDate);
    expiryDate.setMinutes(expiryDate.getMinutes() + 10); // OTP valid for 10 minutes
    return expiryDate;
  },
  isOTPExpired: (expiresAt: Date): boolean => {
    const now = new Date();
    return now >= expiresAt;
  },
};
