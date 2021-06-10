const express = require("express");
const router = express.Router();
const chatController = require("../controller/chatController");
const auth = require("../middleware/verifyToke");

router.get("/users/", auth, chatController.users);
router.post("/add-friend/", auth, chatController.addFriend);
router.get("/get-friends/", auth, chatController.getFriends);
router.post("/store-chat/", auth, chatController.storeChat);
router.get("/get-chats/", auth, chatController.getChats);

module.exports = router;
