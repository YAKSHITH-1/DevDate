import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../../models/User.js";
import Skill from "../../models/Skill.js";
import EmailOTP from "../../models/EmailOTP.js";
import Session from "../../models/Session.js";
import PasswordReset from "../../models/PasswordReset.js";
import ApiError from "../../utils/ApiError.js";
import { generateOTP } from "../../utils/otp.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../../services/email.service.js";
import {
  hashToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/token.js";
import { APP_URL } from "../../config/env.js";

const OTP_EXPIRY_MINUTES = 10;
const SESSION_EXPIRY_DAYS = 7;
const RESET_TOKEN_EXPIRY_MINUTES = 15;

/**
 * Registers a new user or updates a pending unverified account and dispatches an OTP email.
 */
export const registerUser = async ({ name, email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  let user = await User.findOne({ email: normalizedEmail });

  if (user) {
    if (user.isVerified) {
      throw new ApiError(409, "An account with this email is already registered and verified. Please log in.");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    user.name = name.trim();
    user.passwordHash = passwordHash;
    await user.save();

    await EmailOTP.deleteMany({ userId: user._id });
  } else {
    const passwordHash = await bcrypt.hash(password, 10);
    user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      isVerified: false,
    });
  }

  const plainOTP = generateOTP();
  const hashedOTP = await bcrypt.hash(plainOTP, 10);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await EmailOTP.create({
    userId: user._id,
    email: user.email,
    hashedOTP,
    expiresAt,
  });

  try {
    await sendVerificationEmail(user.email, plainOTP, OTP_EXPIRY_MINUTES);
  } catch (emailError) {
    if ((process.env.NODE_ENV || NODE_ENV) !== "production") {
      return {
        userId: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        devOtp: plainOTP,
      };
    }

    await EmailOTP.deleteMany({ userId: user._id });
    throw new ApiError(
      500,
      "Failed to deliver verification email. Please check your email address or try again later."
    );
  }

  return {
    userId: user._id,
    name: user.name,
    email: user.email,
    isVerified: user.isVerified,
    devOtp: (process.env.NODE_ENV || NODE_ENV) === "development" ? plainOTP : undefined,
  };
};

/**
 * Helper to generate a device session and access/refresh token pair for a user
 */
export const createSessionAndTokens = async (user, deviceInfo = {}) => {
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  const session = new Session({
    userId: user._id,
    refreshTokenHash: "pending",
    revoked: false,
    expiresAt,
    lastUsedAt: new Date(),
    deviceInfo: {
      userAgent: deviceInfo.userAgent || "",
      ipAddress: deviceInfo.ipAddress || "",
      deviceType: deviceInfo.deviceType || "unknown",
    },
  });

  const refreshToken = generateRefreshToken(user._id, session._id);
  session.refreshTokenHash = hashToken(refreshToken);
  await session.save();

  const accessToken = generateAccessToken(user._id, session._id);

  return {
    user,
    accessToken,
    refreshToken,
  };
};

/**
 * Verifies a user's email address using a submitted 6-digit OTP.
 * Automatically provisions session tokens so the user is logged in immediately.
 */
export const verifyEmail = async ({ email, otp, deviceInfo = {} }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw new ApiError(404, "No account found with this email address.");
  }

  if (user.isVerified) {
    throw new ApiError(400, "This email is already verified. Please proceed to log in.");
  }

  const otpRecord = await EmailOTP.findOne({ userId: user._id }).sort({ createdAt: -1 });
  if (!otpRecord) {
    throw new ApiError(400, "No active verification code found or it has expired. Please request a new code.");
  }

  if (new Date() > new Date(otpRecord.expiresAt)) {
    await EmailOTP.deleteMany({ userId: user._id });
    throw new ApiError(400, "Verification code has expired. Please request a new code.");
  }

  const isMatch = await otpRecord.compareOTP(otp.trim());
  if (!isMatch) {
    throw new ApiError(400, "Invalid verification code. Please check and try again.");
  }

  user.isVerified = true;
  await user.save();

  await EmailOTP.deleteMany({ userId: user._id });

  // Provision session tokens for immediate automatic login
  const sessionData = await createSessionAndTokens(user, deviceInfo);

  return {
    userId: user._id,
    user,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: true,
    accessToken: sessionData.accessToken,
    refreshToken: sessionData.refreshToken,
  };
};

