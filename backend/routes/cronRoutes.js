const express = require("express");
const { cronAuth } = require("../middlewares/cronAuth");
const { runReminderCron } = require("../controllers/taskRemindeers");
const router = express.Router();

// Every /api/cron/* call needs "Authorization: Bearer <CRON_SECRET>" (401 otherwise)
router.use(cronAuth);

// Scheduled in vercel.json ("crons")
router.get("/reminders", runReminderCron);

module.exports = router;
