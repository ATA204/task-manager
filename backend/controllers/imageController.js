const Image = require("../models/Image");

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

// The browser's mimetype can be faked, so check the file's first bytes too
const detectImageType = (buffer) => {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
    return "image/png";
  }
  return null;
};

// POST /api/auth/upload-image  (multipart/form-data, field "image")
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No File Uploaded" });
    }
    const contentType = detectImageType(req.file.buffer);
    if (!contentType) {
      return res.status(400).json({ message: "only .jpg jpeg png files" });
    }

    const image = await Image.create({
      data: req.file.buffer,
      contentType,
      size: req.file.size,
    });

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${image._id}`;
    res.status(200).json({ imageUrl });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Only real ObjectIds reach the database; anything else is a 404 right away
const checkImageId = (req, res, next) => {
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
    return res.status(404).json({ message: "Image Not Found" });
  }
  next();
};

// GET /uploads/:id
const getImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: "Image Not Found" });
    }
    res.set({
      "Content-Type": image.contentType,
      // An image never changes (a new upload gets a new id), so browsers and the CDN can keep it for a year
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    });
    res.send(image.data);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

module.exports = { uploadImage, checkImageId, getImage };
