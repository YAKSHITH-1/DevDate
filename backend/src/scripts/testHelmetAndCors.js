import http from "http";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { io as ClientIO } from "../../../app/node_modules/socket.io-client/build/esm/index.js";
import app from "../app.js";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import { JWT_SECRET } from "../config/env.js";
import { initSocket } from "../sockets/index.js";

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
    if (postDataStr) req.write(postDataStr);
    req.end();
  });
};

const connectSocketClient = (port, opts = {}) => {
  return new Promise((resolve) => {
    const socket = ClientIO(`http://127.0.0.1:${port}`, {
      transports: ["websocket", "polling"],
      reconnection: false,
      timeout: 3000,
      ...opts,
    });

    socket.on("connect", () => {
      resolve({ socket, success: true });
    });

    socket.on("connect_error", (err) => {
      resolve({ socket, success: false, error: err.message });
    });
  });
};

async function runTests() {
  console.log("=================================================================");
  console.log("🛡️  DEVDATE SECURITY VERIFICATION: HELMET + PRODUCTION CORS");
  console.log("=================================================================\n");

  await connectDB();

  // Find or create test user
  let testUser = await User.findOne({ isVerified: true });
  if (!testUser) {
    testUser = await User.create({
      name: "Security Test User",
      email: "helmet.cors@devdate.test",
      passwordHash: "$2a$10$dummyHashToSatisfyRequiredFieldCheck0000000000",
      role: "Developer",
      isVerified: true,
    });
  }

  const validUserId = testUser._id.toString();
  const validToken = jwt.sign(
    { userId: validUserId, type: "access" },
    JWT_SECRET,
    { expiresIn: "15m" }
  );

  const server = http.createServer(app);
  initSocket(server);

  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  console.log(`Test server running on port ${port}\n`);

  let totalTests = 0;
  let passedTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passedTests++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
    }
  }

  // --------------------------------------------------------------------------
  // SECTION 1: HELMET HTTP SECURITY HEADERS
  // --------------------------------------------------------------------------
  console.log("-------------------------------------------------------------");
  console.log("TEST SUITE 1: HELMET HTTP SECURITY HEADERS");
  console.log("-------------------------------------------------------------");

  {
    const res = await makeRequest(port, {
      path: "/health",
      method: "GET",
    });

    assert(
      res.headers["x-content-type-options"] === "nosniff",
      `Test 1.1: X-Content-Type-Options: nosniff header present (got '${res.headers["x-content-type-options"]}')`
    );

    assert(
      res.headers["x-frame-options"] === "SAMEORIGIN",
      `Test 1.2: X-Frame-Options: SAMEORIGIN header present (got '${res.headers["x-frame-options"]}')`
    );

    assert(
      res.headers["referrer-policy"] === "no-referrer" ||
        res.headers["referrer-policy"] === "strict-origin-when-cross-origin",
      `Test 1.3: Referrer-Policy header present (got '${res.headers["referrer-policy"]}')`
    );

    assert(
      res.headers["x-dns-prefetch-control"] === "off",
      `Test 1.4: X-DNS-Prefetch-Control: off header present (got '${res.headers["x-dns-prefetch-control"]}')`
    );

    assert(
      res.headers["x-download-options"] === "noopen",
      `Test 1.5: X-Download-Options: noopen header present (got '${res.headers["x-download-options"]}')`
    );

    assert(
      res.headers["x-permitted-cross-domain-policies"] === "none",
      `Test 1.6: X-Permitted-Cross-Domain-Policies: none header present (got '${res.headers["x-permitted-cross-domain-policies"]}')`
    );

    assert(
      !!res.headers["content-security-policy"],
      `Test 1.7: Content-Security-Policy header present (got '${res.headers["content-security-policy"]?.substring(0, 50)}...')`
    );
  }

  // --------------------------------------------------------------------------
  // SECTION 2: PRODUCTION CORS HARDENING (process.env.NODE_ENV = 'production')
  // --------------------------------------------------------------------------
  console.log("\n-------------------------------------------------------------");
  console.log("TEST SUITE 2: PRODUCTION CORS HARDENING");
  console.log("-------------------------------------------------------------");
  process.env.NODE_ENV = "production";
  process.env.ALLOWED_ORIGINS = "https://devdate.onrender.com,https://app.devdate.io";

  const trustedOrigin = "https://devdate.onrender.com";
  const untrustedOrigin = "https://evil-attacker.com";

  // Test 2.1: Allowed Trusted Origin GET request
  {
    const res = await makeRequest(port, {
      path: "/health",
      method: "GET",
      headers: { Origin: trustedOrigin },
    });
    assert(
      res.statusCode === 200 &&
        res.headers["access-control-allow-origin"] === trustedOrigin &&
        res.headers["access-control-allow-credentials"] === "true",
      `Test 2.1: Trusted origin '${trustedOrigin}' receives CORS allow headers (status: ${res.statusCode}, ACAO: '${res.headers["access-control-allow-origin"]}')`
    );
  }

  // Test 2.2: Allowed Trusted Origin Preflight OPTIONS request
  {
    const res = await makeRequest(port, {
      path: "/api/auth/login",
      method: "OPTIONS",
      headers: {
        Origin: trustedOrigin,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type,Authorization",
      },
    });
    assert(
      (res.statusCode === 204 || res.statusCode === 200) &&
        res.headers["access-control-allow-origin"] === trustedOrigin,
      `Test 2.2: Trusted origin preflight succeeds with status ${res.statusCode} and ACAO: '${res.headers["access-control-allow-origin"]}'`
    );
  }

  // Test 2.3: Untrusted Origin GET request blocked
  {
    const res = await makeRequest(port, {
      path: "/health",
      method: "GET",
      headers: { Origin: untrustedOrigin },
    });
    const originNotReflected = res.headers["access-control-allow-origin"] !== untrustedOrigin;
    assert(
      originNotReflected,
      `Test 2.3: Untrusted origin '${untrustedOrigin}' is NOT granted CORS access (ACAO header: ${res.headers["access-control-allow-origin"] || "none"})`
    );
  }

  // Test 2.4: Untrusted Origin Preflight OPTIONS request rejected
  {
    const res = await makeRequest(port, {
      path: "/api/auth/login",
      method: "OPTIONS",
      headers: {
        Origin: untrustedOrigin,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type,Authorization",
      },
    });
    const preflightBlocked =
      res.statusCode >= 400 || res.headers["access-control-allow-origin"] !== untrustedOrigin;
    assert(
      preflightBlocked,
      `Test 2.4: Untrusted origin preflight is blocked (status: ${res.statusCode}, ACAO: ${res.headers["access-control-allow-origin"] || "none"})`
    );
  }

  // Test 2.5: Native Mobile App / CLI / Keep-alive with No Origin header
  {
    const res = await makeRequest(port, {
      path: "/health",
      method: "GET",
    });
    assert(
      res.statusCode === 200 && res.body?.status === "ok",
      `Test 2.5: Request with No Origin header (Native Mobile / Keep-alive) succeeds (status: ${res.statusCode}, body: ${JSON.stringify(res.body)})`
    );
  }

  // Test 2.6: Socket.IO with Trusted Origin in Production
  {
    const { socket, success } = await connectSocketClient(port, {
      extraHeaders: { Origin: trustedOrigin },
      auth: { token: validToken },
    });
    assert(
      success === true,
      `Test 2.6: Socket.IO connection with trusted origin succeeds (success: ${success})`
    );
    if (socket) socket.close();
  }

  // Test 2.7: Socket.IO with Untrusted Origin in Production
  {
    const { socket, success, error } = await connectSocketClient(port, {
      extraHeaders: { Origin: untrustedOrigin },
      auth: { token: validToken },
    });
    assert(
      success === false,
      `Test 2.7: Socket.IO connection with untrusted origin is rejected by CORS (got success: ${success}, error: '${error}')`
    );
    if (socket) socket.close();
  }

  // --------------------------------------------------------------------------
  // SECTION 3: DEVELOPMENT CORS BEHAVIOR (process.env.NODE_ENV = 'development')
  // --------------------------------------------------------------------------
  console.log("\n-------------------------------------------------------------");
  console.log("TEST SUITE 3: DEVELOPMENT CORS BEHAVIOR");
  console.log("-------------------------------------------------------------");
  process.env.NODE_ENV = "development";

  // Test 3.1: Expo Metro Dev Server (localhost:8081)
  {
    const res = await makeRequest(port, {
      path: "/health",
      method: "GET",
      headers: { Origin: "http://localhost:8081" },
    });
    assert(
      res.statusCode === 200 &&
        res.headers["access-control-allow-origin"] === "http://localhost:8081",
      `Test 3.1: Development permits Expo Metro server http://localhost:8081 (got ACAO: '${res.headers["access-control-allow-origin"]}')`
    );
  }

  // Test 3.2: LAN Private IP (e.g. physical mobile device debugging over Wi-Fi)
  {
    const res = await makeRequest(port, {
      path: "/health",
      method: "GET",
      headers: { Origin: "http://10.116.246.33:8081" },
    });
    assert(
      res.statusCode === 200 &&
        res.headers["access-control-allow-origin"] === "http://10.116.246.33:8081",
      `Test 3.2: Development permits LAN IP origin http://10.116.246.33:8081 (got ACAO: '${res.headers["access-control-allow-origin"]}')`
    );
  }

  // --------------------------------------------------------------------------
  // SECTION 4: ENDPOINT FUNCTIONALITY & CONTRACT VERIFICATION
  // --------------------------------------------------------------------------
  console.log("\n-------------------------------------------------------------");
  console.log("TEST SUITE 4: ENDPOINT FUNCTIONALITY & CONTRACT VERIFICATION");
  console.log("-------------------------------------------------------------");

  // Health endpoint contracts
  {
    const res1 = await makeRequest(port, { path: "/health", method: "GET" });
    const res2 = await makeRequest(port, { path: "/api/health", method: "GET" });
    assert(
      res1.statusCode === 200 && res1.body?.status === "ok" &&
      res2.statusCode === 200 && res2.body?.status === "ok",
      `Test 4.1: /health and /api/health both return 200 OK {"status":"ok"}`
    );
  }

  // API Root / Landing endpoint
  {
    const res = await makeRequest(port, { path: "/", method: "GET" });
    assert(
      res.statusCode === 200,
      `Test 4.2: Root GET / returns 200 OK`
    );
  }

  // Public Skills endpoint
  {
    const res = await makeRequest(port, { path: "/api/skills/categories", method: "GET" });
    assert(
      res.statusCode === 200 && res.body?.success === true,
      `Test 4.3: GET /api/skills/categories returns 200 with skill categories`
    );
  }

  // Discovery developers list
  {
    const res = await makeRequest(port, { path: "/api/discovery/developers?limit=5", method: "GET" });
    assert(
      res.statusCode === 200 && res.body?.success === true,
      `Test 4.4: GET /api/discovery/developers returns 200 with developer list`
    );
  }

  // Authenticated user profile (/api/auth/me) with token
  {
    const res = await makeRequest(port, {
      path: "/api/auth/me",
      method: "GET",
      headers: { Authorization: `Bearer ${validToken}` },
    });
    assert(
      res.statusCode === 200 && res.body?.data?._id === validUserId,
      `Test 4.5: Authenticated GET /api/auth/me returns 200 with verified user profile`
    );
  }

  console.log("\n=================================================================");
  console.log(`🏁 TEST RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
  if (passedTests === totalTests) {
    console.log("🎉 ALL TESTS PASSED! HELMET & PRODUCTION CORS FULLY HARDENED.");
  } else {
    console.error("⚠️ SOME TESTS FAILED!");
  }
  console.log("=================================================================\n");

  server.close();
  await mongoose.disconnect();
  process.exit(passedTests === totalTests ? 0 : 1);
}

runTests().catch((err) => {
  console.error("Fatal error during test execution:", err);
  process.exit(1);
});
