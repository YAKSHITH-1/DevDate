import { Router } from "express";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "./notification.controller.js";
import { optionalAuthenticate } from "../../middleware/auth.js";

const router = Router();

router.use(optionalAuthenticate);

// GET /api/notifications (Get user notifications)
router.get("/", getNotifications);

// GET /api/notifications/unread-count (Get unread notifications count)
router.get("/unread-count", getUnreadCount);

// PATCH /api/notifications/read-all (Mark all notifications as read)
router.patch("/read-all", markAllAsRead);

// PATCH /api/notifications/:id/read (Mark single notification as read)
router.patch("/:id/read", markAsRead);

export default router;
