const express = require("express");
const { ensureDB } = require("../middlewares/dbMiddleware");
const { checkImageId, getImage } = require("../controllers/imageController");
const router = express.Router();

// Mounted at /uploads, after express.static (old files on disk are served first)
router.get("/:id", checkImageId, ensureDB, getImage);

module.exports = router;
