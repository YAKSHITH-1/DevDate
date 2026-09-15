import Match from "../../models/Match.js";
import Project from "../../models/Project.js";
import ApiError from "../../utils/ApiError.js";

const POPULATE_PROJECT = {
  path: "project",
  select: "title description category duration teamSize image status members",
};

const POPULATE_OWNER = {
  path: "owner",
  select: "name email avatar role bio",
};

const POPULATE_USER = {
  path: "user",
  select: "name email avatar role skills experience",
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
    .sort({ createdAt: -1 });

  return matches.map((match) => {
    const matchObj = match.toObject ? match.toObject() : match;
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

  // Update status to ACCEPTED (unlocks chat)
  match.status = "ACCEPTED";
  await match.save();

  // Add developer to project members if not already joined
  if (match.project) {
    const project = await Project.findById(match.project);
    if (project) {
      const isMember = project.members && project.members.some((m) => m.toString() === developerId.toString());
      if (!isMember) {
        project.members.push(developerId);
        project.lastActivityAt = new Date();
        await project.save();
      }
    }
  }

  const populatedMatch = await Match.findById(match._id)
    .populate(POPULATE_PROJECT)
    .populate(POPULATE_OWNER)
    .populate(POPULATE_USER);

  const matchObj = populatedMatch.toObject ? populatedMatch.toObject() : populatedMatch;

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

  const populatedMatch = await Match.findById(match._id)
    .populate(POPULATE_PROJECT)
    .populate(POPULATE_OWNER)
    .populate(POPULATE_USER);

  const matchObj = populatedMatch.toObject ? populatedMatch.toObject() : populatedMatch;

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
