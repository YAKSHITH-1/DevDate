import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import notificationService from "./notification.service.js";

// Helper to extract user ID from auth middleware or header/query for testing
const getUserId = (req) => {
  if (req.user && req.user._id) return req.user._id.toString();
  if (req.headers["x-user-id"]) return req.headers["x-user-id"].toString();
  if (req.query.userId) return req.query.userId.toString();
  return null;
};

export const getNotifications = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    throw new ApiError(400, "User ID is required (via token or x-user-id header)");
  }

  const unreadOnly = req.query.unread === "true";
  const limit = req.query.limit || 50;

  const notifications = await notificationService.getUserNotifications(userId, {
    unreadOnly,
    limit,
  });

  return res.status(200).json({
    success: true,
    data: notifications,
  });
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    throw new ApiError(400, "User ID is required (via token or x-user-id header)");
  }

  const count = await notificationService.getUnreadCount(userId);
  return res.status(200).json({
    success: true,
    data: count,
  });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    throw new ApiError(400, "User ID is required (via token or x-user-id header)");
  }

  const notification = await notificationService.markAsRead(req.params.id, userId);
  return res.status(200).json({
    success: true,
    message: "Notification marked as read",
    data: notification,
  });
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    throw new ApiError(400, "User ID is required (via token or x-user-id header)");
  }

  const result = await notificationService.markAllAsRead(userId);
  return res.status(200).json({
    success: true,
    message: result.message,
    data: result,
  });
});

export default {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
