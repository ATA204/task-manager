const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { getNotifications, markAllRead, markAsRead, deleteNotification, clearAllNotifications } = require("../controllers/notificationController");
const router = express.Router();

router.get("/", protect, getNotifications);
router.put("/read-all", protect, markAllRead);
router.put("/:id/read", protect, markAsRead);
router.delete("/:id", protect, deleteNotification);
router.delete("/", protect, clearAllNotifications);



module.exports = router