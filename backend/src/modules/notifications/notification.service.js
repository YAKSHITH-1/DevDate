import Notification from "../../models/Notification.js";
import ApiError from "../../utils/ApiError.js";

/**
 * Create a new in-app notification with deduplication prevention
 */
export const createNotification = async ({
  recipient,
  actor,
  type,
  project = null,
  invitation = null,
  match = null,
  message = "",
}) => {
  if (!recipient || !type) return null;

  // Check for duplicate unread notification for the exact same event
  if (invitation) {
    const existing = await Notification.findOne({
      recipient,
      type,
      invitation,
      readAt: null,
    });
    if (existing) {
      return existing;
    }
  }

  const notification = await Notification.create({
    recipient,
    actor,
    type,
    project,
    invitation,
    match,
    message: message.trim(),
    readAt: null,
  });

  const populated = await Notification.findById(notification._id)
    .populate("actor", "name avatar")
    .populate("project", "title category status")
    .populate("invitation", "status")
    .populate("match", "_id status")
    .lean();

  try {
    const { getIO } = await import("../../sockets/index.js");
    const io = getIO();
    if (io) {
      io.to(`user:${recipient.toString()}`).emit("new_notification", populated || notification);
    }
  } catch (err) {
    console.error("Socket notification emit error:", err.message);
  }

  return populated || notification;
};

/**
 * Get all notifications for a specific user
 */
export const getUserNotifications = async (userId, { unreadOnly = false, limit = 50 } = {}) => {
  const query = { recipient: userId };
  if (unreadOnly) {
    query.readAt = null;
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .populate("actor", "name avatar")
    .populate("project", "title category status")
    .populate("invitation", "status")
    .populate("match", "_id status")
    .lean();

  return notifications;
};

/**
 * Get unread notification count for a user
 */
export const getUnreadCount = async (userId) => {
  const count = await Notification.countDocuments({
    recipient: userId,
    readAt: null,
  });
  return { unreadCount: count };
};

/**
 * Mark a single notification as read
 */
export const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  if (notification.recipient.toString() !== userId.toString()) {
    throw new ApiError(403, "Forbidden: You do not have permission to modify this notification");
  }

  notification.readAt = new Date();
  await notification.save();

  return notification;
};

/**
 * Mark all unread notifications as read for a user
 */
export const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { recipient: userId, readAt: null },
    { $set: { readAt: new Date() } }
  );

  return {
    modifiedCount: result.modifiedCount,
    message: "All notifications marked as read",
  };
};

export default {
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
