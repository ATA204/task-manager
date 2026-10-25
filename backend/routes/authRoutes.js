const express = require("express");
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const { uploadSingleImage } = require("../middlewares/uploadMiddleware");
const { uploadImage } = require("../controllers/imageController");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

// Saves the image in MongoDB and returns { imageUrl } (served by GET /uploads/:id)
router.post("/upload-image", uploadSingleImage, uploadImage);

module.exports = router;
