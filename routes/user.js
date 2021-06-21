const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const auth = require("../middleware/verifyToke");
const upload = require("../middleware/fileUpload");

router.put("/update-name/", auth, userController.putName);
router.post(
  "/upload-avatar/",
  upload.single("avatar"),
  userController.putAvatar
);

module.exports = router;
