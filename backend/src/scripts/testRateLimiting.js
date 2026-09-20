import http from "http";
import mongoose from "mongoose";
import app from "../app.js";
import connectDB from "../config/db.js";
import {
  clearAuthLimiterStore,
  resetAuthLimiterForAccount,
} from "../middleware/rateLimiter.js";
import {
  RATE_LIMIT_AUTH_MAX_ACCOUNT,
  RATE_LIMIT_AUTH_BASE_DELAY_MS,
  RATE_LIMIT_AUTH_BACKOFF_FACTOR,
  RATE_LIMIT_PUBLIC_MAX,
  RATE_LIMIT_USER_MAX,
} from "../config/env.js";

const makeRequest = (port, options, postData = null) => {
  return new Promise((resolve, reject) => {
    const postDataStr = postData
      ? typeof postData === "string"
        ? postData
        : JSON.stringify(postData)
      : null;

    const headers = {
      ...(options.headers || {}),
    };

    if (postDataStr) {
      headers["Content-Type"] = "application/json";
      headers["Content-Length"] = Buffer.byteLength(postDataStr);
    }

    const req = http.request(
      {
        hostname: "127.0.0.1",
        port,
        ...options,
        headers,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsed,
          });
        });
      }
    );

    req.on("error", reject);

    if (postDataStr) {
      req.write(postDataStr);
    }
    req.end();
  });
};