/**
 * Authenticates a verified user and creates a device session with access & refresh tokens.
 */
export const loginUser = async ({ email, password, deviceInfo = {} }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password.");
  }

  if (!user.isVerified) {
    throw new ApiError(403, "Please verify your email address before logging in.");
  }

  return await createSessionAndTokens(user, deviceInfo);
};

/**
 * Rotates refresh token and issues a new access token while detecting reuse attacks.
 */
export const rotateRefreshToken = async (rawRefreshToken) => {
  if (!rawRefreshToken) {
    throw new ApiError(401, "Refresh token required. Please log in.");
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(rawRefreshToken);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token.");
  }

  if (decoded.type !== "refresh" || !decoded.sessionId) {
    throw new ApiError(401, "Invalid token type provided for refresh.");
  }

  const session = await Session.findById(decoded.sessionId);
  if (!session || session.revoked) {
    await Session.deleteMany({ userId: decoded.userId });
    throw new ApiError(401, "Session has been invalidated or revoked. Please log in again.");
  }

  if (new Date() > new Date(session.expiresAt)) {
    await Session.findByIdAndDelete(session._id);
    throw new ApiError(401, "Session has expired. Please log in again.");
  }

  const isMatch = session.compareRefreshToken(rawRefreshToken);
  if (!isMatch) {
    await Session.updateMany({ userId: decoded.userId }, { revoked: true });
    await Session.deleteMany({ userId: decoded.userId });
    throw new ApiError(
      401,
      "Security violation: Reused refresh token detected. All active sessions have been revoked."
    );
  }

  const user = await User.findById(session.userId);
  if (!user || !user.isVerified) {
    await Session.findByIdAndDelete(session._id);
    throw new ApiError(401, "User account is unavailable or unverified.");
  }

  const newAccessToken = generateAccessToken(user._id, session._id);
  const newRefreshToken = generateRefreshToken(user._id, session._id);

  session.refreshTokenHash = hashToken(newRefreshToken);
  session.lastUsedAt = new Date();
  session.expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  await session.save();

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

/**
 * Logs out a single user device by revoking that specific session in MongoDB.
 */
export const logoutUser = async (rawRefreshToken) => {
  if (!rawRefreshToken) return;

  try {
    const decoded = verifyRefreshToken(rawRefreshToken);
    if (decoded?.sessionId) {
      await Session.findByIdAndUpdate(decoded.sessionId, { revoked: true });
      await Session.findByIdAndDelete(decoded.sessionId);
    } else {
      const tokenHash = hashToken(rawRefreshToken);
      await Session.deleteOne({ refreshTokenHash: tokenHash });
    }
  } catch {
    try {
      const tokenHash = hashToken(rawRefreshToken);
      await Session.deleteOne({ refreshTokenHash: tokenHash });
    } catch {
      // Gracefully ignore error and proceed
    }
  }
};

/**
 * Logs out all active sessions across all devices for a given user.
 */
export const logoutAllDevices = async (userId) => {
  if (!userId) return;
  await Session.updateMany({ userId }, { revoked: true });
  await Session.deleteMany({ userId });
};

/**
 * Initiates the password reset flow by sending a secure reset link.
 * Returns a generic success response regardless of email existence.
 * @param {Object} param0 - { email }
 */
export const forgotPassword = async ({ email }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const genericMessage = "If an account exists for that email, a password reset link has been sent.";

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return { message: genericMessage };
  }

  // Invalidate any existing reset tokens for this user
  await PasswordReset.deleteMany({ userId: user._id });

  // Generate cryptographically secure random token (64 hex characters)
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);

  // Store hashed token in database
  await PasswordReset.create({
    userId: user._id,
    tokenHash,
    expiresAt,
  });

  // Construct reset link using APP_URL
  const resetUrl = `${APP_URL}/reset-password?token=${rawToken}`;

  try {
    await sendPasswordResetEmail(user.email, resetUrl, RESET_TOKEN_EXPIRY_MINUTES, rawToken);
  } catch (error) {
    if ((process.env.NODE_ENV || NODE_ENV) === "production") {
      await PasswordReset.deleteMany({ userId: user._id });
      console.error(`❌ [Password Reset Error] Failed to send email: ${error.message}`);
    }
  }

  return { message: genericMessage };
};

