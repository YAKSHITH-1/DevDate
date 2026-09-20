import mongoose from "mongoose";
import User from "../../models/User.js";
import Invitation from "../../models/Invitation.js";
import Project from "../../models/Project.js";
import Match from "../../models/Match.js";
import Swipe from "../../models/Swipe.js";
import ApiError from "../../utils/ApiError.js";

/**
 * List and filter developers
 */
export const getDevelopers = async ({
  search = "",
  skills = "",
  role = "",
  availability = "",
  projectId = null,
  excludeUserId = null,
  limit = 50,
  page = 1,
} = {}) => {
  const excludedUserIds = new Set();
  if (excludeUserId) {
    excludedUserIds.add(excludeUserId.toString());
  }

  // If projectId is provided, verify project existence, OPEN status, and capacity
  if (projectId) {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new ApiError(400, "Invalid Project ID format");
    }
    const project = await Project.findById(projectId)
      .select("status members teamSize owner")
      .lean();
    if (!project) {
      throw new ApiError(404, "Project not found");
    }
    if (project.status === "CLOSED" || project.status !== "OPEN") {
      throw new ApiError(400, "Project is closed and is not accepting new members");
    }
    const currentMembers = project.members ? project.members.length : 0;
    const maxCapacity = project.teamSize?.max ?? Infinity;
    if (currentMembers >= maxCapacity) {
      throw new ApiError(400, "Project has reached its maximum team size");
    }

    // 1. Exclude project owner
    if (project.owner) {
      excludedUserIds.add(project.owner.toString());
    }

    // 2. Exclude existing project members
    if (Array.isArray(project.members)) {
      project.members.forEach((m) => {
        if (m) excludedUserIds.add(m.toString());
      });
    }

    // 3. Exclude developers with Pending invitation for this project
    const pendingInvs = await Invitation.find({
      projectId,
      status: "Pending",
    })
      .select("developerId")
      .lean();
    pendingInvs.forEach((inv) => {
      if (inv.developerId) excludedUserIds.add(inv.developerId.toString());
    });

    // 4. Exclude developers with an existing accepted Match for this project
    const acceptedMatches = await Match.find({
      project: projectId,
      status: "ACCEPTED",
    })
      .select("user")
      .lean();
    acceptedMatches.forEach((m) => {
      if (m.user) excludedUserIds.add(m.user.toString());
    });

    // 5. Exclude developers with PASS swipe for this project
    const passedSwipes = await Swipe.find({
      project: projectId,
      action: "PASS",
    })
      .select("developer")
      .lean();
    passedSwipes.forEach((s) => {
      if (s.developer) excludedUserIds.add(s.developer.toString());
    });
  }

  const query = {};

  // Exclude collected user IDs if any
  if (excludedUserIds.size > 0) {
    query._id = {
      $nin: Array.from(excludedUserIds)
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id)),
    };
  }

  // Text search on name, bio, introduction, or skills
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), "i");
    query.$or = [
      { name: searchRegex },
      { skills: { $in: [searchRegex] } },
      { role: searchRegex },
      { preferredRole: searchRegex },
      { bio: searchRegex },
      { introduction: searchRegex },
    ];
  }

  // Filter by Skill(s)
  if (skills && skills.trim()) {
    const skillList = skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (skillList.length > 0) {
      // Case-insensitive regex match for each skill
      const skillRegexes = skillList.map((s) => new RegExp(`^${s}$`, "i"));
      query.skills = { $in: skillRegexes };
    }
  }

  // Filter by Role
  if (role && role.trim() && role.toLowerCase() !== "all") {
    const roleRegex = new RegExp(role.trim(), "i");
    query.$or = query.$or || [];
    query.$and = query.$and || [];
    query.$and.push({
      $or: [{ role: roleRegex }, { preferredRole: roleRegex }],
    });
  }

  // Filter by Availability
  if (availability && availability.trim() && availability.toLowerCase() !== "all") {
    const availRegex = new RegExp(availability.trim(), "i");
    query.availability = availRegex;
  }

  const skip = (Number(page) - 1) * Number(limit);

  // Return only fields consumed by Discovery Card UI with .lean()
  const [developers, total] = await Promise.all([
    User.find(query)
      .select("name avatar role preferredRole skills experience availability bio introduction location")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    User.countDocuments(query),
  ]);

  // If a projectId is provided, attach active invitation status for each developer
  let developersWithStatus = developers;

  if (projectId && developers.length > 0) {
    const developerIds = developers.map((d) => d._id);
    const invitations = await Invitation.find({
      projectId,
      developerId: { $in: developerIds },
    })
      .select("developerId status")
      .sort({ createdAt: -1 })
      .lean();

    const invitationMap = new Map();
    invitations.forEach((inv) => {
      // Keep the most recent invitation status
      if (!invitationMap.has(inv.developerId.toString())) {
        invitationMap.set(inv.developerId.toString(), {
          invitationId: inv._id,
          status: inv.status,
        });
      }
    });

    developersWithStatus = developersWithStatus.map((dev) => {
      const invInfo = invitationMap.get(dev._id.toString());
      return {
        ...dev,
        invitationStatus: invInfo ? invInfo.status : "None",
        invitationId: invInfo ? invInfo.invitationId : null,
      };
    });
  }

  return {
    developers: developersWithStatus,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)) || 1,
    },
  };
};

