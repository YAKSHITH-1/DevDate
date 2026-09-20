import Match from "../../models/Match.js";
import Project from "../../models/Project.js";
import ApiError from "../../utils/ApiError.js";

const POPULATE_PROJECT = {
  path: "project",
  select: "title description status",
};

const POPULATE_OWNER = {
  path: "owner",
  select: "name avatar role preferredRole",
};

const POPULATE_USER = {
  path: "user",
  select: "name avatar role preferredRole",
};

/**
 * 1. Fetch pending invitations for the authenticated developer
 * Returns formatted invitation card data including project name, project description, lead details, and invitation date.
 */
export const getPendingInvitations = async (developerId) => {
  const matches = await Match.find({
    user: developerId,
    status: "PENDING",
  })
    .populate(POPULATE_PROJECT)
    .populate(POPULATE_OWNER)
    .sort({ createdAt: -1 })
    .lean();

  return matches.map((matchObj) => {
    return {
      _id: matchObj._id,
      matchId: matchObj._id,
      status: matchObj.status,
      project: matchObj.project,
      projectName: matchObj.project?.title || "",
      projectDescription: matchObj.project?.description || "",
      lead: matchObj.owner,
      owner: matchObj.owner,
      user: matchObj.user,
      invitationDate: matchObj.createdAt,
      createdAt: matchObj.createdAt,
      updatedAt: matchObj.updatedAt,
      chatUnlocked: matchObj.status === "ACCEPTED",
    };
  });
};

/**
 * 2. Approve an invitation (developer action)
 * Updates status to ACCEPTED and unlocks chat between lead and developer.
 */
export const approveInvitation = async (matchId, developerId) => {
  const match = await Match.findById(matchId);

  if (!match) {
    throw new ApiError(404, "Match/Invitation not found");
  }

  // Only the invited developer can approve their invitation
  if (match.user.toString() !== developerId.toString()) {
    throw new ApiError(403, "Forbidden: Only the invited developer can approve this invitation");
  }

  // Only pending invitations can be processed
  if (match.status !== "PENDING") {
    throw new ApiError(400, `Cannot approve invitation with status "${match.status}". Only pending invitations can be processed.`);
  }

  let project = null;
  if (match.project) {
    project = await Project.findById(match.project);
    if (!project) {
      throw new ApiError(404, "Associated project not found");
    }
    if (project.status === "CLOSED" || project.status !== "OPEN") {
      throw new ApiError(400, "Project is closed and is not accepting new members");
    }
    const currentMembers = project.members ? project.members.length : 0;
    const maxCapacity = project.teamSize?.max ?? Infinity;
    if (currentMembers >= maxCapacity) {
      throw new ApiError(400, "Project has reached its maximum team size");
    }
  }

  // Update status to ACCEPTED (unlocks chat)
  match.status = "ACCEPTED";
  await match.save();

  // Add developer to project members if not already joined
  if (project) {
    const isMember = project.members && project.members.some((m) => m.toString() === developerId.toString());
    if (!isMember) {
      project.members.push(developerId);
      project.lastActivityAt = new Date();
      await project.save();
    }
  }

  const matchObj = await Match.findById(match._id)
    .populate(POPULATE_PROJECT)
    .populate(POPULATE_OWNER)
    .populate(POPULATE_USER)
    .lean();

  return {
    ...matchObj,
    projectName: matchObj.project?.title || "",
    projectDescription: matchObj.project?.description || "",
    lead: matchObj.owner,
    invitationDate: matchObj.createdAt,
    chatUnlocked: true,
  };
};

/**
 * 3. Reject an invitation (developer action)
 * Updates status to REJECTED. Does nothing else.
 */
export const rejectInvitation = async (matchId, developerId) => {
  const match = await Match.findById(matchId);

  if (!match) {
    throw new ApiError(404, "Match/Invitation not found");
  }

  // Only the invited developer can reject their invitation
  if (match.user.toString() !== developerId.toString()) {
    throw new ApiError(403, "Forbidden: Only the invited developer can reject this invitation");
  }

  // Only pending invitations can be processed
  if (match.status !== "PENDING") {
    throw new ApiError(400, `Cannot reject invitation with status "${match.status}". Only pending invitations can be processed.`);
  }

  // Update status to REJECTED
  match.status = "REJECTED";
  await match.save();

  const matchObj = await Match.findById(match._id)
    .populate(POPULATE_PROJECT)
    .populate(POPULATE_OWNER)
    .populate(POPULATE_USER)
    .lean();

  return {
    ...matchObj,
    projectName: matchObj.project?.title || "",
    projectDescription: matchObj.project?.description || "",
    lead: matchObj.owner,
    invitationDate: matchObj.createdAt,
    chatUnlocked: false,
  };
};

export default {
  getPendingInvitations,
  approveInvitation,
  rejectInvitation,
};
