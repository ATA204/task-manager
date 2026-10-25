const Notification = require("../models/Notification");


//GET /api/notifications?page=..&limit=..&unread=Boolean
const getNotifications = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1)
        const limit = Math.min(parseInt(req.query.limit) || 10, 50)
        const filter = { userId: req.user._id }

        if (req.query.unread === "true") filter.read = false;

        const [notifications, total, unreadCount] = await Promise.all([
            Notification.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Notification.countDocuments(filter),
            Notification.countDocuments({ userId: req.user._id, read: false })
        ]);
        res.json({
            notifications,
            unreadCount,
            page,
            hasMore: page * limit < total,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message })
    }
}
// PUT /api/notifications/:id/read
const markAsRead = async (req, res) => {
    try {
        // findOneAndUpdate (not findByIdAndUpdate): the filter also checks the owner
        const notification = await Notification.findOneAndUpdate(
            { userId: req.user._id, _id: req.params.id },
            { read: true, readAt: Date.now() },
            { new: true }
        )
        if (!notification) {
            return res.status(404).json({ message: "Notification Not Found" })
        }
        res.json({ message: "Notification Marked as read", notification });
    }
    catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message })
    }
}

//PUT /api/notifications/read-all

const markAllRead = async (req, res) => {
    try {
        const notifications = await Notification.updateMany(
            { userId: req.user._id, read: false },
            { read: true, readAt: Date.now() },
            { new: true })

        res.json({ message: "All notifications marked as read" })
    }
    catch (error) {
        res.status(500).json({
            message: "Server Error",
            error: error.message,
        })
    }
}

//DELETE /api/notifications/:id

const deleteNotification = async (req, res) => {
    try {
        const result = await Notification.deleteOne(
            {
                userId: req.user._id,
                _id: req.params.id,
            });
        if (result.deletedCount===0) {
            return res.status(404).json({ message: "Notification Not Found" })
        }
        res.json({ message: "Notification Deleted" })
    }
    catch (error) {
        res.status(500).json({
            message: "Server Error",
            error: error.message,
        })
    }
}

//DELETE /api/notifications

const clearAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.deleteMany({
            userId: req.user._id,
        });
        res.json({
            message: "All Notifications Cleared"
        })
    }
    catch (error) {
        res.status(500).json({
            message: "Server Error",
            error: error.message,
        })
    }
}

module.exports = {
    getNotifications,
    markAsRead,
    markAllRead,
    deleteNotification,
    clearAllNotifications,

}