const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null,`uploads/`)
  },
  filename:(req,file,cb)=>{
cb(null,`${Date.now()}-${file.originalname}`)
  }
});

const fileFilter=(req,file,cb)=>{
const allowedTypes=['image/jpg','image/jpeg','image/png']
if(allowedTypes.includes(file.mimetype)){
    cb(null,true)

}
else{
    cb(new Error('only .jpg jpeg png files'),false)
}
}
const upload=multer({storage,fileFilter})
module.exports=upload