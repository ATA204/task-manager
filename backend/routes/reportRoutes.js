const express=require("express");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const { getTasksReport, getUsersReport } = require("../controllers/reportController");
const router=express.Router();

router.get("/tasks",protect,adminOnly,getTasksReport );
router.get("/users",protect,adminOnly,getUsersReport );

module.exports=router;