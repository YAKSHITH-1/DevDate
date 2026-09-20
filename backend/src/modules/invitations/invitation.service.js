import mongoose from "mongoose";
import Invitation from "../../models/Invitation.js";
import Project from "../../models/Project.js";
import User from "../../models/User.js";
import Match from "../../models/Match.js";
import ApiError from "../../utils/ApiError.js";
import { createNotification } from "../notifications/notification.service.js";

const POPULATE_CONFIG = [
  {
    path: "projectId",
    select: "title description status",
  },
  {
    path: "developerId",
    select: "name role preferredRole avatar",
  },
  {
    path: "senderId",
    select: "name avatar",
  },
];

const populateInvitation = (query) => {
  return query
    .populate(POPULATE_CONFIG[0])
    .populate(POPULATE_CONFIG[1])
    .populate(POPULATE_CONFIG[2])
    .lean();
};

/**
 * 1. Create and send an invitation
 */
export const createInvitation = async (senderId, { projectId, developerId, message = "" }) => {
  // 1. Verify Project exists
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // 2. Verify Sender is the Project Owner
  if (project.owner.toString() !== senderId.toString()) {
    throw new ApiError(403, "Forbidden: You are not authorized to send invitations for this project");
  }

  // 3. Verify Project is OPEN
  if (project.status === "CLOSED" || project.status !== "OPEN") {
    throw new ApiError(400, "Project is closed and is not accepting new members");
  }

  // 4. Verify Project has available capacity
  const currentMembers = project.members ? project.members.length : 0;
  const maxCapacity = project.teamSize?.max ?? Infinity;
  if (currentMembers >= maxCapacity) {
    throw new ApiError(400, "Project has reached its maximum team size");
  }

  // 5. Verify Developer exists
  const developer = await User.findById(developerId);
  if (!developer) {
    throw new ApiError(404, "Developer not found");
  }

  // 6. Verify Sender is not inviting themselves or the project owner
  if (
    developerId.toString() === senderId.toString() ||
    (project.owner && developerId.toString() === project.owner.toString())
  ) {
    throw new ApiError(400, "You cannot send an invitation to yourself or the project owner");
  }

  // 7. Verify Developer is not already a member
  if (project.members && project.members.some((m) => m.toString() === developerId.toString())) {
    throw new ApiError(400, "Developer is already a member of this project");
  }

  // 8. Check for duplicate ACTIVE (Pending) invitation
  const existingActiveInvitation = await Invitation.findOne({
    projectId,
    developerId,
    status: "Pending",
  });

  if (existingActiveInvitation) {
    throw new ApiError(409, "An invitation is already pending for this developer");
  }

  // 9. Check if already accepted or matched
  const existingAcceptedInvitation = await Invitation.findOne({
    projectId,
    developerId,
    status: "Accepted",
  });

  if (existingAcceptedInvitation) {
    throw new ApiError(400, "Developer is already matched with this project");
  }

  const existingMatch = await Match.findOne({
    project: projectId,
    user: developerId,
    status: "ACCEPTED",
  });

  if (existingMatch) {
    throw new ApiError(400, "Developer is already matched with this project");
  }

  // 10. Create Invitation
  const invitation = await Invitation.create({
    projectId,
    developerId,
    senderId,
    message: message?.trim() || "",
    status: "Pending",
  });

  // 11. Fetch Sender details for notification
  const sender = await User.findById(senderId).select("name email role");

  // 12. Create Notification for Developer
  await createNotification({
    recipient: developerId,
    actor: senderId,
    type: "INVITATION_RECEIVED",
    project: projectId,
    invitation: invitation._id,
    message: `${sender?.name || "A project lead"} invited you to join "${project.title}"`,
  });

  return await populateInvitation(Invitation.findById(invitation._id));
};

/**
 * 2. Accept an invitation (by Developer)
 */
export const acceptInvitation = async (invitationId, developerId) => {
  const invitation = await Invitation.findById(invitationId).populate("projectId").populate("developerId");

  if (!invitation) {
    throw new ApiError(404, "Invitation not found");
  }

  // 1. Verify recipient
  if (invitation.developerId._id.toString() !== developerId.toString()) {
    throw new ApiError(403, "Forbidden: You are not authorized to accept this invitation");
  }

  // 2. Check valid transition from Pending
  if (invitation.status !== "Pending") {
    throw new ApiError(400, `Cannot accept invitation with status "${invitation.status}"`);
  }

  // 3. Project exists
  const project = await Project.findById(invitation.projectId._id);
  if (!project) {
    throw new ApiError(404, "Associated project not found");
  }

  // 4. Project is still OPEN
  if (project.status === "CLOSED" || project.status !== "OPEN") {
    throw new ApiError(400, "Project is closed and is not accepting new members");
  }

  // 5. Project still has available capacity
  const currentMembers = project.members ? project.members.length : 0;
  const maxCapacity = project.teamSize?.max ?? Infinity;
  if (currentMembers >= maxCapacity) {
    throw new ApiError(400, "Project has reached its maximum team size");
  }

  // 6. Developer is not already a member
  const isMember = project.members && project.members.some((m) => m.toString() === developerId.toString());
  if (isMember) {
    throw new ApiError(400, "Developer is already a member of this project");
  }

  // Update invitation status
  invitation.status = "Accepted";
  await invitation.save();

  // Add developer to project members
  project.members.push(developerId);
  project.lastActivityAt = new Date();
  await project.save();

  // Find or create Match document (Prevent duplicate creation)
  const ownerId = invitation.senderId?._id || invitation.senderId || project.owner;

  let match = await Match.findOne({
    project: project._id,
    user: developerId,
  });

  if (!match) {
    match = await Match.create({
      project: project._id,
      user: developerId,
      owner: ownerId,
      status: "ACCEPTED",
    });
  } else if (match.status !== "ACCEPTED") {
    match.status = "ACCEPTED";
    await match.save();
  }

  // Notify the project owner (Lead)
  await createNotification({
    recipient: invitation.senderId,
    actor: developerId,
    type: "INVITATION_ACCEPTED",
    project: project._id,
    invitation: invitation._id,
    match: match?._id,
    message: `${invitation.developerId.name || "A developer"} accepted your invitation to join "${project.title}"`,
  });

  return await populateInvitation(Invitation.findById(invitation._id));
};

