const express=require("express")
const { protect, adminOnly } = require("../middlewares/authMiddleware")
const { getAllUsers, getUserById } = require("../controllers/userController")
const router=express.Router()

router.get("/",protect,adminOnly,getAllUsers)
router.get("/:id",protect,adminOnly,getUserById)


module.exports=router