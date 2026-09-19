import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import discoveryService from "./discovery.service.js";

const getUserId = (req) => {
  if (req.user && req.user._id) return req.user._id.toString();
  if (req.headers["x-user-id"]) return req.headers["x-user-id"].toString();
  if (req.query.userId) return req.query.userId.toString();
  return null;
};

export const getDevelopers = asyncHandler(async (req, res) => {
  const { search, skills, role, availability, projectId, limit, page } = req.query;
  const excludeUserId = getUserId(req);

  const result = await discoveryService.getDevelopers({
    search,
    skills,
    role,
    availability,
    projectId,
    excludeUserId,
    limit,
    page,
  });

  return res.status(200).json({
    success: true,
    data: result.developers,
    pagination: result.pagination,
  });
});

export const getDeveloperById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { projectId } = req.query;

  const developer = await discoveryService.getDeveloperById(id, projectId);

  return res.status(200).json({
    success: true,
    data: developer,
  });
});

export const recordSwipe = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    throw new ApiError(401, "Authentication required to record swipe");
  }

  const { projectId, developerId, action } = req.body;

  const swipe = await discoveryService.recordSwipe({
    userId,
    projectId,
    developerId,
    action,
  });

  return res.status(200).json({
    success: true,
    message: "Swipe recorded successfully",
    data: swipe,
  });
});

export default {
  getDevelopers,
  getDeveloperById,
  recordSwipe,
};
