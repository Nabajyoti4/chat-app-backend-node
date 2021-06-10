const express = require("express");
const router = express.Router();
const groupController = require("../controller/groupController");
const auth = require("../middleware/verifyToke");

router.get("/get-members/", auth, groupController.getMembers);
router.post("/create-group/", auth, groupController.createGroup);
router.post("/add-member/", auth, groupController.addMember);
router.get("/get-groups/", auth, groupController.getGroups);
router.get("/get-group-chats/", auth, groupController.getGroupChats);
router.post("/store-group-chat/", auth, groupController.storeGroupChat);

module.exports = router;
