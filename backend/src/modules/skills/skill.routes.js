import { Router } from "express";
import {
  getSkills,
  getSkillById,
  getCategories,
} from "./skill.controller.js";
import {
  getSkillsQueryValidation,
  skillIdParamValidation,
} from "./skill.validation.js";
import { validate } from "../../middleware/validate.js";

const router = Router();

// GET /api/skills/categories
router.get("/categories", getCategories);

// GET /api/skills (Supports ?category=... and ?search=...)
router.get("/", validate(getSkillsQueryValidation), getSkills);

// GET /api/skills/:id
router.get("/:id", validate(skillIdParamValidation), getSkillById);

export default router;
