import { body, param } from "express-validator";

export const createInvitationValidation = [
  body("projectId")
    .notEmpty()
    .withMessage("Project ID is required")
    .isMongoId()
    .withMessage("Invalid Project ID format"),

  body("developerId")
    .notEmpty()
    .withMessage("Developer ID is required")
    .isMongoId()
    .withMessage("Invalid Developer ID format"),

  body("message")
    .optional()
    .isString()
    .withMessage("Message must be a string")
    .trim()
    .isLength({ max: 500 })
    .withMessage("Message cannot exceed 500 characters"),
];

export const invitationIdParamValidation = [
  param("id")
    .notEmpty()
    .withMessage("Invitation ID is required")
    .isMongoId()
    .withMessage("Invalid Invitation ID format"),
];

export const projectIdParamValidation = [
  param("projectId")
    .notEmpty()
    .withMessage("Project ID is required")
    .isMongoId()
    .withMessage("Invalid Project ID format"),
];

export default {
  createInvitationValidation,
  invitationIdParamValidation,
  projectIdParamValidation,
};
