import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import notificationService from "./notification.service.js";
import { NODE_ENV } from "../../config/env.js";

// Helper to extract user ID from authenticated user context, with development fallback
const getUserId = (req) => {
  if (req.user && req.user._id) return req.user._id.toString();
  if (req.userId) return req.userId.toString();
  if ((process.env.NODE_ENV || NODE_ENV) !== "production") {
    if (req.headers["x-user-id"]) return req.headers["x-user-id"].toString();
    if (req.query.userId) return req.query.userId.toString();
  }
  return null;
};

export const getNotifications = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    throw new ApiError(401, "Authentication required to access notifications");
  }

  const unreadOnly = req.query.unread === "true";
  const limit = req.query.limit || 50;

  const [notifications, { unreadCount }] = await Promise.all([
    notificationService.getUserNotifications(userId, {
      unreadOnly,
      limit,
    }),
    notificationService.getUnreadCount(userId),
  ]);

  return res.status(200).json({
    success: true,
    data: notifications,
    unreadCount,
  });
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    throw new ApiError(401, "Authentication required to access notifications");
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
    throw new ApiError(401, "Authentication required to access notifications");
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
    throw new ApiError(401, "Authentication required to access notifications");
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
