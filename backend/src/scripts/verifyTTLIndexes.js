import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import Session from "../models/Session.js";
import EmailOTP from "../models/EmailOTP.js";
import PasswordReset from "../models/PasswordReset.js";
import { MONGO_URI } from "../config/env.js";

async function verifyTTLIndexes() {
  console.log("=================================================");
  console.log("     DevDate MongoDB TTL Indexes Verification     ");
  console.log("=================================================");

  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGO_URI);
    console.log(" Connected to MongoDB Atlas successfully!\n");

    const models = [
      { name: "Session", model: Session, expectedField: "expiresAt", collectionName: Session.collection.name },
      { name: "EmailOTP", model: EmailOTP, expectedField: "expiresAt", collectionName: EmailOTP.collection.name },
      { name: "PasswordReset", model: PasswordReset, expectedField: "expiresAt", collectionName: PasswordReset.collection.name },
    ];

    console.log("--- 1. Synchronizing Mongoose Schema Indexes with MongoDB Atlas ---");
    for (const m of models) {
      const syncResult = await m.model.syncIndexes();
      console.log(`  Synced indexes for ${m.name} (${m.collectionName}):`, syncResult || "Clean / No changes needed");
    }

    console.log("\n--- 2. Inspecting Live MongoDB Atlas Indexes ---");
    const reportData = [];

    for (const m of models) {
      const indexes = await m.model.collection.indexes();
      console.log(`\nCollection: [${m.collectionName}] (Model: ${m.name})`);
      console.log(`Total Indexes: ${indexes.length}`);

      let ttlIndexFound = null;
      const allIndexSummary = [];

      for (const idx of indexes) {
        const keyStr = JSON.stringify(idx.key);
        const isTTL = idx.expireAfterSeconds !== undefined;
        const ttlInfo = isTTL ? `(TTL: expireAfterSeconds = ${idx.expireAfterSeconds})` : "";
        console.log(`  - Index Name: "${idx.name}", Keys: ${keyStr} ${ttlInfo}`);

        allIndexSummary.push({
          name: idx.name,
          key: idx.key,
          unique: !!idx.unique,
          expireAfterSeconds: idx.expireAfterSeconds,
        });

        if (isTTL) {
          ttlIndexFound = idx;
        }
      }

      const hasCorrectTTL =
        ttlIndexFound &&
        ttlIndexFound.key[m.expectedField] === 1 &&
        ttlIndexFound.expireAfterSeconds === 0;

      reportData.push({
        name: m.name,
        collectionName: m.collectionName,
        expectedField: m.expectedField,
        ttlIndex: ttlIndexFound,
        hasCorrectTTL,
        allIndexes: allIndexSummary,
      });
    }

    console.log("\n--- 3. Testing Document Expiration Logic ---");

    // Test Session logic
    const testUserId = new mongoose.Types.ObjectId();
    const testSessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days in future
    const testSession = await Session.create({
      userId: testUserId,
      refreshTokenHash: "test_hash_1234567890abcdef",
      revoked: false,
      expiresAt: testSessionExpiry,
      deviceInfo: { userAgent: "TTL-Test-Agent", ipAddress: "127.0.0.1", deviceType: "test" },
    });
    console.log(`  [Session] Created test session ID ${testSession._id} expiring at ${testSession.expiresAt.toISOString()}`);
    const fetchedSession = await Session.findById(testSession._id);
    if (fetchedSession && fetchedSession.expiresAt.getTime() === testSessionExpiry.getTime()) {
      console.log("  [PASS] Session created with valid future expiresAt and preserved.");
    } else {
      console.error("  [FAIL] Session expiration mismatch.");
    }
    await Session.deleteOne({ _id: testSession._id });
    console.log("  [CLEANUP] Removed test session.");

    // Test EmailOTP logic
    const testOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes in future
    const testOTP = await EmailOTP.create({
      userId: testUserId,
      email: "ttl_test@devdate.internal",
      hashedOTP: "$2a$10$testHashedOTPPlaceholderForTesting1234567890",
      expiresAt: testOtpExpiry,
    });
    console.log(`  [EmailOTP] Created test OTP record ID ${testOTP._id} expiring at ${testOTP.expiresAt.toISOString()}`);
    const fetchedOTP = await EmailOTP.findById(testOTP._id);
    if (fetchedOTP && fetchedOTP.expiresAt.getTime() === testOtpExpiry.getTime()) {
      console.log("  [PASS] EmailOTP created with valid future expiresAt and preserved.");
    } else {
      console.error("  [FAIL] EmailOTP expiration mismatch.");
    }
    await EmailOTP.deleteOne({ _id: testOTP._id });
    console.log("  [CLEANUP] Removed test EmailOTP.");

    // Test PasswordReset logic
    const testResetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes in future
    const testReset = await PasswordReset.create({
      userId: testUserId,
      tokenHash: "test_reset_hash_1234567890abcdef",
      expiresAt: testResetExpiry,
    });
    console.log(`  [PasswordReset] Created test PasswordReset ID ${testReset._id} expiring at ${testReset.expiresAt.toISOString()}`);
    const fetchedReset = await PasswordReset.findById(testReset._id);
    if (fetchedReset && fetchedReset.expiresAt.getTime() === testResetExpiry.getTime()) {
      console.log("  [PASS] PasswordReset created with valid future expiresAt and preserved.");
    } else {
      console.error("  [FAIL] PasswordReset expiration mismatch.");
    }
    await PasswordReset.deleteOne({ _id: testReset._id });
    console.log("  [CLEANUP] Removed test PasswordReset.");

    console.log("\n=================================================");
    console.log("           TTL VERIFICATION SUMMARY              ");
    console.log("=================================================");
    for (const r of reportData) {
      console.log(`\nModel: ${r.name}`);
      console.log(`Collection: ${r.collectionName}`);
      console.log(`Field: ${r.expectedField}`);
      console.log(`TTL Index Present: ${r.ttlIndex ? "YES" : "NO"}`);
      if (r.ttlIndex) {
        console.log(`TTL Key: ${JSON.stringify(r.ttlIndex.key)}`);
        console.log(`TTL expireAfterSeconds: ${r.ttlIndex.expireAfterSeconds}`);
      }
      console.log(`Status: ${r.hasCorrectTTL ? "VERIFIED (Healthy & Active)" : "FAILED / MISCONFIGURED"}`);
    }

  } catch (error) {
    console.error("Verification failed with error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB.");
  }
}

verifyTTLIndexes();
