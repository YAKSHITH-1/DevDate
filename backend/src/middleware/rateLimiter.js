import rateLimit from "express-rate-limit";
import {
  RATE_LIMIT_AUTH_WINDOW_MS,
  RATE_LIMIT_AUTH_MAX_IP,
  RATE_LIMIT_AUTH_MAX_ACCOUNT,
  RATE_LIMIT_AUTH_BASE_DELAY_MS,
  RATE_LIMIT_AUTH_MAX_DELAY_MS,
  RATE_LIMIT_AUTH_BACKOFF_FACTOR,
  RATE_LIMIT_PUBLIC_WINDOW_MS,
  RATE_LIMIT_PUBLIC_MAX,
  RATE_LIMIT_USER_WINDOW_MS,
  RATE_LIMIT_USER_MAX,
} from "../config/env.js";

// ============================================================================
// IN-MEMORY TRACKER FOR AUTH EXPONENTIAL BACKOFF
// ============================================================================
// Keys: `ip:<clientIp>` and `account:<email/identifier>`
// Values: { attempts: number, firstAttemptAt: number, penaltyUntil: number, violations: number }
const authStore = new Map();

// Periodic sweep every 5 minutes to prevent memory leaks
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;
const sweepTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, record] of authStore.entries()) {
    const isExpired =
      now - record.firstAttemptAt > RATE_LIMIT_AUTH_WINDOW_MS &&
      now > record.penaltyUntil;
    if (isExpired) {
      authStore.delete(key);
    }
  }
}, SWEEP_INTERVAL_MS);

// Allow Node process to exit gracefully without timer hanging
if (sweepTimer.unref) {
  sweepTimer.unref();
}

/**
 * Utility to clear the in-memory store (primarily for unit / integration tests)
 */
export const clearAuthLimiterStore = () => {
  authStore.clear();
};

/**
 * Reset tracked auth limits for a specific account (e.g. upon password reset or manual unlock)
 */
export const resetAuthLimiterForAccount = (email) => {
  if (!email) return;
  const normalized = email.toLowerCase().trim();
  authStore.delete(`account:${normalized}`);
};

/**
 * 1. STRICT AUTH RATE LIMITER
 * 
 * Uses a combination of per-IP and per-account tracking with EXPONENTIAL BACKOFF
 * rather than a hard lockout.
 * 
 * Flow:
 * - Up to `RATE_LIMIT_AUTH_MAX_IP` / `RATE_LIMIT_AUTH_MAX_ACCOUNT` attempts within the window: permitted.
 * - Beyond threshold: each attempt triggers an exponential delay penalty:
 *     delay = min(baseDelay * (factor ^ (violations - 1)), maxDelay)
 * - If client requests during active backoff (now < penaltyUntil):
 *     returns HTTP 429 with `Retry-After: <seconds>` and extends penalty.
 * - On HTTP 200/201 response (successful authentication):
 *     account penalty is immediately reset.
 */
