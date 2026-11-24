
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

// All notification routes require authentication
router.use(protect);

// Get all notifications
router.get("/", getMyNotifications);

// Mark all notifications as read
router.put("/mark-all-read", markAllNotificationsAsRead);

// Mark one notification as read
router.put("/:id/read", markNotificationAsRead);

// Delete one notification
router.delete("/:id", deleteNotification);

module.exports = router;
