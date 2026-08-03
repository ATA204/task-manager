const express = require("express");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const {
  createTask,
  getTasks,
  findTaskById,
  upadtaTask,
  deleteTask,
  updateTaskStatus,
  updateTaskChecklist,
  getUserDashboard,
  getDashboardData,
} = require("../controllers/taskController");
const router = express.Router();

router.post("/", protect, adminOnly, createTask);
router.get("/", protect, getTasks);
router.get("/dashboard-data", protect, getDashboardData);
router.get("/user-dashboard-data",protect,getUserDashboard)
router.get("/:id", protect, findTaskById);
router.put("/:id", protect, adminOnly, upadtaTask);
router.delete("/:id", protect, adminOnly, deleteTask);
router.put("/:id/status", protect, updateTaskStatus);
router.put("/:id/todo", protect, updateTaskChecklist);


module.exports = router;
