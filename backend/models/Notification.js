const mongoose = require("mongoose");
const { NOTIFICATION_TYPES } = require("../utils/notificationTypes");

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    actor: {
        id: { type: mongoose.Types.ObjectId, ref: "User", default: null },
        name: { type: String },
    },
    notificationType: { type: String, required: true, enum: Object.values(NOTIFICATION_TYPES) },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
    meta: { type: Object, default: {} },

},
    { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1, read: 1 }) //newest first
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 }) //notification removed after 90 days

module.exports = mongoose.model('Notification', notificationSchema)