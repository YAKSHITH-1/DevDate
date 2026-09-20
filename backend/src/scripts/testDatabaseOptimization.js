import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import User from "../models/User.js";
import Project from "../models/Project.js";
import Match from "../models/Match.js";
import Message from "../models/Message.js";
import Invitation from "../models/Invitation.js";
import Notification from "../models/Notification.js";
import Skill from "../models/Skill.js";

import discoveryService from "../modules/discovery/discovery.service.js";
import projectService from "../modules/projects/project.service.js";
import chatService from "../modules/chat/chat.service.js";
import matchingService from "../modules/matching/matching.service.js";
import invitationService from "../modules/invitations/invitation.service.js";
import notificationService from "../modules/notifications/notification.service.js";
import authService from "../modules/auth/auth.service.js";
import { MONGO_URI } from "../config/env.js";

async function runTests() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("Connected successfully!");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Audit Indexes & Ensure Synced to Atlas
    console.log("\n--- 1. Testing Database Indexes ---");
    await Promise.all([
      User.syncIndexes(),
      Project.syncIndexes(),
      Match.syncIndexes(),
      Message.syncIndexes(),
    ]);

    const userIndexes = await User.collection.getIndexes();
    assert(userIndexes.createdAt_1 || userIndexes["createdAt_-1"], "User collection has index on createdAt");

    const projectIndexes = await Project.collection.getIndexes();
    assert(projectIndexes["owner_1_createdAt_-1"], "Project collection has compound index on { owner: 1, createdAt: -1 }");

    const matchIndexes = await Match.collection.getIndexes();
    assert(matchIndexes["user_1_status_1_updatedAt_-1"], "Match collection has compound index on { user: 1, status: 1, updatedAt: -1 }");
    assert(matchIndexes["owner_1_status_1_updatedAt_-1"], "Match collection has compound index on { owner: 1, status: 1, updatedAt: -1 }");

    const messageIndexes = await Message.collection.getIndexes();
    assert(messageIndexes["match_1_createdAt_-1"], "Message collection has compound index on { match: 1, createdAt: -1 }");

    // 2. Audit Discovery Service
    console.log("\n--- 2. Testing Discovery Developer Optimization ---");
    const testUser = await User.findOne({ isVerified: true }).lean();
    if (testUser) {
      const devResult = await discoveryService.getDevelopers({ excludeUserId: testUser._id, limit: 5 });
      assert(Array.isArray(devResult.developers), "Discovery returns developers array");
      assert(typeof devResult.pagination?.total === "number", "Discovery returns pagination total count");
      assert(devResult.pagination?.page === 1, "Discovery defaults to page 1");

      if (devResult.developers.length > 0) {
        const sampleDev = devResult.developers[0];
        assert(sampleDev._id !== undefined, "Developer has _id");
        assert(sampleDev.name !== undefined, "Developer has name");
        assert(sampleDev.passwordHash === undefined, "Discovery excludes passwordHash");
        assert(sampleDev.email === undefined, "Discovery excludes email (data minimization)");
        assert(sampleDev.github === undefined, "Discovery excludes private/unused github link");
        assert(sampleDev.linkedin === undefined, "Discovery excludes private/unused linkedin link");
      }
    } else {
      console.log("  [SKIP] No verified user found for discovery test");
    }

    // 3. Audit Projects Service
    console.log("\n--- 3. Testing Project List Optimization ---");
    if (testUser) {
      const myProjects = await projectService.getMyProjects(testUser._id);
      assert(Array.isArray(myProjects), "getMyProjects returns array");
      if (myProjects.length > 0) {
        const sampleProj = myProjects[0];
        assert(sampleProj.title !== undefined, "Project has title");
        assert(sampleProj.category !== undefined, "Project has category");
        if (sampleProj.members && sampleProj.members.length > 0) {
          const sampleMember = sampleProj.members[0];
          assert(sampleMember.email === undefined, "Project member excludes email");
          assert(sampleMember.passwordHash === undefined, "Project member excludes passwordHash");
        }
        if (sampleProj.requiredSkills && sampleProj.requiredSkills.length > 0) {
          const sampleSkill = sampleProj.requiredSkills[0];
          assert(sampleSkill.categories === undefined, "Project skill populates only name");
        }
      } else {
        console.log("  [INFO] User has no projects yet; testing Project.find with projection");
        const anyProject = await Project.findOne().populate("owner", "name avatar role").lean();
        if (anyProject) {
          assert(anyProject.title !== undefined, "Project has title");
          if (anyProject.owner) {
            assert(anyProject.owner.email === undefined, "Project owner excludes email");
            assert(anyProject.owner.passwordHash === undefined, "Project owner excludes passwordHash");
          }
        }
      }
    }

    // 4. Audit Matching & Invitations Services
    console.log("\n--- 4. Testing Matching & Invitations Optimization ---");
    if (testUser) {
      const pendingMatches = await matchingService.getPendingInvitations(testUser._id);
      assert(Array.isArray(pendingMatches), "getPendingInvitations returns array");
      if (pendingMatches.length > 0) {
        const sampleMatch = pendingMatches[0];
        if (sampleMatch.lead) {
          assert(sampleMatch.lead.email === undefined, "Match lead excludes email");
          assert(sampleMatch.lead.passwordHash === undefined, "Match lead excludes passwordHash");
        }
      }

      const receivedInvs = await invitationService.getReceivedInvitations(testUser._id);
      assert(Array.isArray(receivedInvs), "getReceivedInvitations returns array");
      if (receivedInvs.length > 0) {
        const sampleInv = receivedInvs[0];
        if (sampleInv.projectId) {
          assert(sampleInv.projectId.category === undefined, "Invitation project excludes category");
          assert(sampleInv.projectId.members === undefined, "Invitation project excludes members array");
        }
        if (sampleInv.developerId) {
          assert(sampleInv.developerId.email === undefined, "Invitation developer excludes email");
        }
      }
    }

    // 5. Audit Chat Service
    console.log("\n--- 5. Testing Chat Conversations & Messages Optimization ---");
    if (testUser) {
      const convs = await chatService.getUserConversations(testUser._id);
      assert(Array.isArray(convs), "getUserConversations returns array");
      if (convs.length > 0) {
        const sampleConv = convs[0];
        assert(sampleConv.otherParticipant !== undefined, "Conversation has otherParticipant");
        if (sampleConv.otherParticipant) {
          assert(sampleConv.otherParticipant.email === undefined, "Conversation otherParticipant excludes email");
        }
        if (sampleConv.lastMessage && sampleConv.lastMessage.sender) {
          assert(sampleConv.lastMessage.sender.email === undefined, "Last message sender excludes email");
        }
      }

      // Check messages query with limit
      const sampleMatch = await Match.findOne({ status: "ACCEPTED" }).lean();
      if (sampleMatch) {
        try {
          const msgsResult = await chatService.getConversationMessages(sampleMatch._id, sampleMatch.user, { limit: 10 });
          assert(Array.isArray(msgsResult.messages), "getConversationMessages returns messages array");
          if (msgsResult.messages.length > 0) {
            const sampleMsg = msgsResult.messages[0];
            assert(sampleMsg.message !== undefined, "Message has text content");
            if (sampleMsg.sender) {
              assert(sampleMsg.sender.email === undefined, "Message sender excludes email");
            }
          }
        } catch (err) {
          console.log(`  [INFO] Conversation access test: ${err.message}`);
        }
      }
    }

    // 6. Audit Notifications Service
    console.log("\n--- 6. Testing Notifications Service ---");
    if (testUser) {
      const notifs = await notificationService.getUserNotifications(testUser._id, { limit: 5 });
      assert(Array.isArray(notifs), "getUserNotifications returns array");
      if (notifs.length > 0) {
        const sampleNotif = notifs[0];
        assert(sampleNotif.type !== undefined, "Notification has type");
        if (sampleNotif.actor) {
          assert(sampleNotif.actor.email === undefined, "Notification actor excludes email");
        }
      }

      const unread = await notificationService.getUnreadCount(testUser._id);
      assert(typeof unread.unreadCount === "number", "getUnreadCount returns unreadCount number");
    }

    // 7. Audit Auth getMe
    console.log("\n--- 7. Testing Profile getMe Optimization ---");
    if (testUser) {
      const me = await authService.getMe(testUser._id);
      assert(me._id !== undefined, "getMe returns user id");
      assert(me.name !== undefined, "getMe returns user name");
      assert(me.email !== undefined, "getMe returns user email");
      assert(me.passwordHash === undefined, "getMe strictly excludes passwordHash");
    }

    console.log(`\n========================================`);
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

  } catch (error) {
    console.error("Test execution error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

runTests();
