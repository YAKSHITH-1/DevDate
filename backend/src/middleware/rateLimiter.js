import rateLimit from "express-rate-limit";

/**
 * Rate limiter middleware for the login endpoint to mitigate brute-force attacks.
 * Allows up to 10 login attempts per 15-minute window per IP address.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests per windowMs
  standardHeaders: true, // Return standard rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: "Too many login attempts from this IP address. Please try again after 15 minutes.",
  },
  skip: () => process.env.NODE_ENV === "test", // Skip rate limiting during automated tests
});

export default {
  loginLimiter,
};
