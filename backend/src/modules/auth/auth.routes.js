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
} from "./auth.controller.js";
import {
  registerValidation,
  verifyEmailValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from "./auth.validation.js";
import validate from "../../middleware/validate.js";
import authenticate from "../../middleware/auth.js";
import { loginLimiter } from "../../middleware/rateLimiter.js";

const router = express.Router();

// Registration endpoint
router.post("/register", validate(registerValidation), register);

// Email verification endpoint
router.post("/verify-email", validate(verifyEmailValidation), verifyEmail);

// User login endpoint with brute-force rate limiting
router.post("/login", loginLimiter, validate(loginValidation), login);

// Refresh token & session rotation endpoint
router.post("/refresh", refresh);

// Logout single device session endpoint
router.post("/logout", logout);

// Logout all devices for authenticated user endpoint
router.post("/logout-all", authenticate, logoutAll);

// Forgot password endpoint
router.post(
  "/forgot-password",
  loginLimiter,
  validate(forgotPasswordValidation),
  forgotPassword
);

// Reset password endpoint
router.post(
  "/reset-password",
  validate(resetPasswordValidation),
  resetPassword
);

// Protected authenticated user profile endpoint
router.get("/me", authenticate, getMe);

export default router;
