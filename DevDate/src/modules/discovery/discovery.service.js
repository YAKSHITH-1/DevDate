import User from "../../models/User.js";
import Invitation from "../../models/Invitation.js";
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
  const query = {};

  // Exclude current lead/user if specified
  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
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

  const [developers, total] = await Promise.all([
    User.find(query)
      .select("name email role preferredRole skills experience availability bio introduction avatar github linkedin portfolio createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(query),
  ]);

  // If a projectId is provided, attach active invitation status for each developer
  let developersWithStatus = developers.map((dev) => dev.toObject());

  if (projectId) {
    const developerIds = developers.map((d) => d._id);
    const invitations = await Invitation.find({
      projectId,
      developerId: { $in: developerIds },
    }).sort({ createdAt: -1 });

    const invitationMap = new Map();
    invitations.forEach((inv) => {
      // Keep the most recent invitation status
      if (!invitationMap.has(inv.developerId.toString())) {
        invitationMap.set(inv.developerId.toString(), {
          invitationId: inv._id,
          status: inv.status,
          createdAt: inv.createdAt,
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
  const developer = await User.findById(developerId).select(
    "name email role preferredRole skills experience availability bio introduction avatar github linkedin portfolio createdAt"
  );

  if (!developer) {
    throw new ApiError(404, "Developer not found");
  }

  const devObj = developer.toObject();

  if (projectId) {
    const latestInvitation = await Invitation.findOne({
      projectId,
      developerId,
    }).sort({ createdAt: -1 });

    devObj.invitationStatus = latestInvitation ? latestInvitation.status : "None";
    devObj.invitationId = latestInvitation ? latestInvitation._id : null;
  }

  return devObj;
};

export default {
  getDevelopers,
  getDeveloperById,
};
