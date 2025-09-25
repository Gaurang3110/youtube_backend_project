import multer from "multer";

const storage = multer.diskStorage({
  //save file in public temp folder
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  //filename should be original name (can change)
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage: storage });
