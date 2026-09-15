import { Router } from "express";
import {
  getConversations,
  getMessages,
  sendMessage,
} from "./chat.controller.js";
import {
  matchIdParamValidation,
  sendMessageValidation,
} from "./chat.validation.js";
import { validate } from "../../middleware/validate.js";
import { optionalAuthenticate } from "../../middleware/auth.js";

const router = Router();

// Apply auth middleware
router.use(optionalAuthenticate);

// 1. Get all active conversations for the authenticated user
router.get("/conversations", getConversations);
router.get("/", getConversations);

// 2. Get message history for a conversation
router.get("/conversations/:matchId/messages", validate(matchIdParamValidation), getMessages);
router.get("/:matchId/messages", validate(matchIdParamValidation), getMessages);

// 3. Send a message in a conversation
router.post("/conversations/:matchId/messages", validate(sendMessageValidation), sendMessage);
router.post("/:matchId/messages", validate(sendMessageValidation), sendMessage);

export default router;