export const authRateLimiter = (req, res, next) => {
  // Allow explicit bypass during test runs if header is specified
  if (process.env.NODE_ENV === "test" && req.headers["x-bypass-rate-limit"] === "true") {
    return next();
  }

  const now = Date.now();
  const clientIp = req.ip || req.connection?.remoteAddress || "unknown_ip";
  const rawAccount = req.body?.email || req.body?.identifier;
  const normalizedAccount =
    typeof rawAccount === "string" && rawAccount.trim().length > 0
      ? rawAccount.toLowerCase().trim()
      : null;

  const checks = [
    {
      key: `ip:${clientIp}`,
      max: RATE_LIMIT_AUTH_MAX_IP,
      type: "IP address",
      limitedBy: "ip",
    },
  ];

  if (normalizedAccount) {
    checks.push({
      key: `account:${normalizedAccount}`,
      max: RATE_LIMIT_AUTH_MAX_ACCOUNT,
      type: "account",
      limitedBy: "account",
    });
  }

  // 1. Evaluate whether any identifier is currently under an active exponential backoff
  for (const check of checks) {
    const record = authStore.get(check.key);
    if (!record) continue;

    // Reset window if elapsed
    if (
      now - record.firstAttemptAt > RATE_LIMIT_AUTH_WINDOW_MS &&
      now > record.penaltyUntil
    ) {
      authStore.delete(check.key);
      continue;
    }

    // Check if client is still in penalty period
    if (now < record.penaltyUntil) {
      // Eager request while backoff active - increment violation and extend backoff
      record.violations = (record.violations || 1) + 1;
      const penaltyMs = Math.min(
        RATE_LIMIT_AUTH_BASE_DELAY_MS *
          Math.pow(RATE_LIMIT_AUTH_BACKOFF_FACTOR, record.violations - 1),
        RATE_LIMIT_AUTH_MAX_DELAY_MS
      );
      record.penaltyUntil = now + penaltyMs;

      const retryAfterSeconds = Math.max(1, Math.ceil((record.penaltyUntil - now) / 1000));
      res.setHeader("Retry-After", retryAfterSeconds);
      res.setHeader("RateLimit-Policy", `exponential-backoff; factor=${RATE_LIMIT_AUTH_BACKOFF_FACTOR}`);

      return res.status(429).json({
        success: false,
        message: `Too many attempts for this ${check.type}. Exponential backoff active. Please wait ${retryAfterSeconds} seconds before trying again.`,
        retryAfter: retryAfterSeconds,
        limitedBy: check.limitedBy,
      });
    }

    // Check if attempts exceeded threshold and should trigger a new backoff
    if (record.attempts >= check.max) {
      record.violations = (record.violations || 0) + 1;
      const penaltyMs = Math.min(
        RATE_LIMIT_AUTH_BASE_DELAY_MS *
          Math.pow(RATE_LIMIT_AUTH_BACKOFF_FACTOR, record.violations - 1),
        RATE_LIMIT_AUTH_MAX_DELAY_MS
      );
      record.penaltyUntil = now + penaltyMs;

      const retryAfterSeconds = Math.max(1, Math.ceil(penaltyMs / 1000));
      res.setHeader("Retry-After", retryAfterSeconds);
      res.setHeader("RateLimit-Policy", `exponential-backoff; factor=${RATE_LIMIT_AUTH_BACKOFF_FACTOR}`);

      return res.status(429).json({
        success: false,
        message: `Too many attempts for this ${check.type}. Please wait ${retryAfterSeconds} seconds before trying again.`,
        retryAfter: retryAfterSeconds,
        limitedBy: check.limitedBy,
      });
    }
  }

  // 2. Increment attempt counters for active keys
  for (const check of checks) {
    let record = authStore.get(check.key);
    if (!record) {
      record = {
        attempts: 1,
        firstAttemptAt: now,
        penaltyUntil: 0,
        violations: 0,
      };
      authStore.set(check.key, record);
    } else {
      record.attempts += 1;
    }
  }

  // 3. If authentication succeeds (200 / 201), clear the account tracker
  res.on("finish", () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      if (normalizedAccount) {
        authStore.delete(`account:${normalizedAccount}`);
      }
    }
  });

  next();
};

/**
 * 2. MODERATE PUBLIC ENDPOINTS RATE LIMITER
 * 
 * Protects unauthenticated public endpoints (e.g. skills catalog, public project views)
 * against excessive scraping or scraping bots.
 */
export const publicLimiter = rateLimit({
  windowMs: RATE_LIMIT_PUBLIC_WINDOW_MS,
  max: RATE_LIMIT_PUBLIC_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) =>
    process.env.NODE_ENV === "test" && req.headers["x-bypass-rate-limit"] === "true",
  message: {
    success: false,
    message:
      "Too many requests from this IP address to public resources. Please try again later.",
  },
});

/**
 * 3. LOOSER AUTHENTICATED USER ACTION LIMITER
 * 
 * Provides generous throughput for verified authenticated users (swipes, chats,
 * project edits, notifications). Keyed by `userId` to avoid throttling shared
 * corporate / campus NAT IP addresses.
 */
export const userActionLimiter = rateLimit({
  windowMs: RATE_LIMIT_USER_WINDOW_MS,
  max: RATE_LIMIT_USER_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { keyGeneratorIpFallback: false },
  keyGenerator: (req) => {
    return (
      req.user?._id?.toString() ||
      req.userId?.toString() ||
      req.ip ||
      "anonymous_user"
    );
  },
  skip: (req) =>
    process.env.NODE_ENV === "test" && req.headers["x-bypass-rate-limit"] === "true",
  message: {
    success: false,
    message:
      "Rate limit exceeded for user actions. Please slow down and try again later.",
  },
});

// Backward compatibility alias for any existing imports
export const loginLimiter = authRateLimiter;

export default {
  authRateLimiter,
  publicLimiter,
  userActionLimiter,
  loginLimiter,
  clearAuthLimiterStore,
  resetAuthLimiterForAccount,
};
