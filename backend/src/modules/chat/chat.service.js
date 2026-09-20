import Match from "../../models/Match.js";
import Message from "../../models/Message.js";
import User from "../../models/User.js";
import ApiError from "../../utils/ApiError.js";
import { getIO } from "../../sockets/index.js";
import { createNotification } from "../notifications/notification.service.js";

const POPULATE_PROJECT = {
  path: "project",
  select: "title description category image status",
};

const POPULATE_OWNER = {
  path: "owner",
  select: "name avatar role",
};

const POPULATE_USER = {
  path: "user",
  select: "name avatar role",
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
    .sort({ updatedAt: -1 })
    .lean();

  const matchIds = matches.map((m) => m._id);
  if (matchIds.length === 0) {
    return [];
  }

  // Batch-fetch the last message for all matches in a single aggregation pipeline
  const latestMessageDocs = await Message.aggregate([
    { $match: { match: { $in: matchIds } } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$match",
        lastMessage: { $first: "$$ROOT" },
      },
    },
  ]);

  // Batch-populate sender details for the aggregated last messages (only name and avatar)
  const lastMessages = latestMessageDocs.map((item) => item.lastMessage);
  await Message.populate(lastMessages, {
    path: "sender",
    select: "name avatar",
  });

  const lastMessageMap = new Map();
  for (const item of latestMessageDocs) {
    if (item._id && item.lastMessage) {
      lastMessageMap.set(item._id.toString(), item.lastMessage);
    }
  }

  // Assemble conversations in memory without querying inside a loop
  const conversations = matches.map((matchObj) => {
    const isLead = matchObj.owner?._id?.toString() === userId.toString();
    const otherParticipant = isLead ? matchObj.user : matchObj.owner;
    const lastMessage = lastMessageMap.get(matchObj._id.toString()) || null;

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
  });

  // Sort conversations by most recent message or update
  return conversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
};

/**
 * 2. Get message history for a conversation
 * Verifies user is a participant and Match status is ACCEPTED.
 * Supports limit and page pagination.
 */
export const getConversationMessages = async (matchId, userId, { limit = 50, page = 1 } = {}) => {
  const match = await Match.findById(matchId)
    .populate(POPULATE_PROJECT)
    .populate(POPULATE_OWNER)
    .populate(POPULATE_USER)
    .lean();

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

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  const skip = (pageNum - 1) * limitNum;

  // Fetch recent messages with pagination, then reverse to chronological order
  const messages = await Message.find({ match: matchId })
    .select("match sender receiver message createdAt")
    .populate("sender", "name avatar")
    .populate("receiver", "name avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .lean();

  messages.reverse();

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
  const match = await Match.findById(matchId).lean();

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
    .select("match project sender receiver message createdAt")
    .populate("sender", "name avatar")
    .populate("receiver", "name avatar")
    .lean();

  // 2. Real-time broadcast via Socket.IO with compact payload
  try {
    const io = getIO();
    if (io) {
      io.to(`match:${matchId}`).emit("new_message", populatedMessage);
      io.to(`user:${receiverId.toString()}`).emit("new_message", populatedMessage);
    }
  } catch (err) {
    console.error("Socket broadcast error:", err.message);
  }

  // 3. Create real-time notification for the recipient
  try {
    const senderName = populatedMessage?.sender?.name || "A collaborator";
    await createNotification({
      recipient: receiverId,
      actor: senderId,
      type: "MESSAGE",
      project: match.project,
      match: match._id,
      message: `${senderName}: ${messageText.trim().substring(0, 80)}`,
    });
  } catch (notifErr) {
    console.error("Failed to create message notification:", notifErr.message);
  }

  return populatedMessage;
};

export default {
  getUserConversations,
  getConversationMessages,
  sendMessage,
};
