import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  JWT_SECRET,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
  NODE_ENV,
} from "../config/env.js";

export const REFRESH_COOKIE_NAME = "refreshToken";

/**
 * Generates a SHA-256 hash of a string (e.g. refresh token).
 * @param {string} token
 * @returns {string} Hex encoded hash
 */
export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Generates a short-lived access token for API authorization.
 * @param {string|Object} userId - User ID
 * @param {string|Object} sessionId - Session ID
 * @returns {string} Signed JWT access token
 */
export const generateAccessToken = (userId, sessionId) => {
  return jwt.sign(
    {
      userId: userId.toString(),
      sessionId: sessionId ? sessionId.toString() : undefined,
      type: "access",
    },
    JWT_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    }
  );
};

/**
 * Generates a long-lived refresh token tied to a specific session ID.
 * @param {string|Object} userId - User ID
 * @param {string|Object} sessionId - Session ID
 * @returns {string} Signed JWT refresh token
 */
export const generateRefreshToken = (userId, sessionId) => {
  return jwt.sign(
    {
      userId: userId.toString(),
      sessionId: sessionId.toString(),
      type: "refresh",
    },
    REFRESH_TOKEN_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    }
  );
};

/**
 * Verifies an access token using JWT_SECRET.
 * @param {string} token
 * @returns {Object} Decoded JWT payload
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

/**
 * Verifies a refresh token using REFRESH_TOKEN_SECRET.
 * @param {string} token
 * @returns {Object} Decoded JWT payload
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
};

/**
 * Returns security-hardened options for the refresh token cookie.
 */
export const getRefreshCookieOptions = () => {
  return {
    httpOnly: true, // Prevents JavaScript from reading the cookie (mitigates XSS attacks)
    secure: NODE_ENV === "production", // Transmit only over HTTPS in production environments
    sameSite: "lax", // Protects against cross-site request forgery (CSRF) while supporting standard navigation
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds matching REFRESH_TOKEN_EXPIRY
    path: "/api/auth", // Limits cookie transmission exclusively to authentication endpoints
  };
};

export default {
  REFRESH_COOKIE_NAME,
  hashToken,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  getRefreshCookieOptions,
};
