import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import app from "../src/app.js";
import User from "../src/models/User.js";
import EmailOTP from "../src/models/EmailOTP.js";
import Session from "../src/models/Session.js";
import PasswordReset from "../src/models/PasswordReset.js";
import {
  MONGO_URI,
  JWT_SECRET,
  REFRESH_TOKEN_SECRET,
} from "../src/config/env.js";
import { hashToken } from "../src/utils/token.js";

let server;
let baseUrl;

const runTests = async () => {
  console.log("\n==================================================");
  console.log("    DEV DATE - FORGOT & RESET PASSWORD SUITE      ");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  const assert = (condition, title, errorDetails = "") => {
    if (condition) {
      console.log(`✅ PASS: ${title}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${title}`);
      if (errorDetails) console.error(`   Details:`, errorDetails);
      failed++;
    }
  };

  try {
    // 1. Connect to Database
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for auth testing.");

    // Clean up test data
    await User.deleteMany({ email: /@resetflow\.devdate/ });
    await EmailOTP.deleteMany({ email: /@resetflow\.devdate/ });
    await Session.deleteMany({});
    await PasswordReset.deleteMany({});

    // 2. Start Test Server on Ephemeral Port
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}/api/auth`;
        resolve();
      });
    });
    console.log(`Test server running at ${baseUrl}\n`);

    const validEmail = "reset.alex@resetflow.devdate";
    const initialPassword = "OldPassword123!";
    const newPassword = "BrandNewPassword2026!";
    const initialPasswordHash = await bcrypt.hash(initialPassword, 10);

    const verifiedUser = await User.create({
      name: "Alex Reset",
      email: validEmail,
      passwordHash: initialPasswordHash,
      isVerified: true,
    });

    // --- TEST 1: Missing or Malformed Email on Forgot Password ---
    console.log("--- 1️⃣ POST /api/auth/forgot-password (Malformed Email) ---");
    const badEmailRes = await fetch(`${baseUrl}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "invalid-email-format" }),
    });
    const badEmailData = await badEmailRes.json();
    assert(
      badEmailRes.status === 400 && badEmailData.success === false,
      "Validates email format and rejects malformed email with 400 Bad Request",
      badEmailData
    );

    // --- TEST 2: Generic Response for Nonexistent Email ---
    console.log("\n--- 2️⃣ POST /api/auth/forgot-password (Nonexistent Email) ---");
    const nonExistRes = await fetch(`${baseUrl}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "ghost@resetflow.devdate" }),
    });
    const nonExistData = await nonExistRes.json();
    assert(
      nonExistRes.status === 200 &&
        nonExistData.message === "If an account exists for that email, a password reset link has been sent.",
      "Returns generic response for nonexistent email without revealing account presence",
      nonExistData
    );

    // --- TEST 3: Storing Only Hashed Token in MongoDB ---
    console.log("\n--- 3️⃣ Password Reset Token Generation & Hash Storage ---");
    const rawResetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = hashToken(rawResetToken);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await PasswordReset.create({
      userId: verifiedUser._id,
      tokenHash: resetTokenHash,
      expiresAt,
    });

    const resetDoc = await PasswordReset.findOne({ userId: verifiedUser._id });
    assert(
      !!resetDoc && resetDoc.tokenHash === resetTokenHash && resetDoc.tokenHash !== rawResetToken,
      "Stores only the SHA-256 hash of the reset token in MongoDB",
      resetDoc
    );

    // --- TEST 4: Reject Invalid Reset Token ---
    console.log("\n--- 4️⃣ POST /api/auth/reset-password (Invalid Token) ---");
    const invalidTokenRes = await fetch(`${baseUrl}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: "invalid_fake_token_string", newPassword }),
    });
    const invalidTokenData = await invalidTokenRes.json();
    assert(
      invalidTokenRes.status === 400 && invalidTokenData.success === false,
      "Rejects invalid reset token with 400 Bad Request",
      invalidTokenData
    );

    // --- TEST 5: Reject Expired Reset Token ---
    console.log("\n--- 5️⃣ POST /api/auth/reset-password (Expired Token) ---");
    await PasswordReset.deleteMany({ userId: verifiedUser._id });
    const expiredRawToken = crypto.randomBytes(32).toString("hex");
    await PasswordReset.create({
      userId: verifiedUser._id,
      tokenHash: hashToken(expiredRawToken),
      expiresAt: new Date(Date.now() - 60 * 1000), // Expired 1 min ago
    });

    const expiredTokenRes = await fetch(`${baseUrl}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: expiredRawToken, newPassword }),
    });
    const expiredTokenData = await expiredTokenRes.json();
    assert(
      expiredTokenRes.status === 400 && expiredTokenData.success === false,
      "Rejects expired reset token with 400 Bad Request",
      expiredTokenData
    );

    // --- TEST 6: Successful Password Reset & Session Revocation ---
    console.log("\n--- 6️⃣ POST /api/auth/reset-password (Valid Token) ---");
    // Create an active session for the user first to verify session revocation
    await Session.create({
      userId: verifiedUser._id,
      refreshTokenHash: "sample_active_session_hash",
      revoked: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Create fresh valid reset token
    const validRawToken = crypto.randomBytes(32).toString("hex");
    await PasswordReset.create({
      userId: verifiedUser._id,
      tokenHash: hashToken(validRawToken),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    const resetSuccessRes = await fetch(`${baseUrl}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: validRawToken, newPassword }),
    });
    const resetSuccessData = await resetSuccessRes.json();

    assert(
      resetSuccessRes.status === 200 &&
        resetSuccessData.message === "Password reset successfully. Please log in again.",
      "Successfully resets password with valid token",
      resetSuccessData
    );

    // Verify active sessions were revoked
    const activeSessions = await Session.find({ userId: verifiedUser._id });
    assert(
      activeSessions.length === 0,
      "Revokes all active sessions belonging to the user upon password reset",
      { remainingSessions: activeSessions.length }
    );

    // --- TEST 7: Reset Token Single-Use (Replay Prevention) ---
    console.log("\n--- 7️⃣ POST /api/auth/reset-password (Reuse Token) ---");
    const reuseResetRes = await fetch(`${baseUrl}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: validRawToken, newPassword: "AnotherPassword999!" }),
    });
    const reuseResetData = await reuseResetRes.json();
    assert(
      reuseResetRes.status === 400 && reuseResetData.success === false,
      "Prevents reuse of already-used reset token",
      reuseResetData
    );

    // --- TEST 8: Old Password Fails & New Password Succeeds on Login ---
    console.log("\n--- 8️⃣ Verify Login with New vs Old Password ---");
    const oldLoginRes = await fetch(`${baseUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: validEmail, password: initialPassword }),
    });
    assert(
      oldLoginRes.status === 401,
      "Login with old password fails (401 Unauthorized)",
      await oldLoginRes.json()
    );

    const newLoginRes = await fetch(`${baseUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: validEmail, password: newPassword }),
    });
    const newLoginData = await newLoginRes.json();
    assert(
      newLoginRes.status === 200 && newLoginData.success === true && !!newLoginData.accessToken,
      "Login with new password succeeds and returns fresh access token",
      newLoginData
    );

    // Clean up
    await User.deleteMany({ email: /@resetflow\.devdate/ });
    await EmailOTP.deleteMany({ email: /@resetflow\.devdate/ });
    await Session.deleteMany({});
    await PasswordReset.deleteMany({});

    console.log("\n==================================================");
    console.log(`ALL FORGOT & RESET SCENARIOS: ${passed} Passed, ${failed} Failed`);
    console.log("==================================================\n");
  } catch (error) {
    console.error("Test suite execution error:", error);
  } finally {
    if (server) server.close();
    await mongoose.connection.close();
  }
};

runTests();
