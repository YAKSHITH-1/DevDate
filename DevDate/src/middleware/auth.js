import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/User.js";
import { JWT_SECRET } from "../config/env.js";

export const authenticate = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "Authentication token required");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const userId = decoded.id || decoded._id || decoded.userId;
    const user = await User.findById(userId).select("-passwordHash");

    if (!user) {
      throw new ApiError(401, "User not found or token invalid");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, "Invalid or expired token");
  }
});

export const optionalAuthenticate = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.id || decoded._id || decoded.userId;
      const user = await User.findById(userId).select("-passwordHash");
      if (user) {
        req.user = user;
      }
    } catch {
      // Invalid token in optional auth is ignored, proceeding as guest / temporary id
    }
  }

  next();
});

export default authenticate;
