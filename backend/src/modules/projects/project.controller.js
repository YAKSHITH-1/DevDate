import asyncHandler from "../../utils/asyncHandler.js";
import projectService from "./project.service.js";

export const createProject = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.userId;
  const project = await projectService.createProject(userId, req.body);
  return res.status(201).json({
    success: true,
    message: "Project created successfully",
    data: project,
  });
});

export const getMyProjects = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.userId;
  const projects = await projectService.getMyProjects(userId);
  return res.status(200).json({
    success: true,
    data: projects,
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
  const userId = req.user?._id || req.userId;
  const project = await projectService.updateProject(req.params.id, userId, req.body);
  return res.status(200).json({
    success: true,
    message: "Project updated successfully",
    data: project,
  });
});

export const closeProject = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.userId;
  const project = await projectService.closeProject(req.params.id, userId);
  return res.status(200).json({
    success: true,
    message: "Project closed successfully",
    data: project,
  });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.userId;
  const result = await projectService.deleteProject(req.params.id, userId);
  return res.status(200).json({
    success: true,
    message: "Project deleted successfully",
    data: result,
  });
});

export default {
  createProject,
  getMyProjects,
  getProjectById,
  updateProject,
  closeProject,
  deleteProject,
};
