import express from "express";
import {
  register,
  verifyEmail,
  login,
  refresh,
  logout,
  logoutAll,
  forgotPassword,
  resetPassword,
  getMe,
  updateMe,
} from "./auth.controller.js";
import {
  registerValidation,
  verifyEmailValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  updateProfileValidation,
} from "./auth.validation.js";
import validate from "../../middleware/validate.js";
import authenticate from "../../middleware/auth.js";
import { authRateLimiter, userActionLimiter } from "../../middleware/rateLimiter.js";

const router = express.Router();

// Registration endpoint (protected by strict auth rate limiting)
router.post("/register", authRateLimiter, validate(registerValidation), register);

// Email verification endpoint (protected by strict auth rate limiting)
router.post("/verify-email", authRateLimiter, validate(verifyEmailValidation), verifyEmail);

// User login endpoint (protected by strict auth rate limiting with exponential backoff)
router.post("/login", authRateLimiter, validate(loginValidation), login);

// Refresh token & session rotation endpoint
router.post("/refresh", authRateLimiter, refresh);

// Logout single device session endpoint
router.post("/logout", logout);

// Logout all devices for authenticated user endpoint
router.post("/logout-all", authenticate, userActionLimiter, logoutAll);

// Forgot password endpoint (protected by strict auth rate limiting with exponential backoff)
router.post(
  "/forgot-password",
  authRateLimiter,
  validate(forgotPasswordValidation),
  forgotPassword
);

// Reset password endpoint (protected by strict auth rate limiting)
router.post(
  "/reset-password",
  authRateLimiter,
  validate(resetPasswordValidation),
  resetPassword
);

// Protected authenticated user profile endpoints (loose user limits)
router.get("/me", authenticate, userActionLimiter, getMe);
router.put("/me", authenticate, userActionLimiter, validate(updateProfileValidation), updateMe);
router.patch("/me", authenticate, userActionLimiter, validate(updateProfileValidation), updateMe);

export default router;
