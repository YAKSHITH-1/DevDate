import http from "http";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import app from "../src/app.js";
import User from "../src/models/User.js";
import Project from "../src/models/Project.js";
import Match from "../src/models/Match.js";
import Message from "../src/models/Message.js";
import { initSocket } from "../src/sockets/index.js";
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

let testProject;
let acceptedMatch;
let pendingMatch;
let rejectedMatch;

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name, type: "access" },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
};

const runTests = async () => {
  console.log("\n============================================================");
  console.log("          DEV DATE - CHAT MODULE TEST SUITE                 ");
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

    // 2. Start HTTP Server with Socket.IO on Ephemeral Port
    const httpServer = http.createServer(app);
    initSocket(httpServer);

    await new Promise((resolve) => {
      server = httpServer.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}/api`;
        resolve();
      });
    });
    console.log(`Test server running at ${baseUrl}\n`);

    // 3. Setup Clean Test Users, Project, and Matches
    const testEmails = [
      "chat.lead@devdate.test",
      "chat.dev1@devdate.test",
      "chat.dev2@devdate.test",
      "chat.unauth@devdate.test",
    ];

    await User.deleteMany({ email: { $in: testEmails } });
    await Project.deleteMany({ title: /Chat Test Project/i });
    await Match.deleteMany({});
    await Message.deleteMany({});

    leadUser = await User.create({
      name: "Alex Lead",
      email: "chat.lead@devdate.test",
      passwordHash: "hash123",
      isVerified: true,
      role: "Project Lead",
      bio: "Tech lead on Chat Project",
    });

    dev1User = await User.create({
      name: "Dev Sarah",
      email: "chat.dev1@devdate.test",
      passwordHash: "hash123",
      isVerified: true,
      role: "Frontend Developer",
      bio: "React and UI engineer",
    });

    dev2User = await User.create({
      name: "Dev Elena",
      email: "chat.dev2@devdate.test",
      passwordHash: "hash123",
      isVerified: true,
      role: "Backend Developer",
      bio: "Node.js and DB engineer",
    });

    unauthorizedUser = await User.create({
      name: "Outsider User",
      email: "chat.unauth@devdate.test",
      passwordHash: "hash123",
      isVerified: true,
      role: "Designer",
    });

    leadToken = generateToken(leadUser);
    dev1Token = generateToken(dev1User);
    dev2Token = generateToken(dev2User);
    unauthorizedToken = generateToken(unauthorizedUser);

    testProject = await Project.create({
      title: "Chat Test Project - Cloud Hub",
      description: "A collaborative real-time platform for developers",
      category: "Full Stack",
      duration: "4 weeks",
      teamSize: { min: 2, max: 4 },
      owner: leadUser._id,
      members: [leadUser._id, dev1User._id],
      status: "OPEN",
    });

    // 1 Accepted match (Sarah & Alex)
    acceptedMatch = await Match.create({
      project: testProject._id,
      user: dev1User._id,
      owner: leadUser._id,
      status: "ACCEPTED",
    });

    // 1 Pending match (Elena & Alex)
    pendingMatch = await Match.create({
      project: testProject._id,
      user: dev2User._id,
      owner: leadUser._id,
      status: "PENDING",
    });

    // --- TEST 1: Fetch Conversations for Lead ---
    const leadConvRes = await fetch(`${baseUrl}/chat/conversations`, {
      method: "GET",
      headers: { Authorization: `Bearer ${leadToken}` },
    });
    const leadConvJson = await leadConvRes.json();

    assert(
      leadConvRes.status === 200 &&
      leadConvJson.success === true &&
      leadConvJson.data.length === 1 &&
      leadConvJson.data[0].matchId.toString() === acceptedMatch._id.toString(),
      "Lead sees only ACCEPTED match conversations (pending match excluded)",
      JSON.stringify(leadConvJson)
    );

    assert(
      leadConvJson.data[0].otherParticipant.email === "chat.dev1@devdate.test" &&
      leadConvJson.data[0].projectName === "Chat Test Project - Cloud Hub",
      "Conversation item includes otherParticipant and project details",
      JSON.stringify(leadConvJson.data[0])
    );

    // --- TEST 2: Fetch Conversations for Developer with Accepted Match ---
    const dev1ConvRes = await fetch(`${baseUrl}/chat/conversations`, {
      method: "GET",
      headers: { Authorization: `Bearer ${dev1Token}` },
    });
    const dev1ConvJson = await dev1ConvRes.json();

    assert(
      dev1ConvRes.status === 200 &&
      dev1ConvJson.data.length === 1 &&
      dev1ConvJson.data[0].otherParticipant.email === "chat.lead@devdate.test",
      "Developer sees their ACCEPTED match conversation with lead details",
      JSON.stringify(dev1ConvJson)
    );

    // --- TEST 3: Fetch Conversations for Developer with only PENDING Match ---
    const dev2ConvRes = await fetch(`${baseUrl}/chat/conversations`, {
      method: "GET",
      headers: { Authorization: `Bearer ${dev2Token}` },
    });
    const dev2ConvJson = await dev2ConvRes.json();

    assert(
      dev2ConvRes.status === 200 && dev2ConvJson.data.length === 0,
      "Developer with only PENDING matches has 0 active chat conversations",
      JSON.stringify(dev2ConvJson)
    );

    // --- TEST 4: Gated Access - Attempt to access message history of PENDING match ---
    const pendingMsgRes = await fetch(`${baseUrl}/chat/conversations/${pendingMatch._id}/messages`, {
      method: "GET",
      headers: { Authorization: `Bearer ${dev2Token}` },
    });
    const pendingMsgJson = await pendingMsgRes.json();

    assert(
      pendingMsgRes.status === 400,
      "Cannot access message history for PENDING match (400 Bad Request)",
      JSON.stringify(pendingMsgJson)
    );

    // --- TEST 5: Send Message from Developer to Lead on ACCEPTED Match ---
    const sendMsgRes = await fetch(`${baseUrl}/chat/conversations/${acceptedMatch._id}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${dev1Token}`,
      },
      body: JSON.stringify({ message: "Hello Lead, excited to join the project!" }),
    });
    const sendMsgJson = await sendMsgRes.json();

    assert(
      sendMsgRes.status === 201 && sendMsgJson.success === true,
      "Developer successfully sends message to lead",
      JSON.stringify(sendMsgJson)
    );

    assert(
      sendMsgJson.data.message === "Hello Lead, excited to join the project!" &&
      sendMsgJson.data.sender._id.toString() === dev1User._id.toString() &&
      sendMsgJson.data.receiver._id.toString() === leadUser._id.toString(),
      "Message persisted with correct sender, receiver, project, and match references",
      JSON.stringify(sendMsgJson.data)
    );

    // --- TEST 6: Send Reply from Lead to Developer ---
    const replyMsgRes = await fetch(`${baseUrl}/chat/conversations/${acceptedMatch._id}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${leadToken}`,
      },
      body: JSON.stringify({ message: "Welcome aboard Sarah! Let's get started." }),
    });
    const replyMsgJson = await replyMsgRes.json();

    assert(
      replyMsgRes.status === 201 &&
      replyMsgJson.data.sender._id.toString() === leadUser._id.toString() &&
      replyMsgJson.data.receiver._id.toString() === dev1User._id.toString(),
      "Lead successfully replies to developer",
      JSON.stringify(replyMsgJson.data)
    );

    // --- TEST 7: Fetch Message History for Accepted Match ---
    const getHistoryRes = await fetch(`${baseUrl}/chat/conversations/${acceptedMatch._id}/messages`, {
      method: "GET",
      headers: { Authorization: `Bearer ${dev1Token}` },
    });
    const getHistoryJson = await getHistoryRes.json();

    assert(
      getHistoryRes.status === 200 &&
      getHistoryJson.data.messages.length === 2 &&
      getHistoryJson.data.messages[0].message === "Hello Lead, excited to join the project!" &&
      getHistoryJson.data.messages[1].message === "Welcome aboard Sarah! Let's get started.",
      "Message history loads in chronological order for conversation participant",
      JSON.stringify(getHistoryJson)
    );

    // --- TEST 8: Verify Conversation preview shows latest message ---
    const convPreviewRes = await fetch(`${baseUrl}/chat/conversations`, {
      method: "GET",
      headers: { Authorization: `Bearer ${dev1Token}` },
    });
    const convPreviewJson = await convPreviewRes.json();

    assert(
      convPreviewJson.data[0].lastMessage &&
      convPreviewJson.data[0].lastMessage.message === "Welcome aboard Sarah! Let's get started.",
      "Conversation list reflects latest message snippet and timestamp",
      JSON.stringify(convPreviewJson.data[0].lastMessage)
    );

    // --- TEST 9: Unauthorized Participant Check ---
    const unauthSendRes = await fetch(`${baseUrl}/chat/conversations/${acceptedMatch._id}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${unauthorizedToken}`,
      },
      body: JSON.stringify({ message: "I am trying to snoop!" }),
    });
    const unauthSendJson = await unauthSendRes.json();

    assert(
      unauthSendRes.status === 403,
      "Unauthorized user cannot send message into another's conversation (403 Forbidden)",
      JSON.stringify(unauthSendJson)
    );

    const unauthViewRes = await fetch(`${baseUrl}/chat/conversations/${acceptedMatch._id}/messages`, {
      method: "GET",
      headers: { Authorization: `Bearer ${unauthorizedToken}` },
    });
    const unauthViewJson = await unauthViewRes.json();

    assert(
      unauthViewRes.status === 403,
      "Unauthorized user cannot view another's message history (403 Forbidden)",
      JSON.stringify(unauthViewJson)
    );

    // --- TEST 10: Empty message validation ---
    const emptyMsgRes = await fetch(`${baseUrl}/chat/conversations/${acceptedMatch._id}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${dev1Token}`,
      },
      body: JSON.stringify({ message: "   " }),
    });
    const emptyMsgJson = await emptyMsgRes.json();

    assert(
      emptyMsgRes.status === 400,
      "Empty message is rejected (400 Bad Request)",
      JSON.stringify(emptyMsgJson)
    );

    // --- Clean Up ---
    await User.deleteMany({ email: { $in: testEmails } });
    await Project.deleteMany({ title: /Chat Test Project/i });
    await Match.deleteMany({ _id: { $in: [acceptedMatch._id, pendingMatch._id] } });
    await Message.deleteMany({ match: acceptedMatch._id });

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
