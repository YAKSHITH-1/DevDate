import { query, param } from "express-validator";

export const getSkillsQueryValidation = [
  query("category")
    .optional()
    .trim()
    .isString()
    .withMessage("Category must be a string"),

  query("search")
    .optional()
    .trim()
    .isString()
    .withMessage("Search term must be a string"),
];

export const skillIdParamValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid skill ID"),
];

export default {
  getSkillsQueryValidation,
  skillIdParamValidation,
};