/**
 * Get developer full profile details
 */
export const getDeveloperById = async (developerId, projectId = null) => {
  const developer = await User.findById(developerId)
    .select(
      "name email role preferredRole skills experience availability bio introduction avatar github linkedin portfolio location createdAt"
    )
    .lean();

  if (!developer) {
    throw new ApiError(404, "Developer not found");
  }

  const devObj = { ...developer };

  if (projectId) {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new ApiError(400, "Invalid Project ID format");
    }
    const project = await Project.findById(projectId)
      .select("status members teamSize")
      .lean();
    if (!project) {
      throw new ApiError(404, "Project not found");
    }
    if (project.status === "CLOSED" || project.status !== "OPEN") {
      throw new ApiError(400, "Project is closed and is not accepting new members");
    }
    const currentMembers = project.members ? project.members.length : 0;
    const maxCapacity = project.teamSize?.max ?? Infinity;
    if (currentMembers >= maxCapacity) {
      throw new ApiError(400, "Project has reached its maximum team size");
    }

    const latestInvitation = await Invitation.findOne({
      projectId,
      developerId,
    })
      .select("status")
      .sort({ createdAt: -1 })
      .lean();

    devObj.invitationStatus = latestInvitation ? latestInvitation.status : "None";
    devObj.invitationId = latestInvitation ? latestInvitation._id : null;
  }

  return devObj;
};

/**
 * Record a swipe action (PASS or INTERESTED)
 */
export const recordSwipe = async ({ userId, projectId, developerId, action }) => {
  // 1. Validate IDs format
  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid Project ID format");
  }
  if (!developerId || !mongoose.Types.ObjectId.isValid(developerId)) {
    throw new ApiError(400, "Invalid Developer ID format");
  }

  // 2. Validate action
  if (!action || !["PASS", "INTERESTED"].includes(action)) {
    throw new ApiError(400, "Action must be PASS or INTERESTED");
  }

  // 3. Verify Project exists with lean projection
  const project = await Project.findById(projectId).select("owner status members teamSize").lean();
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // 4. Verify authenticated user owns the project
  if (project.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "Forbidden: You are not authorized to swipe for this project");
  }

  // 5. Verify project is OPEN
  if (project.status === "CLOSED" || project.status !== "OPEN") {
    throw new ApiError(400, "Project is closed and is not accepting new members");
  }

  // 6. Verify project has capacity
  const currentMembers = project.members ? project.members.length : 0;
  const maxCapacity = project.teamSize?.max ?? Infinity;
  if (currentMembers >= maxCapacity) {
    throw new ApiError(400, "Project has reached its maximum team size");
  }

  // 7. Verify developer exists
  const developer = await User.findById(developerId).select("_id").lean();
  if (!developer) {
    throw new ApiError(404, "Developer not found");
  }

  // 8. Verify owner cannot swipe themselves
  if (developerId.toString() === userId.toString() || developerId.toString() === project.owner.toString()) {
    throw new ApiError(400, "You cannot swipe on yourself");
  }

  // 9. Verify developer is not already a member
  if (project.members && project.members.some((m) => m.toString() === developerId.toString())) {
    throw new ApiError(400, "Developer is already a member of this project");
  }

  // 10. Verify developer does not already have an accepted Match
  const existingMatch = await Match.findOne({
    project: projectId,
    user: developerId,
    status: "ACCEPTED",
  })
    .select("_id")
    .lean();
  if (existingMatch) {
    throw new ApiError(400, "Developer is already matched with this project");
  }

  // 11. Upsert Swipe document (prevents duplicates)
  const swipe = await Swipe.findOneAndUpdate(
    { project: projectId, user: userId, developer: developerId },
    { action },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  ).lean();

  return swipe;
};

export default {
  getDevelopers,
  getDeveloperById,
  recordSwipe,
};