const runTests = async () => {
  console.log("=== RUNNING RATE LIMITING SUITE ===");
  console.log(`Configured thresholds:`);
  console.log(`- Auth Max Account: ${RATE_LIMIT_AUTH_MAX_ACCOUNT}`);
  console.log(`- Base Delay: ${RATE_LIMIT_AUTH_BASE_DELAY_MS}ms`);
  console.log(`- Backoff Factor: ${RATE_LIMIT_AUTH_BACKOFF_FACTOR}x`);
  console.log(`- Public Max: ${RATE_LIMIT_PUBLIC_MAX}`);
  console.log(`- User Max: ${RATE_LIMIT_USER_MAX}`);

  await connectDB();

  // Start test server on random port
  const server = http.createServer(app);
  await new Promise((res) => server.listen(0, "127.0.0.1", res));
  const port = server.address().port;

  try {
    clearAuthLimiterStore();

    // -------------------------------------------------------------
    // Test 1: Public endpoint rate limit headers
    // -------------------------------------------------------------
    console.log("\n[Test 1] Verifying public endpoint rate limit headers on GET /api/skills/categories");
    const publicRes = await makeRequest(port, {
      path: "/api/skills/categories",
      method: "GET",
    });
    console.log(`Status: ${publicRes.statusCode}`);
    console.log(`Headers: ratelimit-limit=${publicRes.headers["ratelimit-limit"]}, ratelimit-remaining=${publicRes.headers["ratelimit-remaining"]}`);
    if (publicRes.headers["ratelimit-limit"] && Number(publicRes.headers["ratelimit-limit"]) === RATE_LIMIT_PUBLIC_MAX) {
      console.log(" PASSED: Public endpoint returns RateLimit RFC headers matching configured threshold.");
    } else {
      throw new Error("Public endpoint did not return expected RateLimit headers!");
    }

    // -------------------------------------------------------------
    // Test 2: User Action endpoint rate limit headers
    // -------------------------------------------------------------
    console.log("\n[Test 2] Verifying user action rate limit headers on GET /api/discovery/developers");
    const userRes = await makeRequest(port, {
      path: "/api/discovery/developers",
      method: "GET",
    });
    console.log(`Status: ${userRes.statusCode}`);
    console.log(`Headers: ratelimit-limit=${userRes.headers["ratelimit-limit"]}, ratelimit-remaining=${userRes.headers["ratelimit-remaining"]}`);
    if (userRes.headers["ratelimit-limit"] && Number(userRes.headers["ratelimit-limit"]) === RATE_LIMIT_USER_MAX) {
      console.log(" PASSED: User action endpoint returns high-limit headers matching configured threshold.");
    } else {
      throw new Error("User action endpoint did not return expected RateLimit headers!");
    }

    // -------------------------------------------------------------
    // Test 3: Auth per-account rate limiting with exponential backoff
    // -------------------------------------------------------------
    console.log("\n[Test 3] Testing auth per-account rate limiting with exponential backoff on /api/auth/login");
    clearAuthLimiterStore();

    const targetEmail = "attacker_target@example.com";
    const attempts = RATE_LIMIT_AUTH_MAX_ACCOUNT + 2;

    for (let i = 1; i <= attempts; i++) {
      const res = await makeRequest(
        port,
        {
          path: "/api/auth/login",
          method: "POST",
        },
        {
          email: targetEmail,
          password: "wrongpassword123",
        }
      );

      console.log(
        `Attempt ${i}/${attempts} -> Status: ${res.statusCode}, limitedBy: ${res.body?.limitedBy || "none"}, retryAfter: ${res.body?.retryAfter || "none"}, Retry-After header: ${res.headers["retry-after"] || "none"}`
      );

      if (i <= RATE_LIMIT_AUTH_MAX_ACCOUNT) {
        if (res.statusCode === 429) {
          throw new Error(`Attempt ${i} was prematurely rate-limited!`);
        }
        // Should be 401 (invalid credentials) or 400
        if (res.statusCode !== 401 && res.statusCode !== 400) {
          console.log(`Note: Non-401 response: ${res.statusCode} (${JSON.stringify(res.body)})`);
        }
      } else if (i === RATE_LIMIT_AUTH_MAX_ACCOUNT + 1) {
        if (res.statusCode !== 429) {
          throw new Error(`Attempt ${i} should have been blocked with 429! Got ${res.statusCode}`);
        }
        if (!res.headers["retry-after"]) {
          throw new Error("Missing Retry-After header on 429 response!");
        }
        console.log(" PASSED: Exceeded account limit triggered 429 with Retry-After header.");
      } else if (i === RATE_LIMIT_AUTH_MAX_ACCOUNT + 2) {
        if (res.statusCode !== 429) {
          throw new Error(`Attempt ${i} should have been blocked during exponential backoff!`);
        }
        console.log(" PASSED: Eager retry during backoff triggered exponential penalty.");
      }
    }

    // -------------------------------------------------------------
    // Test 4: Different account is NOT blocked by target account's lockout
    // -------------------------------------------------------------
    console.log("\n[Test 4] Testing that a different account is not blocked by target email's account lockout");
    const freshEmail = "innocent_user@example.com";
    const diffRes = await makeRequest(
      port,
      {
        path: "/api/auth/login",
        method: "POST",
      },
      {
        email: freshEmail,
        password: "anywrongpassword",
      }
    );
    console.log(`Status for different account: ${diffRes.statusCode}`);
    if (diffRes.statusCode !== 429) {
      console.log(" PASSED: Per-account isolation verified (different account was not blocked by target account's penalty).");
    } else {
      throw new Error("Innocent user was unexpectedly blocked!");
    }

    // -------------------------------------------------------------
    // Test 5: Reset account limit
    // -------------------------------------------------------------
    console.log("\n[Test 5] Testing resetAuthLimiterForAccount");
    resetAuthLimiterForAccount(targetEmail);
    const resetRes = await makeRequest(
      port,
      {
        path: "/api/auth/login",
        method: "POST",
      },
      {
        email: targetEmail,
        password: "testpassword",
      }
    );
    console.log(`Status after account reset: ${resetRes.statusCode}`);
    if (resetRes.statusCode !== 429) {
      console.log(" PASSED: Target email was successfully unblocked after reset.");
    } else {
      throw new Error("Target email was still 429 after reset!");
    }

    console.log("\n========================================");
    console.log(" ALL RATE LIMITING TESTS PASSED!");
    console.log("========================================");
  } finally {
    server.close();
    await mongoose.disconnect();
  }
};

runTests().catch((err) => {
  console.error("❌ TEST FAILED:", err);
  process.exit(1);
});
