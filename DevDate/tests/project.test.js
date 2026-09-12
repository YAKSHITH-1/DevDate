import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import app from "../src/app.js";
import User from "../src/models/User.js";
import Project from "../src/models/Project.js";
import Skill from "../src/models/Skill.js";
import { JWT_SECRET, MONGO_URI } from "../src/config/env.js";
import { seedSkills } from "../src/scripts/seedSkills.js";

let server;
let baseUrl;
let ownerToken;
let otherToken;
let ownerUser;
let otherUser;
let createdProjectId;
let sampleSkills = [];

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
};

const runTests = async () => {
  console.log("\n==========================================");
  console.log("   DEV DATE - PROJECT API TESTS (SKILLS)  ");
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
    console.log("Connected to MongoDB for testing.");

    // 2. Ensure Skills are seeded
    await seedSkills();
    sampleSkills = await Skill.find({
      name: { $in: ["React", "Node.js", "Express.js", "MongoDB", "TypeScript"] },
    });

    const skillIds = sampleSkills.map((s) => s._id.toString());
    console.log(`Found ${sampleSkills.length} sample skills for testing.`);

    // 3. Start Test Server on Ephemeral Port
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}/api/projects`;
        resolve();
      });
    });
    console.log(`Test server running at ${baseUrl}\n`);

    // 4. Setup Test Users
    await User.deleteMany({ email: { $in: ["owner@devdate.test", "other@devdate.test"] } });
    await Project.deleteMany({ title: /DevDate Test Project/i });

    ownerUser = await User.create({
      name: "Owner User",
      email: "owner@devdate.test",
      passwordHash: "hashedpassword123",
      role: "Full Stack Developer",
      skills: ["React", "Node.js", "MongoDB"],
      interests: ["Open Source", "Web3"],
      bio: "Test project owner",
    });

    otherUser = await User.create({
      name: "Other User",
      email: "other@devdate.test",
      passwordHash: "hashedpassword123",
      role: "UI/UX Designer",
      skills: ["Figma", "CSS"],
      interests: ["Design Systems"],
      bio: "Another user",
    });

    ownerToken = generateToken(ownerUser);
    otherToken = generateToken(otherUser);

    console.log("--- 1️⃣ POST /projects (Create Project) ---");

    // Test 1.1: Successful Project Creation with requiredSkills ObjectIds
    const createRes = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        title: "DevDate Test Project - Collab Matcher",
        description: "A comprehensive collaboration platform for students to find project partners.",
        requiredSkills: skillIds.slice(0, 4), // React, Node.js, Express.js, MongoDB
        interests: ["EdTech", "Collaboration"],
        requiredRoles: ["Frontend Developer", "Backend Developer"],
        category: "Web Development",
        duration: "4-6 weeks",
        teamSize: { min: 2, max: 4 },
        image: "https://example.com/project-banner.png",
      }),
    });

    const createData = await createRes.json();
    assert(
      createRes.status === 201 && createData.success === true && createData.data?._id,
      "POST /projects creates project and returns 201 Created",
      createData
    );

    createdProjectId = createData.data?._id;

    assert(
      createData.data?.status === "OPEN" &&
        createData.data?.owner?._id === ownerUser._id.toString() &&
        createData.data?.members?.length === 1 &&
        createData.data?.members[0]?._id === ownerUser._id.toString(),
      "Project initialized with status 'OPEN' and owner as the first member",
      createData.data
    );

    // Verify requiredSkills is populated with name and categories
    assert(
      Array.isArray(createData.data?.requiredSkills) &&
        createData.data?.requiredSkills.length === 4 &&
        createData.data?.requiredSkills[0]?.name &&
        Array.isArray(createData.data?.requiredSkills[0]?.categories),
      "Project response has populated requiredSkills with name and categories",
      createData.data?.requiredSkills
    );

    // Test 1.2: Validation Error - Missing Title and Empty requiredSkills
    const invalidCreateRes = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        description: "too short",
        requiredSkills: [],
      }),
    });
    const invalidCreateData = await invalidCreateRes.json();
    assert(
      invalidCreateRes.status === 400 && invalidCreateData.success === false,
      "POST /projects returns 400 Bad Request on empty requiredSkills or invalid fields",
      invalidCreateData
    );

    // Test 1.3: Validation Error - Invalid/Non-existent Skill ObjectId
    const nonExistentSkillId = new mongoose.Types.ObjectId().toString();
    const invalidSkillCreateRes = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        title: "DevDate Test Project - Invalid Skill ID",
        description: "A comprehensive collaboration platform for students to find project partners.",
        requiredSkills: [nonExistentSkillId],
        requiredRoles: ["Backend Developer"],
        category: "Web Development",
        duration: "4-6 weeks",
        teamSize: { min: 2, max: 4 },
      }),
    });
    const invalidSkillData = await invalidSkillCreateRes.json();
    assert(
      invalidSkillCreateRes.status === 400 && invalidSkillData.success === false,
      "POST /projects returns 400 Bad Request for non-existent Skill ObjectId",
      invalidSkillData
    );

    // Test 1.4: Validation Error - Arbitrary string skill (non-MongoId)
    const rawStringSkillRes = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        title: "DevDate Test Project - Raw String Skill",
        description: "A comprehensive collaboration platform for students to find project partners.",
        requiredSkills: ["Arbitrary String Skill"],
        requiredRoles: ["Backend Developer"],
        category: "Web Development",
        duration: "4-6 weeks",
        teamSize: { min: 2, max: 4 },
      }),
    });
    assert(
      rawStringSkillRes.status === 400,
      "POST /projects rejects arbitrary non-ObjectId string skills with 400"
    );

    // Test 1.5: Authentication Error - Missing Token
    const unauthCreateRes = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Valid Title Here", description: "Valid length description text here..." }),
    });
    assert(
      unauthCreateRes.status === 401,
      "POST /projects returns 401 Unauthorized when no token provided"
    );

    console.log("\n--- 2️⃣ GET /projects/:id (Get Project Details) ---");

    // Test 2.1: Successful Fetch with Populated requiredSkills
    const getRes = await fetch(`${baseUrl}/${createdProjectId}`);
    const getData = await getRes.json();
    assert(
      getRes.status === 200 &&
        getData.success === true &&
        getData.data?._id === createdProjectId &&
        getData.data?.owner?.name === "Owner User" &&
        Array.isArray(getData.data?.requiredSkills) &&
        getData.data?.requiredSkills.length === 4 &&
        getData.data?.requiredSkills[0]?.name !== undefined,
      "GET /projects/:id returns 200 OK with populated owner, members, and requiredSkills",
      getData
    );

    // Test 2.2: Non-existent Project ID
    const nonExistentId = new mongoose.Types.ObjectId();
    const notFoundRes = await fetch(`${baseUrl}/${nonExistentId}`);
    const notFoundData = await notFoundRes.json();
    assert(
      notFoundRes.status === 404 && notFoundData.success === false,
      "GET /projects/:id returns 404 Not Found for non-existent ID",
      notFoundData
    );

    console.log("\n--- 3️⃣ PATCH /projects/:id (Update Project) ---");

    // Test 3.1: Successful Update by Owner with new requiredSkills
    const updateRes = await fetch(`${baseUrl}/${createdProjectId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        title: "DevDate Test Project - Updated Title",
        requiredSkills: [skillIds[0], skillIds[1], skillIds[4]], // React, Node.js, TypeScript
        teamSize: { min: 3, max: 5 },
      }),
    });
    const updateData = await updateRes.json();
    assert(
      updateRes.status === 200 &&
        updateData.success === true &&
        updateData.data?.title === "DevDate Test Project - Updated Title" &&
        updateData.data?.requiredSkills?.some((s) => s.name === "TypeScript"),
      "PATCH /projects/:id updates project fields and requiredSkills when called by owner",
      updateData
    );

    // Test 3.2: Forbidden Update by Non-Owner
    const forbiddenUpdateRes = await fetch(`${baseUrl}/${createdProjectId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${otherToken}`,
      },
      body: JSON.stringify({
        title: "Hacked Title By Other User",
      }),
    });
    const forbiddenUpdateData = await forbiddenUpdateRes.json();
    assert(
      forbiddenUpdateRes.status === 403 && forbiddenUpdateData.success === false,
      "PATCH /projects/:id returns 403 Forbidden when called by non-owner",
      forbiddenUpdateData
    );

    // Test 3.3: Invalid teamSize update (max < min)
    const invalidTeamSizeRes = await fetch(`${baseUrl}/${createdProjectId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        teamSize: { min: 5, max: 2 },
      }),
    });
    assert(
      invalidTeamSizeRes.status === 400,
      "PATCH /projects/:id returns 400 when teamSize.max < teamSize.min"
    );

    // Test 3.4: Update with invalid/non-existent skill ID
    const invalidSkillUpdateRes = await fetch(`${baseUrl}/${createdProjectId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        requiredSkills: [nonExistentSkillId],
      }),
    });
    assert(
      invalidSkillUpdateRes.status === 400,
      "PATCH /projects/:id rejects non-existent skill ID with 400"
    );

    console.log("\n--- 4️⃣ POST /projects/:id/close (Close Project) ---");

    // Test 4.1: Forbidden Close by Non-Owner
    const forbiddenCloseRes = await fetch(`${baseUrl}/${createdProjectId}/close`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${otherToken}`,
      },
    });
    assert(
      forbiddenCloseRes.status === 403,
      "POST /projects/:id/close returns 403 Forbidden when called by non-owner"
    );

    // Test 4.2: Successful Close by Owner
    const closeRes = await fetch(`${baseUrl}/${createdProjectId}/close`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ownerToken}`,
      },
    });
    const closeData = await closeRes.json();
    assert(
      closeRes.status === 200 &&
        closeData.success === true &&
        closeData.data?.status === "CLOSED" &&
        Array.isArray(closeData.data?.requiredSkills),
      "POST /projects/:id/close closes the project and returns populated requiredSkills",
      closeData
    );

    // Test 4.3: Already Closed Project
    const alreadyClosedRes = await fetch(`${baseUrl}/${createdProjectId}/close`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ownerToken}`,
      },
    });
    assert(
      alreadyClosedRes.status === 400,
      "POST /projects/:id/close returns 400 Bad Request if project is already closed"
    );

    console.log("\n==========================================");
    console.log(`   TEST SUMMARY: ${passed} PASSED, ${failed} FAILED   `);
    console.log("==========================================\n");
  } catch (err) {
    console.error("Test execution failed with error:", err);
  } finally {
    // Cleanup
    if (ownerUser || otherUser) {
      await User.deleteMany({ email: { $in: ["owner@devdate.test", "other@devdate.test"] } });
    }
    if (createdProjectId) {
      await Project.deleteMany({ _id: createdProjectId });
    }
    if (server) {
      server.close();
    }
    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
  }
};

runTests();
