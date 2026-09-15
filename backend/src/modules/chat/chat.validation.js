import { param, body } from "express-validator";

export const matchIdParamValidation = [
  param("matchId")
    .notEmpty()
    .withMessage("Match/Conversation ID is required")
    .isMongoId()
    .withMessage("Invalid Match/Conversation ID format"),
];

export const sendMessageValidation = [
  param("matchId")
    .notEmpty()
    .withMessage("Match/Conversation ID is required")
    .isMongoId()
    .withMessage("Invalid Match/Conversation ID format"),

  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message content is required")
    .isLength({ max: 2000 })
    .withMessage("Message cannot exceed 2000 characters"),
];

export default {
  matchIdParamValidation,
  sendMessageValidation,
};
