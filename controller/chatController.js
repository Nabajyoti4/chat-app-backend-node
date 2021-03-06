const User = require("../model/user");
const Chat = require("../model/chat");

/**
 * Return all users
 * @param {*} req
 * @param {*} res
 */
exports.users = async (req, res) => {
  const name = req.query.name;
  const users = await User.find({
    name: new RegExp(".*" + name + ".*", "i"),
  });
  res.status(200).json(users);
};

/**
 * add new friend
 * @param {*} req
 * @param {*} res
 */
exports.addFriend = async (req, res) => {
  const { sender, recevier, room } = req.body;

  const friend = await Chat.findOne({ room: room });

  if (friend) {
    return res.status(409).json({
      message: "User already your friend",
    });
  }

  const chat = new Chat({
    sender: sender,
    recevier: recevier,
    room: room,
  });

  try {
    const response = await chat.save();

    res.status(200).json({
      message: "Friend added",
    });
  } catch (err) {
    res.status(400).json({
      message: "Error occured",
    });
  }
};

/**
 * Get the list fo friends
 * @param {*} req
 * @param {*} res
 */
exports.getFriends = async (req, res) => {
  const id = req.query.id;
  const friends = await Chat.find({
    $or: [{ sender: id }, { recevier: id }],
  })
    .populate("recevier", ["name", "avatar", "logined", "lastOnline"])
    .populate("sender", ["name", "avatar", "logined", "lastOnline"])
    .populate("chats.sender", "name");
  res.status(200).json(friends);
};

/**
 *
 * @param {*} req
 * @param {*} res
 */
exports.getFriend = async (req, res) => {
  const id = req.query.id;
  console.log("fectching fried for fectfriendthunk" + id);
  try {
    const friend = await User.findById(id);
    res.status(200).json(friend);
  } catch (err) {
    res.status(404).json({
      message: "Friend not found",
    });
  }
};

/**
 * Push the chat in chats array
 * @param {*} req
 * @param {*} res
 */
exports.storeChat = async (req, res) => {
  const { sender, message, room } = req.body;
  try {
    const chat = await Chat.findOne({ room: room });

    const chatMessage = {
      sender: sender,
      message: message,
    };

    chat.chats.push(chatMessage);

    const response = await chat.save();

    res.status(200).json("chat saved");
  } catch (err) {
    console.log(err);
  }
};

// get chats
exports.getChats = async (req, res) => {
  const room = req.query.room;
  try {
    const chat = await Chat.findOne({ room: room })
      .populate("chats.sender", "name")
      .select("chats");
    console.log("All chats triggered");
    res.status(200).json(chat);
  } catch (err) {
    console.log(err);
  }
};
