const multer = require("multer");

//multer storage
const storage = multer.diskStorage({
  destination: "public/profile",
  filename: (req, file, callback) => {
    callback(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
