const { getIO } = require("../appSocket");
const { userRoom } = require("../controllers/socketController");
const Notification = require("../models/Notification");
const User = require("../models/User");



const toIdStrings = (list = []) => [
    ...new Set(list.filter(Boolean).map((item) => (item._id || item).toString()))
]

const notify = async ({
    recipients,
    actor = null,
    type,
    title,
    message,
    task = null,
    meta = {},
}) => {
    const actorId = actor?._id?.toString();

    const userIds = toIdStrings(recipients).filter((id) => id !== actorId)
    if (userIds.length === 0) return [];

    const notifications = await Notification.insertMany(
        userIds.map((userId) => ({
            userId,
            actor: actor ? { id: actor._id, name: actor.name } : { id: null, name: "System" },
            notificationType: type,
            title,
            message,
            task,
            meta,
        }))
    );

    const io = getIO()

    if (io) {
        notifications.forEach((notification) => {
            io.to(userRoom(notification.userId)).emit("notification:new", notification)
        });
    }
    return notifications;

}

const notifyAdmins = async (payload) => {
    const admins = await User.find({ role: "admin" }).select("_id");
    return notify({ ...payload,recipients: admins })
}

module.exports = { notify, notifyAdmins };