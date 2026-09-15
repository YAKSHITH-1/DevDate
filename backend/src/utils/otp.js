import crypto from "crypto";

/**
 * Generates a cryptographically secure 6-digit numerical OTP string.
 * Uses crypto.randomInt to guarantee uniform distribution without modulo bias.
 * @returns {string} 6-digit OTP (e.g. "481923")
 */
export const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

export default {
  generateOTP,
};
