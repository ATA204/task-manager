const multer = require("multer");

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

// Keep the file in memory (req.file.buffer). The controller saves it in MongoDB,
// because files written to disk are lost on Vercel and on Render's free plan.
const storage = multer.memoryStorage();

const fileFilter=(req,file,cb)=>{
const allowedTypes=['image/jpg','image/jpeg','image/png']
if(allowedTypes.includes(file.mimetype)){
    cb(null,true)

}
else{
    cb(new Error('only .jpg jpeg png files'),false)
}
}
// busboy (inside Multer) rejects a file as soon as it reaches the limit, so +1 lets exactly 2 MB through
const upload=multer({storage,fileFilter,limits:{fileSize:MAX_FILE_SIZE+1,files:1}})

// Runs upload.single("image") and turns Multer errors into a JSON 400
const uploadSingleImage = (req, res, next) => {
  upload.single("image")(req, res, (error) => {
    if (!error) return next();
    const message =
      error.code === "LIMIT_FILE_SIZE" ? "Image must be 2 MB or smaller" : error.message;
    res.status(400).json({ message });
  });
};

module.exports = { upload, uploadSingleImage };
