import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import Project from "../models/Project.js";

export const checkProjectOwnership = asyncHandler(async (req, res, next) => {
  const projectId = req.params.id || req.params.projectId;
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (project.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Forbidden: You do not have permission to modify this project");
  }

  req.project = project;
  next();
});

export default checkProjectOwnership;
