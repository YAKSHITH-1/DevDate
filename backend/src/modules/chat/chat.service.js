import Match from "../../models/Match.js";
import Message from "../../models/Message.js";
import ApiError from "../../utils/ApiError.js";
import { getIO } from "../../sockets/index.js";

const POPULATE_PROJECT = {
  path: "project",
  select: "title description category image duration teamSize status",
};

const POPULATE_OWNER = {
  path: "owner",
  select: "name email avatar role bio",
};

const POPULATE_USER = {
  path: "user",
  select: "name email avatar role bio skills experience",
};

/**
 * 1. Get all active 1-to-1 conversations for a user where Match status is ACCEPTED
 */
export const getUserConversations = async (userId) => {
  const matches = await Match.find({
    status: "ACCEPTED",
    $or: [{ user: userId }, { owner: userId }],
  })
    .populate(POPULATE_PROJECT)
    .populate(POPULATE_OWNER)
    .populate(POPULATE_USER)
    .sort({ updatedAt: -1 });

  // For each accepted match, retrieve the last message
  const conversations = await Promise.all(
    matches.map(async (match) => {
      const matchObj = match.toObject ? match.toObject() : match;
      const isLead = matchObj.owner?._id?.toString() === userId.toString();
      const otherParticipant = isLead ? matchObj.user : matchObj.owner;

      const lastMessage = await Message.findOne({ match: matchObj._id })
        .sort({ createdAt: -1 })
        .populate("sender", "name email avatar role");

      return {
        _id: matchObj._id,
        matchId: matchObj._id,
        project: matchObj.project,
        projectName: matchObj.project?.title || "",
        projectDescription: matchObj.project?.description || "",
        lead: matchObj.owner,
        developer: matchObj.user,
        otherParticipant,
        isLead,
        status: matchObj.status,
        lastMessage: lastMessage
          ? {
              _id: lastMessage._id,
              message: lastMessage.message,
              sender: lastMessage.sender,
              receiver: lastMessage.receiver,
              createdAt: lastMessage.createdAt,
            }
          : null,
        createdAt: matchObj.createdAt,
        updatedAt: lastMessage ? lastMessage.createdAt : matchObj.updatedAt,
      };
    })
  );

  // Sort conversations by most recent message or update
  return conversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
};

/**
 * 2. Get message history for a conversation
 * Verifies user is a participant and Match status is ACCEPTED.
 */
export const getConversationMessages = async (matchId, userId) => {
  const match = await Match.findById(matchId)
    .populate(POPULATE_PROJECT)
    .populate(POPULATE_OWNER)
    .populate(POPULATE_USER);

  if (!match) {
    throw new ApiError(404, "Conversation not found");
  }

  // Security Guard: Chat only available for ACCEPTED matches
  if (match.status !== "ACCEPTED") {
    throw new ApiError(400, `Chat is not available for match with status "${match.status}". Only ACCEPTED matches have chat access.`);
  }

  const isLead = match.owner?._id?.toString() === userId.toString();
  const isDev = match.user?._id?.toString() === userId.toString();

  // Security Guard: User must be a participant in this conversation
  if (!isLead && !isDev) {
    throw new ApiError(403, "Forbidden: You are not a participant in this conversation");
  }

  const messages = await Message.find({ match: matchId })
    .populate("sender", "name email avatar role")
    .populate("receiver", "name email avatar role")
    .sort({ createdAt: 1 });

  const otherParticipant = isLead ? match.user : match.owner;

  return {
    conversation: {
      _id: match._id,
      matchId: match._id,
      project: match.project,
      otherParticipant,
      lead: match.owner,
      developer: match.user,
      status: match.status,
    },
    messages,
  };
};

/**
 * 3. Send a message in a conversation
 * Persists message to MongoDB and broadcasts via Socket.IO
 */
export const sendMessage = async (matchId, senderId, messageText) => {
  const match = await Match.findById(matchId);

  if (!match) {
    throw new ApiError(404, "Conversation not found");
  }

  // Security Guard: Chat only available for ACCEPTED matches
  if (match.status !== "ACCEPTED") {
    throw new ApiError(400, `Cannot send message. Chat is not available for match with status "${match.status}".`);
  }

  const isLead = match.owner.toString() === senderId.toString();
  const isDev = match.user.toString() === senderId.toString();

  // Security Guard: Sender must be a participant
  if (!isLead && !isDev) {
    throw new ApiError(403, "Forbidden: You are not a participant in this conversation");
  }

  const receiverId = isLead ? match.user : match.owner;

  // 1. Persist to MongoDB
  const newMessage = await Message.create({
    match: match._id,
    project: match.project,
    sender: senderId,
    receiver: receiverId,
    message: messageText.trim(),
  });

  const populatedMessage = await Message.findById(newMessage._id)
    .populate("sender", "name email avatar role")
    .populate("receiver", "name email avatar role");

  // 2. Real-time broadcast via Socket.IO
  try {
    const io = getIO();
    if (io) {
      io.to(`match:${matchId}`).emit("new_message", populatedMessage);
      io.to(`user:${receiverId.toString()}`).emit("new_message", populatedMessage);
    }
  } catch (err) {
    console.error("Socket broadcast error:", err.message);
  }

  return populatedMessage;
};

export default {
  getUserConversations,
  getConversationMessages,
  sendMessage,
};
