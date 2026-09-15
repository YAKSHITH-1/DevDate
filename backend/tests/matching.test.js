import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import app from "../src/app.js";
import User from "../src/models/User.js";
import Project from "../src/models/Project.js";
import Match from "../src/models/Match.js";
import { JWT_SECRET, MONGO_URI } from "../src/config/env.js";

let server;
let baseUrl;
let leadToken;
let dev1Token;
let dev2Token;
let unauthorizedToken;

let leadUser;
let dev1User;
let dev2User;
let unauthorizedUser;

let testProject1;
let testProject2;
let match1;
let match2;

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name, type: "access" },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
};

const runTests = async () => {
  console.log("\n============================================================");
  console.log("       DEV DATE - MATCHING MODULE TEST SUITE               ");
  console.log("============================================================\n");

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

    // 2. Start Test Server on Ephemeral Port
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}/api`;
        resolve();
      });
    });
    console.log(`Test server running at ${baseUrl}\n`);

    // 3. Setup Clean Test Users, Projects, and Matches
    const testEmails = [
      "matching.lead@devdate.test",
      "matching.dev1@devdate.test",
      "matching.dev2@devdate.test",
      "matching.unauth@devdate.test",
    ];

    await User.deleteMany({ email: { $in: testEmails } });
    await Project.deleteMany({ title: /Matching Test Project/i });
    await Match.deleteMany({});

    leadUser = await User.create({
      name: "Alex Lead",
      email: "matching.lead@devdate.test",
      passwordHash: "hash123",
      isVerified: true,
      role: "Project Lead",
      bio: "Tech lead looking for passionate devs",
    });

    dev1User = await User.create({
      name: "Dev Sarah",
      email: "matching.dev1@devdate.test",
      passwordHash: "hash123",
      isVerified: true,
      role: "Frontend Developer",
      skills: ["React", "CSS"],
      bio: "Frontend specialist",
    });

    dev2User = await User.create({
      name: "Dev John",
      email: "matching.dev2@devdate.test",
      passwordHash: "hash123",
      isVerified: true,
      role: "Backend Developer",
      skills: ["Node.js", "MongoDB"],
      bio: "Backend specialist",
    });

    unauthorizedUser = await User.create({
      name: "Other User",
      email: "matching.unauth@devdate.test",
      passwordHash: "hash123",
      isVerified: true,
      role: "Designer",
    });

    leadToken = generateToken(leadUser);
    dev1Token = generateToken(dev1User);
    dev2Token = generateToken(dev2User);
    unauthorizedToken = generateToken(unauthorizedUser);

    testProject1 = await Project.create({
      title: "Matching Test Project Alpha",
      description: "An AI-powered collaboration network for engineers",
      category: "Full Stack",
      duration: "4-6 weeks",
      teamSize: { min: 2, max: 5 },
      owner: leadUser._id,
      members: [leadUser._id],
      status: "OPEN",
    });

    testProject2 = await Project.create({
      title: "Matching Test Project Beta",
      description: "A real-time collaborative code editor in the browser",
      category: "Web Development",
      duration: "8 weeks",
      teamSize: { min: 2, max: 4 },
      owner: leadUser._id,
      members: [leadUser._id],
      status: "OPEN",
    });

    // Create 2 pending matches for dev1
    match1 = await Match.create({
      project: testProject1._id,
      user: dev1User._id,
      owner: leadUser._id,
      status: "PENDING",
    });

    match2 = await Match.create({
      project: testProject2._id,
      user: dev1User._id,
      owner: leadUser._id,
      status: "PENDING",
    });

    // --- TEST 1: Fetch Pending Invitations for Authenticated Developer ---
    const fetchRes = await fetch(`${baseUrl}/matching/invitations`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${dev1Token}`,
      },
    });
    const fetchJson = await fetchRes.json();

    assert(
      fetchRes.status === 200 && fetchJson.success === true && fetchJson.data.length === 2,
      "Developer can fetch all pending invitations",
      JSON.stringify(fetchJson)
    );

    const firstCard = fetchJson.data[0];
    assert(
      firstCard.projectName && firstCard.projectDescription && firstCard.lead && firstCard.invitationDate,
      "Invitation card contains projectName, projectDescription, lead details, and invitationDate",
      JSON.stringify(firstCard)
    );

    assert(
      firstCard.lead.name === "Alex Lead" && firstCard.lead.email === "matching.lead@devdate.test",
      "Lead details match the project owner",
      JSON.stringify(firstCard.lead)
    );

    // --- TEST 2: Authorization Check - Another user cannot approve dev1's invitation ---
    const unauthorizedApproveRes = await fetch(`${baseUrl}/matching/invitations/${match1._id}/accept`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${unauthorizedToken}`,
      },
    });
    const unauthorizedApproveJson = await unauthorizedApproveRes.json();

    assert(
      unauthorizedApproveRes.status === 403,
      "Unauthorized user cannot approve another developer's invitation (403 Forbidden)",
      JSON.stringify(unauthorizedApproveJson)
    );

    // --- TEST 3: Approve Invitation (Accept Match and Unlock Chat) ---
    const approveRes = await fetch(`${baseUrl}/matching/invitations/${match1._id}/accept`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${dev1Token}`,
      },
    });
    const approveJson = await approveRes.json();

    assert(
      approveRes.status === 200 && approveJson.success === true,
      "Developer successfully approves pending invitation",
      JSON.stringify(approveJson)
    );

    assert(
      approveJson.data.status === "ACCEPTED" && approveJson.data.chatUnlocked === true,
      "Approved match status is set to ACCEPTED and chat is unlocked",
      JSON.stringify(approveJson)
    );

    // Verify Project members updated
    const updatedProject1 = await Project.findById(testProject1._id);
    assert(
      updatedProject1.members.some((m) => m.toString() === dev1User._id.toString()),
      "Developer is added to project team members upon approval"
    );

    // --- TEST 4: Approved Invitation Removed from Pending List ---
    const afterApproveRes = await fetch(`${baseUrl}/matching/invitations`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${dev1Token}`,
      },
    });
    const afterApproveJson = await afterApproveRes.json();

    assert(
      afterApproveRes.status === 200 &&
      afterApproveJson.data.length === 1 &&
      afterApproveJson.data[0]._id.toString() === match2._id.toString(),
      "Approved invitation is automatically removed from pending invitations list",
      JSON.stringify(afterApproveJson)
    );

    // --- TEST 5: Cannot Process an Already Processed Invitation ---
    const reApproveRes = await fetch(`${baseUrl}/matching/invitations/${match1._id}/accept`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${dev1Token}`,
      },
    });
    const reApproveJson = await reApproveRes.json();

    assert(
      reApproveRes.status === 400,
      "Cannot re-approve an already accepted invitation (400 Bad Request)",
      JSON.stringify(reApproveJson)
    );

    // --- TEST 6: Authorization Check - Another user cannot reject dev1's invitation ---
    const unauthorizedRejectRes = await fetch(`${baseUrl}/matching/invitations/${match2._id}/reject`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${unauthorizedToken}`,
      },
    });
    const unauthorizedRejectJson = await unauthorizedRejectRes.json();

    assert(
      unauthorizedRejectRes.status === 403,
      "Unauthorized user cannot reject another developer's invitation (403 Forbidden)",
      JSON.stringify(unauthorizedRejectJson)
    );

    // --- TEST 7: Reject Invitation ---
    const rejectRes = await fetch(`${baseUrl}/matching/invitations/${match2._id}/reject`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${dev1Token}`,
      },
    });
    const rejectJson = await rejectRes.json();

    assert(
      rejectRes.status === 200 && rejectJson.success === true,
      "Developer successfully rejects pending invitation",
      JSON.stringify(rejectJson)
    );

    assert(
      rejectJson.data.status === "REJECTED" && rejectJson.data.chatUnlocked === false,
      "Rejected match status is set to REJECTED and does nothing else",
      JSON.stringify(rejectJson)
    );

    // --- TEST 8: Rejected Invitation Removed from Pending List ---
    const afterRejectRes = await fetch(`${baseUrl}/matching/invitations`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${dev1Token}`,
      },
    });
    const afterRejectJson = await afterRejectRes.json();

    assert(
      afterRejectRes.status === 200 && afterRejectJson.data.length === 0,
      "Rejected invitation is automatically removed from pending invitations list (pending list is now empty)",
      JSON.stringify(afterRejectJson)
    );

    // --- TEST 9: Cannot Process an Already Rejected Invitation ---
    const reRejectRes = await fetch(`${baseUrl}/matching/invitations/${match2._id}/reject`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${dev1Token}`,
      },
    });
    const reRejectJson = await reRejectRes.json();

    assert(
      reRejectRes.status === 400,
      "Cannot re-reject an already rejected invitation (400 Bad Request)",
      JSON.stringify(reRejectJson)
    );

    // --- TEST 10: Invalid Match ID format ---
    const invalidIdRes = await fetch(`${baseUrl}/matching/invitations/invalid-id-123/accept`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${dev1Token}`,
      },
    });
    const invalidIdJson = await invalidIdRes.json();

    assert(
      invalidIdRes.status === 400,
      "Invalid Match ID format yields 400 Validation Error",
      JSON.stringify(invalidIdJson)
    );

    // --- Clean Up ---
    await User.deleteMany({ email: { $in: testEmails } });
    await Project.deleteMany({ title: /Matching Test Project/i });
    await Match.deleteMany({ _id: { $in: [match1._id, match2._id] } });

    console.log("\n============================================================");
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("============================================================\n");
  } catch (error) {
    console.error("Test execution threw error:", error);
    failed++;
  } finally {
    if (server) server.close();
    await mongoose.connection.close();
    process.exit(failed > 0 ? 1 : 0);
  }
};

runTests();