/**
 * 3. Reject an invitation (by Developer)
 */
export const rejectInvitation = async (invitationId, developerId) => {
  const invitation = await Invitation.findById(invitationId).populate("projectId").populate("developerId");

  if (!invitation) {
    throw new ApiError(404, "Invitation not found");
  }

  // Verify recipient
  if (invitation.developerId._id.toString() !== developerId.toString()) {
    throw new ApiError(403, "Forbidden: You are not authorized to reject this invitation");
  }

  // Check valid transition from Pending
  if (invitation.status !== "Pending") {
    throw new ApiError(400, `Cannot reject invitation with status "${invitation.status}"`);
  }

  invitation.status = "Rejected";
  await invitation.save();

  // Notify the project owner (Lead)
  await createNotification({
    recipient: invitation.senderId,
    actor: developerId,
    type: "INVITATION_REJECTED",
    project: invitation.projectId._id,
    invitation: invitation._id,
    message: `${invitation.developerId.name || "A developer"} declined your invitation to join "${invitation.projectId.title}"`,
  });

  return await populateInvitation(Invitation.findById(invitation._id));
};

/**
 * 4. Withdraw an invitation (by Lead / Owner)
 */
export const withdrawInvitation = async (invitationId, senderId) => {
  const invitation = await Invitation.findById(invitationId).populate("projectId");

  if (!invitation) {
    throw new ApiError(404, "Invitation not found");
  }

  // Verify sender / owner
  if (invitation.senderId.toString() !== senderId.toString()) {
    throw new ApiError(403, "Forbidden: You are not authorized to withdraw this invitation");
  }

  // Check valid transition from Pending
  if (invitation.status !== "Pending") {
    throw new ApiError(400, `Cannot withdraw invitation with status "${invitation.status}"`);
  }

  invitation.status = "Withdrawn";
  await invitation.save();

  // Notify developer about withdrawal
  await createNotification({
    recipient: invitation.developerId,
    actor: senderId,
    type: "INVITATION_WITHDRAWN",
    project: invitation.projectId._id,
    invitation: invitation._id,
    message: `The invitation to join "${invitation.projectId.title}" was withdrawn`,
  });

  return await populateInvitation(Invitation.findById(invitation._id));
};

/**
 * 5. Get aggregated invitation stats for a specific project
 */
export const getProjectInvitationStats = async (projectId) => {
  const objectId = new mongoose.Types.ObjectId(projectId);

  const stats = await Invitation.aggregate([
    { $match: { projectId: objectId } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const result = {
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    withdrawn: 0,
  };

  stats.forEach((item) => {
    const key = item._id.toLowerCase();
    if (result[key] !== undefined) {
      result[key] = item.count;
    }
    result.total += item.count;
  });

  return result;
};

/**
 * 6. Get all invitations for a specific project (Lead view)
 */
export const getProjectInvitations = async (projectId) => {
  const invitations = await populateInvitation(
    Invitation.find({ projectId }).sort({ createdAt: -1 })
  );

  return invitations;
};

/**
 * 7. Get received invitations for a developer (Developer Matching portal)
 */
export const getReceivedInvitations = async (developerId, status = null) => {
  const query = { developerId };
  if (status) {
    query.status = status;
  }

  const invitations = await populateInvitation(
    Invitation.find(query).sort({ createdAt: -1 })
  );

  return invitations;
};

/**
 * 8. Get sent invitations across all projects for a lead (Profile history)
 */
export const getSentInvitations = async (senderId, status = null) => {
  const query = { senderId };
  if (status) {
    query.status = status;
  }

  const invitations = await populateInvitation(
    Invitation.find(query).sort({ createdAt: -1 })
  );

  return invitations;
};

/**
 * 9. Get single invitation by ID
 */
export const getInvitationById = async (invitationId) => {
  const invitation = await populateInvitation(Invitation.findById(invitationId));

  if (!invitation) {
    throw new ApiError(404, "Invitation not found");
  }

  return invitation;
};

export default {
  createInvitation,
  acceptInvitation,
  rejectInvitation,
  withdrawInvitation,
  getProjectInvitationStats,
  getProjectInvitations,
  getReceivedInvitations,
  getSentInvitations,
  getInvitationById,
};
