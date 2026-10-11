const Task = require("../models/Task");
const { onTaskDueSoon, onTaskOverdue } = require("../services/notificationEvents");

const CHECK_EVERY_MS = 60 * 60 * 1000;
const DUE_SOON_WINDOW_MS = 24 * 60 * 60 * 1000;

const checkDueDates = async () => {
    try {
        const now = new Date();
        const soon = new Date(now.getTime() + DUE_SOON_WINDOW_MS);

        const dueSoonTasks = await Task.find(
            {
                status: { $ne: "Completed" },
                dueDate: { $gte: now, $lte: soon },
                $expr: { $ne: ["$reminders.dueSoonSentFor", "$dueDate"] },
            }
        );
        for (const task of dueSoonTasks) {
            await onTaskDueSoon(task)
            await Task.updateOne(
                { _id: task._id },
                { $set: { "reminders.dueSoonSentFor": task.dueDate } }
            )

        }
        const overdueTasks = await Task.find({
            status: { $ne: "Completed" },
            dueDate: { $lt: now },
            $expr: { $ne: ["$reminders.overdueSentFor", "$dueDate"] }

        });
        for (const task of overdueTasks) {
            await onTaskOverdue(task);
            await Task.updateOne(
                { _id: task._id },
                { $set: { "reminders.overdueSentFor": task.dueDate } }
            )

        }
        if (dueSoonTasks.length || overdueTasks.length) {
            console.log(`[reminders] due soon: ${dueSoonTasks.length}, overdue: ${overdueTasks.length}`);
        }
    }
    catch (error) {
        console.error("[reminders] check failed:", error.message);

    }
}