/**
 * Resets user password, invalidates the token, and revokes all active sessions.
 * @param {Object} param0 - { token, newPassword }
 */
export const resetPassword = async ({ token, newPassword }) => {
  if (!token) {
    throw new ApiError(400, "Reset token is required.");
  }

  const tokenHash = hashToken(token.trim());

  // 1. Find matching reset record
  const resetRecord = await PasswordReset.findOne({ tokenHash });
  if (!resetRecord) {
    throw new ApiError(400, "Invalid or expired password reset link. Please request a new one.");
  }

  // 2. Explicit expiration check
  if (new Date() > new Date(resetRecord.expiresAt)) {
    await PasswordReset.deleteOne({ _id: resetRecord._id });
    throw new ApiError(400, "Password reset link has expired. Please request a new one.");
  }

  // 3. Find User
  const user = await User.findById(resetRecord.userId);
  if (!user) {
    await PasswordReset.deleteOne({ _id: resetRecord._id });
    throw new ApiError(400, "Invalid password reset link.");
  }

  // 4. Update Password with fresh bcrypt hash
  const passwordHash = await bcrypt.hash(newPassword, 10);
  user.passwordHash = passwordHash;
  await user.save();

  // 5. Invalidate used reset token immediately to prevent reuse
  await PasswordReset.deleteMany({ userId: user._id });

  // 6. Security Enforcement: Revoke all active sessions on all devices
  await Session.updateMany({ userId: user._id }, { revoked: true });
  await Session.deleteMany({ userId: user._id });

  return {
    message: "Password reset successfully. Please log in again.",
  };
};

const USER_PROFILE_FIELDS = "name email isVerified bio introduction role preferredRole experience availability skills interests github linkedin portfolio avatar location lookingTo createdAt";

/**
 * Fetches the authenticated user profile.
 */
export const getMe = async (userId) => {
  const user = await User.findById(userId).select(USER_PROFILE_FIELDS).lean();
  if (!user) {
    throw new ApiError(404, "User not found.");
  }
  return user;
};

/**
 * Updates authenticated user profile with canonical skill resolution and field sanitization.
 * User ID is strictly derived from authenticated JWT context.
 */
