const Task = require("../models/Task");
const connectDB = require("../config/db");
const { onTaskDueSoon, onTaskOverdue } = require("../services/notificationEvents");

const CHECK_EVERY_MS = 60 * 60 * 1000;
const DUE_SOON_WINDOW_MS = 24 * 60 * 60 * 1000;

// Used by the hourly job (local / Render) and by GET /api/cron/reminders (Vercel Cron).
// Returns { dueSoon, overdue } counts, or null if the check failed.
const checkDueDates = async () => {
    try {
        await connectDB();
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
        return { dueSoon: dueSoonTasks.length, overdue: overdueTasks.length };
    }
    catch (error) {
        console.error({message:"[reminders] check failed:",error: error.message});
        return null;
    }

}
const startTaskReminderJob = () => {
    checkDueDates();
    setInterval(checkDueDates, CHECK_EVERY_MS);
};

// GET /api/cron/reminders (Vercel Cron, once a day; cronAuth runs first)
const runReminderCron = async (req, res) => {
    const result = await checkDueDates();
    if (!result) {
        return res.status(500).json({ message: "Reminder check failed" });
    }
    res.json({ message: "Reminder check done", ...result });
};

module.exports = { startTaskReminderJob, checkDueDates, runReminderCron };
