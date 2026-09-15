import { param } from "express-validator";

export const matchIdParamValidation = [
  param("id")
    .notEmpty()
    .withMessage("Match/Invitation ID is required")
    .isMongoId()
    .withMessage("Invalid Match/Invitation ID format"),
];

export default {
  matchIdParamValidation,
};
