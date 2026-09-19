import { body, param } from "express-validator";

export const createProjectValidation = [
  body("title")
    .trim()
    .isLength({ min: 5, max: 120 })
    .withMessage("Title must be between 5 and 120 characters"),

  body("description")
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage("Description must be between 20 and 2000 characters"),

  body("requiredSkills")
    .isArray({ min: 1, max: 15 })
    .withMessage("Required skills must be an array containing between 1 and 15 skills"),

  body("requiredSkills.*")
    .isMongoId()
    .withMessage("Each required skill must be a valid MongoDB ObjectId"),

  body("interests")
    .optional()
    .isArray()
    .withMessage("Interests must be an array of strings"),

  body("requiredRoles")
    .isArray({ min: 1, max: 6 })
    .withMessage("Required roles must be an array containing between 1 and 6 roles"),

  body("requiredRoles.*")
    .trim()
    .notEmpty()
    .withMessage("Each role must be a non-empty string"),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required"),

  body("duration")
    .trim()
    .notEmpty()
    .withMessage("Duration is required (e.g., '4-6 weeks')"),

  body("teamSize")
    .isObject()
    .withMessage("Team size must be an object with min and max numbers"),

  body("teamSize.min")
    .isInt({ min: 2 })
    .withMessage("Minimum team size must be at least 2"),

  body("teamSize.max")
    .isInt({ min: 2 })
    .withMessage("Maximum team size must be at least 2")
    .custom((value, { req }) => {
      if (req.body.teamSize?.min && Number(value) < Number(req.body.teamSize.min)) {
        throw new Error("Maximum team size must be greater than or equal to minimum team size");
      }
      return true;
    }),

  body("image")
    .optional({ nullable: true })
    .trim()
    .isString()
    .withMessage("Image must be a valid string URL")
    .custom((value) => {
      if (!value) return true;
      if (/^(javascript|vbscript):/i.test(value)) throw new Error("Invalid project image URL scheme");
      if (value.length > 2048) throw new Error("Project image URL exceeds maximum length");
      return true;
    }),
];

export const updateProjectValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid project ID"),

  body("title")
    .optional()
    .trim()
    .isLength({ min: 5, max: 120 })
    .withMessage("Title must be between 5 and 120 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage("Description must be between 20 and 2000 characters"),

  body("requiredSkills")
    .optional()
    .isArray({ min: 1, max: 15 })
    .withMessage("Required skills must be an array containing between 1 and 15 skills"),

  body("requiredSkills.*")
    .optional()
    .isMongoId()
    .withMessage("Each required skill must be a valid MongoDB ObjectId"),

  body("interests")
    .optional()
    .isArray()
    .withMessage("Interests must be an array of strings"),

  body("requiredRoles")
    .optional()
    .isArray({ min: 1, max: 6 })
    .withMessage("Required roles must be an array containing between 1 and 6 roles"),

  body("requiredRoles.*")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Each role must be a non-empty string"),

  body("category")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Category cannot be empty"),

  body("duration")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Duration cannot be empty"),

  body("teamSize")
    .optional()
    .isObject()
    .withMessage("Team size must be an object with min and max numbers"),

  body("teamSize.min")
    .optional()
    .isInt({ min: 2 })
    .withMessage("Minimum team size must be at least 2"),

  body("teamSize.max")
    .optional()
    .isInt({ min: 2 })
    .withMessage("Maximum team size must be at least 2")
    .custom((value, { req }) => {
      if (req.body.teamSize?.min && Number(value) < Number(req.body.teamSize.min)) {
        throw new Error("Maximum team size must be greater than or equal to minimum team size");
      }
      return true;
    }),

  body("image")
    .optional({ nullable: true })
    .trim()
    .isString()
    .withMessage("Image must be a valid string URL")
    .custom((value) => {
      if (!value) return true;
      if (/^(javascript|vbscript):/i.test(value)) throw new Error("Invalid project image URL scheme");
      if (value.length > 2048) throw new Error("Project image URL exceeds maximum length");
      return true;
    }),
];

export const projectIdParamValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid project ID"),
];
