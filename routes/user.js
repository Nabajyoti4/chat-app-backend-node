const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const auth = require("../middleware/verifyToke");

router.put("/update-name/", auth, userController.putName);

module.exports = router;
