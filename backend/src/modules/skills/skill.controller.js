import asyncHandler from "../../utils/asyncHandler.js";
import skillService from "./skill.service.js";

export const getSkills = asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  const skills = await skillService.getSkills({ category, search });
  return res.status(200).json({
    success: true,
    count: skills.length,
    data: skills,
  });
});

export const getSkillById = asyncHandler(async (req, res) => {
  const skill = await skillService.getSkillById(req.params.id);
  return res.status(200).json({
    success: true,
    data: skill,
  });
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = skillService.getCategories();
  return res.status(200).json({
    success: true,
    data: categories,
  });
});

export default {
  getSkills,
  getSkillById,
  getCategories,
};
