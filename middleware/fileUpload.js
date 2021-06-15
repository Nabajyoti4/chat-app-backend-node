const multer = require("multer");

//multer storage
const storage = multer.diskStorage({
  destination: "G:/Chat-App/whatspp-mern-frontend/public/profile",
  filename: (req, file, callback) => {
    callback(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
