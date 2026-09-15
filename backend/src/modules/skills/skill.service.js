import mongoose from "mongoose";
import Skill from "../../models/Skill.js";
import ApiError from "../../utils/ApiError.js";
import { SKILL_CATEGORIES } from "../../scripts/seedSkills.js";

const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const getSkills = async ({ category, search } = {}) => {
  const query = {};

  if (category && typeof category === "string" && category.trim()) {
    const trimmedCategory = category.trim();
    query.categories = { $regex: new RegExp(`^${escapeRegex(trimmedCategory)}$`, "i") };
  }

  if (search && typeof search === "string" && search.trim()) {
    const trimmedSearch = search.trim();
    const searchRegex = new RegExp(escapeRegex(trimmedSearch), "i");
    query.$or = [
      { name: { $regex: searchRegex } },
      { aliases: { $regex: searchRegex } },
    ];
  }

  const skills = await Skill.find(query)
    .select("_id name categories aliases")
    .sort({ name: 1 })
    .lean();

  return skills;
};

export const getSkillById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid skill ID format");
  }

  const skill = await Skill.findById(id).select("_id name categories aliases").lean();
  if (!skill) {
    throw new ApiError(404, "Skill not found");
  }

  return skill;
};

export const validateSkillIds = async (skillIds) => {
  if (!Array.isArray(skillIds)) {
    throw new ApiError(400, "requiredSkills must be an array of Skill IDs");
  }

  if (skillIds.length < 1 || skillIds.length > 15) {
    throw new ApiError(400, "requiredSkills must contain between 1 and 15 skills");
  }

  // Deduplicate and validate Mongo ObjectId format
  const stringIds = skillIds.map((id) => (typeof id === "string" ? id : id?.toString() || ""));
  const uniqueIds = [...new Set(stringIds)];

  for (const id of uniqueIds) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, `Invalid MongoDB ObjectId: '${id}'`);
    }
  }

  const existingSkills = await Skill.find({ _id: { $in: uniqueIds } })
    .select("_id")
    .lean();

  if (existingSkills.length !== uniqueIds.length) {
    throw new ApiError(400, "One or more skill IDs do not exist in the system");
  }

  return uniqueIds.map((id) => new mongoose.Types.ObjectId(id));
};

export const getCategories = () => {
  return SKILL_CATEGORIES;
};

export default {
  getSkills,
  getSkillById,
  validateSkillIds,
  getCategories,
};
