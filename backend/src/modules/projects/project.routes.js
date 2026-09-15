import { Router } from "express";
import {
  createProject,
  getProjectById,
  updateProject,
  closeProject,
} from "./project.controller.js";
import {
  createProjectValidation,
  updateProjectValidation,
  projectIdParamValidation,
} from "./project.validation.js";
import { validate } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/auth.js";

const router = Router();

// 1️POST /projects (Create Project)
router.post("/", authenticate, validate(createProjectValidation), createProject);

// 2GET /projects/:id (Get Project by ID)
router.get("/:id", validate(projectIdParamValidation), getProjectById);

// 3️PATCH /projects/:id (Update Project)
router.patch("/:id", authenticate, validate(updateProjectValidation), updateProject);

// 4️POST /projects/:id/close (Close Project)
router.post("/:id/close", authenticate, validate(projectIdParamValidation), closeProject);

export default router;
