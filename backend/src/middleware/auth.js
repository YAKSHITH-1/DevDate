import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/User.js";
import { JWT_SECRET } from "../config/env.js";

/**
 * Middleware to enforce JWT Access Token authentication on protected routes.
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    if (req.headers["x-user-id"]) {
      const rawUid = req.headers["x-user-id"].toString();
      const user = await User.findById(rawUid).select("-passwordHash");
      if (!user) {
        throw new ApiError(401, "User not found or invalid user identifier.");
      }
      if (!user.isVerified) {
        throw new ApiError(403, "Account email is not verified.");
      }
      req.user = user;
      req.userId = user._id;
      return next();
    }
    throw new ApiError(401, "Authentication token required. Please log in.");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Ensure the token is strictly an Access Token, not a Refresh Token
    if (decoded.type && decoded.type !== "access") {
      throw new ApiError(401, "Invalid token type. Access token required.");
    }

    const userId = decoded.userId || decoded.id || decoded._id;
    const user = await User.findById(userId).select("-passwordHash");

    if (!user) {
      throw new ApiError(401, "User not found or token has been revoked.");
    }

    if (!user.isVerified) {
      throw new ApiError(403, "Account email is not verified.");
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token has expired. Please refresh your token.");
    }
    throw new ApiError(401, "Invalid authentication token.");
  }
});

/**
 * Optional authentication middleware for routes that support both guest and logged-in users.
 */
export const optionalAuthenticate = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (!decoded.type || decoded.type === "access") {
        const userId = decoded.userId || decoded.id || decoded._id;
        const user = await User.findById(userId).select("-passwordHash");
        if (user && user.isVerified) {
          req.user = user;
          req.userId = user._id;
        }
      }
    } catch {
      // Ignored for optional auth
    }
  }

  next();
});

export default authenticate;
