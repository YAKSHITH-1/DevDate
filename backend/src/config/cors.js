import { NODE_ENV, ALLOWED_ORIGINS, APP_URL } from "./env.js";

/**
 * Validates whether an incoming HTTP / WebSocket origin is allowed.
 * @param {string|undefined} origin - Origin header from client request
 * @returns {boolean}
 */
export const isOriginAllowed = (origin) => {
  // 1. Mobile applications (React Native / Expo native iOS & Android), CLI tools,
  // health check monitoring (e.g. GitHub Actions keep-alive), and server-to-server requests
  // do not send a browser 'Origin' header. These must always be permitted.
  if (!origin) {
    return true;
  }

  const currentEnv = process.env.NODE_ENV || NODE_ENV;

  // 2. In non-production environments (development & test), permit localhost,
  // LAN private IP ranges (for physical mobile device testing), and Expo dev tools.
  if (currentEnv !== "production") {
    const isLocalOrLAN =
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
      /^https?:\/\/(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(origin);

    if (isLocalOrLAN) {
      return true;
    }
  }

  // 3. Normalize and check trusted production origins from environment configuration
  const rawAllowedOrigins = process.env.ALLOWED_ORIGINS || ALLOWED_ORIGINS;
  const configuredOrigins = Array.isArray(rawAllowedOrigins)
    ? rawAllowedOrigins
    : typeof rawAllowedOrigins === "string"
    ? rawAllowedOrigins.split(",").map((o) => o.trim()).filter(Boolean)
    : [];

  const currentAppUrl = process.env.APP_URL || APP_URL;

  const trustedSet = new Set(
    [
      ...configuredOrigins,
      ...(currentAppUrl ? [currentAppUrl.replace(/\/+$/, "")] : []),
    ].map((o) => o.toLowerCase().replace(/\/+$/, ""))
  );

  const normalizedOrigin = origin.toLowerCase().replace(/\/+$/, "");

  if (trustedSet.has(normalizedOrigin)) {
    return true;
  }

  // 4. In development mode with no explicit origins configured, allow as fallback
  if (currentEnv !== "production") {
    return true;
  }

  return false;
};

/**
 * Production-hardened CORS options for Express
 */
export const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: Origin '${origin}' is not authorized.`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "x-user-id",
    "x-refresh-token",
    "x-device-type",
    "x-bypass-rate-limit",
  ],
  exposedHeaders: ["Retry-After", "RateLimit-Policy"],
  maxAge: 86400, // 24 hours preflight cache
};

export default {
  isOriginAllowed,
  corsOptions,
};
