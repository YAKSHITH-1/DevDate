import asyncHandler from "../../utils/asyncHandler.js";
import {
  registerUser,
  verifyEmail as verifyEmailService,
  loginUser,
  rotateRefreshToken,
  logoutUser,
  logoutAllDevices,
  forgotPassword as forgotPasswordService,
  resetPassword as resetPasswordService,
  getMe as getMeService,
  updateUserProfile as updateUserService,
} from "./auth.service.js";
import {
  REFRESH_COOKIE_NAME,
  getRefreshCookieOptions,
} from "../../utils/token.js";

/**
 * @desc    Register a new user and send verification OTP
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const result = await registerUser({ name, email, password });

  return res.status(201).json({
    success: true,
    message: "Registration successful. Please check your email for the verification OTP.",
    data: result,
  });
});

/**
 * @desc    Verify user email with 6-digit OTP
 * @route   POST /api/auth/verify-email
 * @access  Public
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const deviceInfo = {
    userAgent: req.headers["user-agent"] || "",
    ipAddress: req.ip || req.connection?.remoteAddress || "",
    deviceType: req.headers["x-device-type"] || "desktop",
  };

  const result = await verifyEmailService({ email, otp, deviceInfo });

  if (result.refreshToken) {
    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, getRefreshCookieOptions());
  }

  return res.status(200).json({
    success: true,
    message: "Email verified successfully! Welcome to DevDate.",
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    user: {
      id: result.user?._id?.toString() || result.userId?.toString(),
      name: result.name,
      email: result.email,
      role: result.role,
      isVerified: result.isVerified,
    },
    data: result,
  });
});

/**
 * @desc    Authenticate verified user, create session, and issue access/refresh tokens
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const deviceInfo = {
    userAgent: req.headers["user-agent"] || "",
    ipAddress: req.ip || req.connection?.remoteAddress || "",
    deviceType: req.headers["x-device-type"] || "desktop",
  };

  const { user, accessToken, refreshToken } = await loginUser({
    email,
    password,
    deviceInfo,
  });

  // Set refresh token in secure, HTTP-only cookie
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions());

  // Return formatted login response with accessToken and refreshToken for mobile clients
  return res.status(200).json({
    success: true,
    message: "Login successful",
    accessToken,
    refreshToken,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
    },
  });
});

/**
 * @desc    Rotate refresh token and issue new access token
 * @route   POST /api/auth/refresh
 * @access  Public (via HTTP-only cookie or request body/header for mobile)
 */
export const refresh = asyncHandler(async (req, res) => {
  const rawRefreshToken =
    req.body?.refreshToken ||
    req.headers["x-refresh-token"] ||
    req.cookies?.[REFRESH_COOKIE_NAME];

  const { accessToken, refreshToken: newRefreshToken } =
    await rotateRefreshToken(rawRefreshToken);

  res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, getRefreshCookieOptions());

  return res.status(200).json({
    success: true,
    message: "Token refreshed successfully.",
    accessToken,
    refreshToken: newRefreshToken,
  });
});

/**
 * @desc    Log out current session and clear refresh token cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const logout = asyncHandler(async (req, res) => {
  const rawRefreshToken =
    req.body?.refreshToken ||
    req.headers["x-refresh-token"] ||
    req.cookies?.[REFRESH_COOKIE_NAME];

  await logoutUser(rawRefreshToken);

  res.clearCookie(REFRESH_COOKIE_NAME, getRefreshCookieOptions());

  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
});

/**
 * @desc    Log out all active sessions across all devices for the authenticated user
 * @route   POST /api/auth/logout-all
 * @access  Private (Authenticated)
 */
export const logoutAll = asyncHandler(async (req, res) => {
  const userId = req.userId || req.user?._id;

  await logoutAllDevices(userId);

  res.clearCookie(REFRESH_COOKIE_NAME, getRefreshCookieOptions());

  return res.status(200).json({
    success: true,
    message: "Logged out from all devices successfully.",
  });
});

/**
 * @desc    Request password reset email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const result = await forgotPasswordService({ email });

  return res.status(200).json({
    success: true,
    message: result.message,
  });
});

/**
 * @desc    Reset password using valid reset token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password, newPassword } = req.body;
  const pwd = password || newPassword;

  const result = await resetPasswordService({ token, newPassword: pwd });

  return res.status(200).json({
    success: true,
    message: result.message,
  });
});

/**
 * @desc    Get authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private (Authenticated)
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await getMeService(req.userId || req.user?._id);

  return res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * @desc    Update authenticated user profile
 * @route   PUT /api/auth/me, PATCH /api/auth/me
 * @access  Private (Authenticated)
 */
export const updateMe = asyncHandler(async (req, res) => {
  const userId = req.userId || req.user?._id;
  const updatedUser = await updateUserService(userId, req.body);

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: updatedUser,
  });
});

export default {
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
};