export const updateUserProfile = async (userId, profileData = {}) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  // 1. Explicitly forbid updating sensitive fields
  delete profileData.passwordHash;
  delete profileData.email;
  delete profileData.isVerified;
  delete profileData._id;
  delete profileData.userId;
  delete profileData.id;
  delete profileData.createdAt;
  delete profileData.updatedAt;

  // 2. Name validation & assignment
  if (profileData.name !== undefined) {
    const trimmedName = String(profileData.name).trim();
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      throw new ApiError(400, "Name must be between 2 and 50 characters.");
    }
    user.name = trimmedName;
  }

  // 3. String profile fields
  if (profileData.bio !== undefined) user.bio = String(profileData.bio).trim();
  if (profileData.introduction !== undefined) user.introduction = String(profileData.introduction).trim();
  if (profileData.role !== undefined) user.role = String(profileData.role).trim();
  if (profileData.preferredRole !== undefined) user.preferredRole = String(profileData.preferredRole).trim();
  if (profileData.experience !== undefined) user.experience = String(profileData.experience).trim();
  if (profileData.availability !== undefined) user.availability = String(profileData.availability).trim();
  if (profileData.location !== undefined) user.location = String(profileData.location).trim();
  if (profileData.github !== undefined) user.github = String(profileData.github).trim();
  if (profileData.linkedin !== undefined) user.linkedin = String(profileData.linkedin).trim();
  if (profileData.portfolio !== undefined) user.portfolio = String(profileData.portfolio).trim();
  if (profileData.avatar !== undefined) user.avatar = String(profileData.avatar).trim();

  // 4. Skills canonicalization (Part 5: "JS" -> "JavaScript", no duplicates)
  if (profileData.skills !== undefined) {
    let rawSkills = profileData.skills;
    if (typeof rawSkills === "string") {
      rawSkills = rawSkills.split(",").map((s) => s.trim()).filter(Boolean);
    }
    if (Array.isArray(rawSkills)) {
      const validSkillInputs = [];
      const seenInputs = new Set();
      for (const skillItem of rawSkills) {
        if (!skillItem || typeof skillItem !== "string") continue;
        const trimmed = skillItem.trim();
        if (!trimmed) continue;
        const lower = trimmed.toLowerCase();
        if (!seenInputs.has(lower)) {
          seenInputs.add(lower);
          validSkillInputs.push(trimmed);
        }
      }

      if (validSkillInputs.length === 0) {
        user.skills = [];
      } else {
        // Build regexes for all unique inputs and execute a single batch query
        const regexes = validSkillInputs.map(
          (s) => new RegExp(`^${s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")}$`, "i")
        );

        const matchedSkills = await Skill.find({
          $or: [
            { name: { $in: regexes } },
            { aliases: { $in: regexes } },
          ],
        }).lean();

        // Build lookup map by lowercase canonical name and aliases
        const skillLookup = new Map();
        for (const skill of matchedSkills) {
          skillLookup.set(skill.name.toLowerCase(), skill.name);
          if (Array.isArray(skill.aliases)) {
            for (const alias of skill.aliases) {
              if (alias && typeof alias === "string") {
                skillLookup.set(alias.toLowerCase(), skill.name);
              }
            }
          }
        }

        const canonicalSkills = [];
        const seenCanonical = new Set();
        for (const input of validSkillInputs) {
          const canonicalName = skillLookup.get(input.toLowerCase()) || input;
          const lower = canonicalName.toLowerCase();
          if (!seenCanonical.has(lower)) {
            seenCanonical.add(lower);
            canonicalSkills.push(canonicalName);
          }
        }

        user.skills = canonicalSkills;
      }
    }
  }

  // 5. Interests (Part 6: trimmed strings, no duplicates)
  if (profileData.interests !== undefined) {
    let rawInterests = profileData.interests;
    if (typeof rawInterests === "string") {
      rawInterests = rawInterests.split(",").map((i) => i.trim()).filter(Boolean);
    }
    if (Array.isArray(rawInterests)) {
      const uniqueInterests = [];
      const seen = new Set();
      for (const item of rawInterests) {
        if (!item || typeof item !== "string") continue;
        const trimmed = item.trim();
        if (!trimmed) continue;
        const lower = trimmed.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          uniqueInterests.push(trimmed);
        }
      }
      user.interests = uniqueInterests;
    }
  }

  // 6. LookingTo goals (supports string or array)
  if (profileData.lookingTo !== undefined) {
    user.lookingTo = profileData.lookingTo;
  }

  await user.save();

  // Return updated user document stripped of passwordHash and internal fields
  const updatedUser = await User.findById(userId).select(USER_PROFILE_FIELDS).lean();
  return updatedUser;
};

export default {
  registerUser,
  verifyEmail,
  loginUser,
  rotateRefreshToken,
  logoutUser,
  logoutAllDevices,
  forgotPassword,
  resetPassword,
  getMe,
  updateUserProfile,
};
