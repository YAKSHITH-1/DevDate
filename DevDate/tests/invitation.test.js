import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import app from "../src/app.js";
import User from "../src/models/User.js";
import Project from "../src/models/Project.js";
import Skill from "../src/models/Skill.js";
import Invitation from "../src/models/Invitation.js";
import Notification from "../src/models/Notification.js";
import { JWT_SECRET, MONGO_URI } from "../src/config/env.js";
import { seedSkills } from "../src/scripts/seedSkills.js";

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
let createdInvitation1Id;
let createdInvitation2Id;
let createdInvitation3Id;

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
};

const runTests = async () => {
  console.log("\n============================================================");
  console.log("   DEV DATE - DISCOVER & INVITATION MODULE TEST SUITE      ");
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

    // 2. Ensure Skills are seeded
    await seedSkills();

    // 3. Start Test Server on Ephemeral Port
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}/api`;
        resolve();
      });
    });
    console.log(`Test server running at ${baseUrl}\n`);

    // 4. Setup Clean Test Users and Project
    const testEmails = [
      "lead.test@devdate.test",
      "dev1.test@devdate.test",
      "dev2.test@devdate.test",
      "unauthorized.test@devdate.test",
    ];

    await User.deleteMany({ email: { $in: testEmails } });
    await Project.deleteMany({ title: /DevDate Invitation Test Project/i });
    await Invitation.deleteMany({});
    await Notification.deleteMany({});

    leadUser = await User.create({
      name: "Lead Tester",
      email: "lead.test@devdate.test",
      passwordHash: "hash123",
      role: "Project Lead",
      preferredRole: "Project Lead",
      experience: "5+ years",
      availability: "Full-time",
      skills: ["System Design", "Node.js"],
      bio: "Test lead user",
      introduction: "Leading awesome test projects",
    });

    dev1User = await User.create({
      name: "Sarah DevOne",
      email: "dev1.test@devdate.test",
      passwordHash: "hash123",
      role: "Frontend Developer",
      preferredRole: "Frontend Developer",
      experience: "3 years in React",
      availability: "Immediate",
      skills: ["React", "TypeScript", "Tailwind CSS"],
      bio: "Passionate about React frontends",
      introduction: "Ready to build dynamic UIs",
    });

    dev2User = await User.create({
      name: "Elena DevTwo",
      email: "dev2.test@devdate.test",
      passwordHash: "hash123",
      role: "Backend Developer",
      preferredRole: "Backend Developer",
      experience: "4 years in Node.js",
      availability: "Part-time",
      skills: ["Node.js", "Express.js", "MongoDB"],
      bio: "Passionate about backend architectures",
      introduction: "Building high speed APIs",
    });

    unauthorizedUser = await User.create({
      name: "Other User",
      email: "unauthorized.test@devdate.test",
      passwordHash: "hash123",
      role: "Designer",
      skills: ["Figma"],
    });

    leadToken = generateToken(leadUser);
    dev1Token = generateToken(dev1User);
    dev2Token = generateToken(dev2User);
    unauthorizedToken = generateToken(unauthorizedUser);

    testProject = await Project.create({
      title: "DevDate Invitation Test Project",
      description: "Testing developer discovery, invitations, and status lifecycle transitions.",
      owner: leadUser._id,
      members: [leadUser._id],
      interests: ["Testing", "Collaboration"],
      requiredRoles: ["Frontend Developer", "Backend Developer"],
      category: "Web Development",
      duration: "4 weeks",
      teamSize: { min: 2, max: 4 },
      status: "OPEN",
    });

    console.log("--- 1️⃣ DISCOVERY MODULE TESTS ---");

    // 1.1 List developers
    const listDevsRes = await fetch(`${baseUrl}/discovery/developers`);
    const listDevsData = await listDevsRes.json();
    assert(
      listDevsRes.status === 200 &&
        listDevsData.success === true &&
        Array.isArray(listDevsData.data) &&
        listDevsData.data.length >= 2,
      "GET /discovery/developers returns list of developers with 200 OK",
      listDevsData
    );

    // 1.2 Search developers by name
    const searchNameRes = await fetch(`${baseUrl}/discovery/developers?search=Sarah`);
    const searchNameData = await searchNameRes.json();
    assert(
      searchNameRes.status === 200 &&
        searchNameData.data.some((d) => d.name.includes("Sarah")),
      "GET /discovery/developers?search=Sarah filters developers by name",
      searchNameData
    );

    // 1.3 Search / Filter by skill
    const searchSkillRes = await fetch(`${baseUrl}/discovery/developers?skills=React`);
    const searchSkillData = await searchSkillRes.json();
    assert(
      searchSkillRes.status === 200 &&
        searchSkillData.data.every((d) => d.skills.some((s) => s.toLowerCase() === "react")),
      "GET /discovery/developers?skills=React filters developers by skill",
      searchSkillData
    );

    // 1.4 Filter by Role and Availability
    const filterRoleRes = await fetch(
      `${baseUrl}/discovery/developers?role=Frontend%20Developer&availability=Immediate`
    );
    const filterRoleData = await filterRoleRes.json();
    assert(
      filterRoleRes.status === 200 &&
        filterRoleData.data.length > 0 &&
        filterRoleData.data[0].name === "Sarah DevOne",
      "GET /discovery/developers with role & availability filters correctly",
      filterRoleData
    );

    // 1.5 Get Developer details
    const devDetailRes = await fetch(`${baseUrl}/discovery/developers/${dev1User._id}`);
    const devDetailData = await devDetailRes.json();
    assert(
      devDetailRes.status === 200 &&
        devDetailData.success === true &&
        devDetailData.data._id === dev1User._id.toString() &&
        devDetailData.data.experience === "3 years in React",
      "GET /discovery/developers/:id returns full developer profile details",
      devDetailData
    );

    // 1.6 Developer details not found
    const fakeDevId = new mongoose.Types.ObjectId();
    const fakeDevRes = await fetch(`${baseUrl}/discovery/developers/${fakeDevId}`);
    assert(fakeDevRes.status === 404, "GET /discovery/developers/:id returns 404 for non-existent developer");

    console.log("\n--- 2️⃣ INVITATION CREATION & VALIDATION TESTS ---");

    // 2.1 Send valid invitation from Lead to Dev1
    const sendInvite1Res = await fetch(`${baseUrl}/invitations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${leadToken}`,
      },
      body: JSON.stringify({
        projectId: testProject._id.toString(),
        developerId: dev1User._id.toString(),
        message: "Hi Sarah! We would love your React expertise on our project.",
      }),
    });

    const sendInvite1Data = await sendInvite1Res.json();
    assert(
      sendInvite1Res.status === 201 &&
        sendInvite1Data.success === true &&
        sendInvite1Data.data.status === "Pending" &&
        sendInvite1Data.data.projectId._id === testProject._id.toString() &&
        sendInvite1Data.data.developerId._id === dev1User._id.toString(),
      "POST /invitations creates invitation with status 'Pending' and returns 201",
      sendInvite1Data
    );

    createdInvitation1Id = sendInvite1Data.data._id;

    // 2.2 Verify Developer received in-app notification
    const dev1NotifsRes = await fetch(`${baseUrl}/notifications`, {
      headers: { Authorization: `Bearer ${dev1Token}` },
    });
    const dev1NotifsData = await dev1NotifsRes.json();
    assert(
      dev1NotifsRes.status === 200 &&
        dev1NotifsData.data.length === 1 &&
        dev1NotifsData.data[0].type === "INVITATION_RECEIVED" &&
        dev1NotifsData.data[0].message.includes(testProject.title),
      "Developer receives INVITATION_RECEIVED notification upon being invited",
      dev1NotifsData
    );

    // 2.3 Prevent Duplicate Active (Pending) Invitation
    const duplicateInviteRes = await fetch(`${baseUrl}/invitations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${leadToken}`,
      },
      body: JSON.stringify({
        projectId: testProject._id.toString(),
        developerId: dev1User._id.toString(),
        message: "Trying duplicate invite",
      }),
    });
    const duplicateData = await duplicateInviteRes.json();
    assert(
      duplicateInviteRes.status === 409 && duplicateData.success === false,
      "POST /invitations returns 409 Conflict when duplicate pending invitation is attempted",
      duplicateData
    );

    // 2.4 Project Ownership Security - Unauthorized user cannot send invite
    const unauthInviteRes = await fetch(`${baseUrl}/invitations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${unauthorizedToken}`,
      },
      body: JSON.stringify({
        projectId: testProject._id.toString(),
        developerId: dev2User._id.toString(),
      }),
    });
    assert(
      unauthInviteRes.status === 403,
      "POST /invitations returns 403 Forbidden when non-owner tries to send invitation"
    );

    // 2.5 Validation Errors: Missing Fields & Invalid IDs
    const invalidBodyRes = await fetch(`${baseUrl}/invitations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${leadToken}`,
      },
      body: JSON.stringify({ projectId: "invalid-id" }),
    });
    assert(invalidBodyRes.status === 400, "POST /invitations returns 400 for invalid body params");

    console.log("\n--- 3️⃣ DEVELOPER MATCHING & STATUS LIFECYCLE (ACCEPT) ---");

    // 3.1 Developer checks received invitations
    const receivedRes = await fetch(`${baseUrl}/invitations/received`, {
      headers: { Authorization: `Bearer ${dev1Token}` },
    });
    const receivedData = await receivedRes.json();
    assert(
      receivedRes.status === 200 &&
        receivedData.data.length === 1 &&
        receivedData.data[0]._id === createdInvitation1Id &&
        receivedData.data[0].status === "Pending",
      "GET /invitations/received lists pending invitation for developer",
      receivedData
    );

    // 3.2 Developer accepts invitation
    const acceptRes = await fetch(`${baseUrl}/invitations/${createdInvitation1Id}/accept`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${dev1Token}` },
    });
    const acceptData = await acceptRes.json();
    assert(
      acceptRes.status === 200 &&
        acceptData.success === true &&
        acceptData.data.status === "Accepted",
      "PATCH /invitations/:id/accept updates status to 'Accepted'",
      acceptData
    );

    // 3.3 Verify Project membership updated with accepted developer
    const updatedProj = await Project.findById(testProject._id);
    assert(
      updatedProj.members.some((m) => m.toString() === dev1User._id.toString()),
      "Accepted developer is added to Project.members",
      updatedProj.members
    );

    // 3.4 Verify Lead received INVITATION_ACCEPTED notification
    const leadNotifsRes = await fetch(`${baseUrl}/notifications`, {
      headers: { Authorization: `Bearer ${leadToken}` },
    });
    const leadNotifsData = await leadNotifsRes.json();
    assert(
      leadNotifsData.data.some((n) => n.type === "INVITATION_ACCEPTED"),
      "Project Lead receives INVITATION_ACCEPTED notification",
      leadNotifsData
    );

    // 3.5 Prevent Invalid Status Transition: Accepting/Rejecting already accepted invitation
    const reAcceptRes = await fetch(`${baseUrl}/invitations/${createdInvitation1Id}/accept`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${dev1Token}` },
    });
    assert(
      reAcceptRes.status === 400,
      "PATCH /invitations/:id/accept returns 400 when attempting to accept already processed invitation"
    );

    console.log("\n--- 4️⃣ STATUS LIFECYCLE (REJECT) ---");

    // 4.1 Send second invitation to Dev2
    const sendInvite2Res = await fetch(`${baseUrl}/invitations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${leadToken}`,
      },
      body: JSON.stringify({
        projectId: testProject._id.toString(),
        developerId: dev2User._id.toString(),
        message: "Hi Elena, join our backend team!",
      }),
    });
    const sendInvite2Data = await sendInvite2Res.json();
    createdInvitation2Id = sendInvite2Data.data._id;
    assert(sendInvite2Res.status === 201, "Created second invitation for rejection test");

    // 4.2 Dev2 rejects invitation
    const rejectRes = await fetch(`${baseUrl}/invitations/${createdInvitation2Id}/reject`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${dev2Token}` },
    });
    const rejectData = await rejectRes.json();
    assert(
      rejectRes.status === 200 &&
        rejectData.success === true &&
        rejectData.data.status === "Rejected",
      "PATCH /invitations/:id/reject updates status to 'Rejected'",
      rejectData
    );

    // 4.3 Verify Lead received INVITATION_REJECTED notification
    const leadNotifs2Res = await fetch(`${baseUrl}/notifications`, {
      headers: { Authorization: `Bearer ${leadToken}` },
    });
    const leadNotifs2Data = await leadNotifs2Res.json();
    assert(
      leadNotifs2Data.data.some((n) => n.type === "INVITATION_REJECTED"),
      "Project Lead receives INVITATION_REJECTED notification",
      leadNotifs2Data
    );

    console.log("\n--- 5️⃣ STATUS LIFECYCLE (WITHDRAW) ---");

    // 5.1 Create third invitation for Dev2 (allowed since previous was Rejected)
    const sendInvite3Res = await fetch(`${baseUrl}/invitations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${leadToken}`,
      },
      body: JSON.stringify({
        projectId: testProject._id.toString(),
        developerId: dev2User._id.toString(),
        message: "Re-inviting with updated terms.",
      }),
    });
    const sendInvite3Data = await sendInvite3Res.json();
    createdInvitation3Id = sendInvite3Data.data._id;
    assert(sendInvite3Res.status === 201, "Created third invitation for withdrawal test");

    // 5.2 Non-owner cannot withdraw
    const badWithdrawRes = await fetch(`${baseUrl}/invitations/${createdInvitation3Id}/withdraw`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${dev2Token}` },
    });
    assert(
      badWithdrawRes.status === 403,
      "PATCH /invitations/:id/withdraw returns 403 Forbidden when non-owner attempts withdrawal"
    );

    // 5.3 Lead successfully withdraws invitation
    const withdrawRes = await fetch(`${baseUrl}/invitations/${createdInvitation3Id}/withdraw`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${leadToken}` },
    });
    const withdrawData = await withdrawRes.json();
    assert(
      withdrawRes.status === 200 &&
        withdrawData.success === true &&
        withdrawData.data.status === "Withdrawn",
      "PATCH /invitations/:id/withdraw updates status to 'Withdrawn' when called by Lead",
      withdrawData
    );

    // 5.4 Cannot withdraw already withdrawn invitation
    const reWithdrawRes = await fetch(`${baseUrl}/invitations/${createdInvitation3Id}/withdraw`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${leadToken}` },
    });
    assert(
      reWithdrawRes.status === 400,
      "PATCH /invitations/:id/withdraw returns 400 when attempting to withdraw already processed invitation"
    );

    console.log("\n--- 6️⃣ LEAD PROJECT CARD STATS & INVITATIONS LIST ---");

    // 6.1 Get project invitation stats
    const statsRes = await fetch(`${baseUrl}/invitations/project/${testProject._id}/stats`);
    const statsData = await statsRes.json();
    assert(
      statsRes.status === 200 &&
        statsData.success === true &&
        statsData.data.total === 3 &&
        statsData.data.accepted === 1 &&
        statsData.data.rejected === 1 &&
        statsData.data.withdrawn === 1 &&
        statsData.data.pending === 0,
      "GET /invitations/project/:id/stats returns accurate breakdown { total: 3, accepted: 1, rejected: 1, withdrawn: 1, pending: 0 }",
      statsData
    );

    // 6.2 Get project invitations list
    const projInvsRes = await fetch(`${baseUrl}/invitations/project/${testProject._id}`);
    const projInvsData = await projInvsRes.json();
    assert(
      projInvsRes.status === 200 &&
        projInvsData.data.length === 3 &&
        projInvsData.data[0].developerId.name !== undefined,
      "GET /invitations/project/:id returns list with populated developer info",
      projInvsData
    );

    console.log("\n--- 7️⃣ NOTIFICATION MANAGEMENT & READ STATUS ---");

    // 7.1 Unread count
    const unreadCountRes = await fetch(`${baseUrl}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${leadToken}` },
    });
    const unreadCountData = await unreadCountRes.json();
    assert(
      unreadCountRes.status === 200 && unreadCountData.data.unreadCount >= 2,
      "GET /notifications/unread-count returns unread count",
      unreadCountData
    );

    // 7.2 Mark single notification as read
    const notifToRead = leadNotifsData.data[0]._id;
    const markReadRes = await fetch(`${baseUrl}/notifications/${notifToRead}/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${leadToken}` },
    });
    assert(markReadRes.status === 200, "PATCH /notifications/:id/read marks notification as read");

    // 7.3 Mark all notifications as read
    const markAllReadRes = await fetch(`${baseUrl}/notifications/read-all`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${leadToken}` },
    });
    assert(markAllReadRes.status === 200, "PATCH /notifications/read-all marks all notifications as read");

    const finalCountRes = await fetch(`${baseUrl}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${leadToken}` },
    });
    const finalCountData = await finalCountRes.json();
    assert(
      finalCountData.data.unreadCount === 0,
      "Unread count becomes 0 after markAllAsRead",
      finalCountData
    );

    console.log("\n--- 8️⃣ PROFILE INVITATION HISTORY ---");

    // 8.1 Lead sent history across all projects
    const sentHistoryRes = await fetch(`${baseUrl}/invitations/sent`, {
      headers: { Authorization: `Bearer ${leadToken}` },
    });
    const sentHistoryData = await sentHistoryRes.json();
    assert(
      sentHistoryRes.status === 200 &&
        sentHistoryData.data.length === 3 &&
        sentHistoryData.data.some((inv) => inv.status === "Accepted"),
      "GET /invitations/sent returns complete history of invitations sent by lead",
      sentHistoryData
    );

    // 8.2 Developer received history across all projects
    const receivedHistoryRes = await fetch(`${baseUrl}/invitations/received`, {
      headers: { Authorization: `Bearer ${dev2Token}` },
    });
    const receivedHistoryData = await receivedHistoryRes.json();
    assert(
      receivedHistoryRes.status === 200 &&
        receivedHistoryData.data.length === 2,
      "GET /invitations/received returns complete history of invitations received by developer",
      receivedHistoryData
    );

    console.log("\n============================================================");
    console.log(`   TEST SUMMARY: ${passed} PASSED, ${failed} FAILED         `);
    console.log("============================================================\n");
  } catch (err) {
    console.error("Test execution failed with error:", err);
  } finally {
    // Cleanup
    if (leadUser || dev1User || dev2User || unauthorizedUser) {
      await User.deleteMany({
        email: {
          $in: [
            "lead.test@devdate.test",
            "dev1.test@devdate.test",
            "dev2.test@devdate.test",
            "unauthorized.test@devdate.test",
          ],
        },
      });
    }
    if (testProject) {
      await Project.deleteMany({ _id: testProject._id });
    }
    if (createdInvitation1Id || createdInvitation2Id || createdInvitation3Id) {
      await Invitation.deleteMany({
        _id: { $in: [createdInvitation1Id, createdInvitation2Id, createdInvitation3Id] },
      });
    }
    if (server) {
      server.close();
    }
    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
  }
};

runTests();
