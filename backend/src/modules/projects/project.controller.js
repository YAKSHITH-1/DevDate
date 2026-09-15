import asyncHandler from "../../utils/asyncHandler.js";
import projectService from "./project.service.js";

export const createProject = asyncHandler(async (req, res) => {
  const project = await projectService.createProject(req.user._id, req.body);
  return res.status(201).json({
    success: true,
    message: "Project created successfully",
    data: project,
  });
});

export const getProjectById = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectById(req.params.id);
  return res.status(200).json({
    success: true,
    data: project,
  });
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await projectService.updateProject(req.params.id, req.user._id, req.body);
  return res.status(200).json({
    success: true,
    message: "Project updated successfully",
    data: project,
  });
});

export const closeProject = asyncHandler(async (req, res) => {
  const project = await projectService.closeProject(req.params.id, req.user._id);
  return res.status(200).json({
    success: true,
    message: "Project closed successfully",
    data: project,
  });
});

export default {
  createProject,
  getProjectById,
  updateProject,
  closeProject,
};
