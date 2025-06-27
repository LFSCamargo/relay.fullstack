export const MaskingUtils = {
  maskEmail(email: string): string {
    const [local, domain] = email.split("@");
    if (!domain) return email; // invalid email, just return it

    // if local-part is tiny, just replace it all with asterisks
    if (local.length <= 2) {
      return "*".repeat(local.length) + "@" + domain;
    }

    // keep first and last char, mask the rest
    const first = local.charAt(0);
    const last = local.charAt(local.length - 1);
    const maskedMiddle = "*".repeat(local.length - 2);

    return `${first}${maskedMiddle}${last}@${domain}`;
  },
};
