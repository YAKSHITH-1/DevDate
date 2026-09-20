import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import chatService from "./chat.service.js";

const getUserId = (req) => {
  if (req.user && req.user._id) return req.user._id.toString();
  if (req.userId) return req.userId.toString();
  if (req.headers["x-user-id"]) return req.headers["x-user-id"].toString();
  if (req.query.userId) return req.query.userId.toString();
  return null;
};

/**
 * @desc    Get all conversations for the authenticated user
 * @route   GET /api/chat/conversations
 * @access  Private (Authenticated)
 */
export const getConversations = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    throw new ApiError(401, "Authentication required to access chat conversations");
  }

  const conversations = await chatService.getUserConversations(userId);

  return res.status(200).json({
    success: true,
    count: conversations.length,
    data: conversations,
  });
});

/**
 * @desc    Get message history for a specific conversation
 * @route   GET /api/chat/conversations/:matchId/messages
 * @access  Private (Authenticated)
 */
export const getMessages = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    throw new ApiError(401, "Authentication required to view messages");
  }

  const { limit, page } = req.query;
  const result = await chatService.getConversationMessages(req.params.matchId, userId, { limit, page });

  return res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * @desc    Send a message in a conversation (REST fallback & persistence)
 * @route   POST /api/chat/conversations/:matchId/messages
 * @access  Private (Authenticated)
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    throw new ApiError(401, "Authentication required to send message");
  }

  const messageText = req.body.message || req.body.text || req.body.content;
  if (!messageText || !messageText.trim()) {
    throw new ApiError(400, "Message content is required");
  }

  const message = await chatService.sendMessage(req.params.matchId, userId, messageText);

  return res.status(201).json({
    success: true,
    message: "Message sent successfully",
    data: message,
  });
});

export default {
  getConversations,
  getMessages,
  sendMessage,
};
