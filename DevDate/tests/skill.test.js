import mongoose from "mongoose";
import app from "../src/app.js";
import Skill from "../src/models/Skill.js";
import { MONGO_URI } from "../src/config/env.js";
import { seedSkills } from "../src/scripts/seedSkills.js";

let server;
let baseUrl;

const runTests = async () => {
  console.log("\n==========================================");
  console.log("       DEV DATE - SKILL API TESTS         ");
  console.log("==========================================\n");

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
    console.log("Connected to MongoDB for skill testing.");

    // 2. Ensure skills are seeded
    await seedSkills();

    // 3. Start Test Server on Ephemeral Port
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}/api/skills`;
        resolve();
      });
    });
    console.log(`Test server running at ${baseUrl}\n`);

    console.log("--- 1️⃣ GET /api/skills/categories ---");
    const catRes = await fetch(`${baseUrl}/categories`);
    const catData = await catRes.json();
    assert(
      catRes.status === 200 &&
        catData.success === true &&
        Array.isArray(catData.data) &&
        catData.data.length === 15,
      "GET /api/skills/categories returns 15 categories",
      catData
    );

    console.log("\n--- 2️⃣ GET /api/skills (All Skills) ---");
    const allRes = await fetch(baseUrl);
    const allData = await allRes.json();
    assert(
      allRes.status === 200 &&
        allData.success === true &&
        Array.isArray(allData.data) &&
        allData.data.length >= 100,
      `GET /api/skills returns at least 100 skills (actual: ${allData.data?.length})`,
      allData
    );

    console.log("\n--- 3️⃣ GET /api/skills?category=Frontend%20Development ---");
    const frontendRes = await fetch(`${baseUrl}?category=Frontend%20Development`);
    const frontendData = await frontendRes.json();
    const allAreFrontend = frontendData.data?.every((s) =>
      s.categories.includes("Frontend Development")
    );
    assert(
      frontendRes.status === 200 &&
        frontendData.success === true &&
        frontendData.data.length > 0 &&
        allAreFrontend,
      "GET /api/skills?category=Frontend%20Development returns filtered skills",
      frontendData
    );

    console.log("\n--- 4️⃣ GET /api/skills?search=js (Alias Search) ---");
    const jsRes = await fetch(`${baseUrl}?search=js`);
    const jsData = await jsRes.json();
    const foundJs = jsData.data?.some((s) => s.name === "JavaScript");
    assert(
      jsRes.status === 200 && jsData.success === true && foundJs,
      "GET /api/skills?search=js resolves alias and returns 'JavaScript'",
      jsData
    );

    console.log("\n--- 5️⃣ GET /api/skills/:id (Single Skill) ---");
    const sampleSkill = await Skill.findOne({ name: "JavaScript" });
    const singleRes = await fetch(`${baseUrl}/${sampleSkill._id}`);
    const singleData = await singleRes.json();
    assert(
      singleRes.status === 200 &&
        singleData.success === true &&
        singleData.data?.name === "JavaScript" &&
        Array.isArray(singleData.data?.categories),
      "GET /api/skills/:id returns the skill document",
      singleData
    );

    console.log("\n--- 6️⃣ GET /api/skills/:id (Not Found & Invalid) ---");
    const nonExistentId = new mongoose.Types.ObjectId();
    const notFoundRes = await fetch(`${baseUrl}/${nonExistentId}`);
    assert(
      notFoundRes.status === 404,
      "GET /api/skills/:id returns 404 for non-existent skill ID"
    );

    const invalidIdRes = await fetch(`${baseUrl}/invalid-id-123`);
    assert(
      invalidIdRes.status === 400,
      "GET /api/skills/:id returns 400 for malformed ObjectId"
    );

    console.log("\n==========================================");
    console.log(`   TEST SUMMARY: ${passed} PASSED, ${failed} FAILED   `);
    console.log("==========================================\n");
  } catch (err) {
    console.error("Test execution failed with error:", err);
  } finally {
    if (server) {
      server.close();
    }
    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
  }
};

runTests();
