const mongoose = require("mongoose");

// Uploaded profile photos, stored in MongoDB so they survive redeploys.
// Served by GET /uploads/:id (see controllers/imageController.js).
const imageSchema = new mongoose.Schema(
    {
        data: { type: Buffer, required: true },
        contentType: { type: String, required: true, enum: ["image/jpeg", "image/png"] },
        size: { type: Number, required: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Image", imageSchema);
