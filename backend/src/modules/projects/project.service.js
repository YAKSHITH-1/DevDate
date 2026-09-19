import Project from "../../models/Project.js";
import ApiError from "../../utils/ApiError.js";
import { normalizeStringArray } from "../../utils/normalize.js";
import { validateSkillIds } from "../skills/skill.service.js";

const POPULATE_CONFIG = [
  {
    path: "owner",
    select: "name email avatar role bio github linkedin portfolio",
  },
  {
    path: "members",
    select: "name email avatar role skills",
  },
  {
    path: "requiredSkills",
    select: "name categories aliases",
  },
];

const populateProject = (query) => {
  return query
    .populate(POPULATE_CONFIG[0])
    .populate(POPULATE_CONFIG[1])
    .populate(POPULATE_CONFIG[2]);
};

export const createProject = async (userId, projectData) => {
  const {
    title,
    description,
    requiredSkills,
    interests,
    requiredRoles,
    category,
    duration,
    teamSize,
    image,
  } = projectData;

  const validatedSkills = await validateSkillIds(requiredSkills);
  const normalizedInterests = normalizeStringArray(interests || []);
  const normalizedRoles = normalizeStringArray(requiredRoles);

  if (normalizedRoles.length === 0) {
    throw new ApiError(400, "At least one valid required role is required");
  }

  const project = await Project.create({
    title: title.trim(),
    description: description.trim(),
    owner: userId,
    members: [userId], // Owner is automatically the first member
    requiredSkills: validatedSkills,
    interests: normalizedInterests,
    requiredRoles: normalizedRoles,
    category: category.trim(),
    duration: duration.trim(),
    teamSize: {
      min: Number(teamSize.min),
      max: Number(teamSize.max),
    },
    image: image?.trim() || null,
    status: "OPEN",
    lastActivityAt: new Date(),
  });

  return await populateProject(Project.findById(project._id));
};

export const getMyProjects = async (userId) => {
  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const projects = await populateProject(
    Project.find({ owner: userId }).sort({ createdAt: -1 })
  );

  return projects;
};

export const getProjectById = async (projectId) => {
  const project = await populateProject(Project.findById(projectId));

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return project;
};

export const updateProject = async (projectId, userId, updateData) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (project.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "Forbidden: You do not have permission to edit this project");
  }

  const allowedUpdates = [
    "title",
    "description",
    "requiredSkills",
    "interests",
    "requiredRoles",
    "category",
    "duration",
    "teamSize",
    "image",
  ];

  for (const field of allowedUpdates) {
    if (updateData[field] !== undefined) {
      if (field === "requiredSkills") {
        const validatedSkills = await validateSkillIds(updateData.requiredSkills);
        project.requiredSkills = validatedSkills;
      } else if (field === "interests") {
        project.interests = normalizeStringArray(updateData.interests);
      } else if (field === "requiredRoles") {
        const normalized = normalizeStringArray(updateData.requiredRoles);
        if (normalized.length === 0) {
          throw new ApiError(400, "At least one required role is required");
        }
        project.requiredRoles = normalized;
      } else if (field === "teamSize") {
        const min = updateData.teamSize.min !== undefined ? Number(updateData.teamSize.min) : project.teamSize.min;
        const max = updateData.teamSize.max !== undefined ? Number(updateData.teamSize.max) : project.teamSize.max;

        if (max < min) {
          throw new ApiError(400, "Maximum team size must be greater than or equal to minimum team size");
        }
        if (max < project.members.length) {
          throw new ApiError(400, `Maximum team size cannot be less than current member count (${project.members.length})`);
        }

        project.teamSize = { min, max };
      } else if (typeof updateData[field] === "string") {
        project[field] = updateData[field].trim();
      } else {
        project[field] = updateData[field];
      }
    }
  }

  project.lastActivityAt = new Date();
  await project.save();

  return await populateProject(Project.findById(project._id));
};

export const closeProject = async (projectId, userId) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (project.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "Forbidden: You do not have permission to close this project");
  }

  if (project.status === "CLOSED") {
    throw new ApiError(400, "Project is already closed");
  }

  project.status = "CLOSED";
  project.lastActivityAt = new Date();
  await project.save();

  return await populateProject(Project.findById(project._id));
};

export default {
  createProject,
  getMyProjects,
  getProjectById,
  updateProject,
  closeProject,
};
