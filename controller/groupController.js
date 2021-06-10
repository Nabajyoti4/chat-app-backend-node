const Group = require("../model/group");
const User = require("../model/user");
const mongoose = require("mongoose");
/**
 * Create new group
 * Creator , members , room name , chats
 * @param {*} req
 * @param {*} res
 */
exports.createGroup = async (req, res) => {
  const { creator, members, room } = req.body;
  console.log(creator, members, room);

  let memberId = [];

  members.forEach((member) => {
    memberId.push({
      member: mongoose.Types.ObjectId(member.value),
    });
  });

  try {
    const group = new Group({
      creator: creator,
      room: room,
    });

    const response = await group.save();

    const grp = await Group.findOne({ room: room });
    memberId.forEach(async (member) => {
      try {
        grp.members.push(member);
        await grp.save();
      } catch (err) {
        console.log(err);
      }
    });

    console.log(response);
  } catch (err) {
    console.log(err);
  }
};

/**
 * Get members list for group creation
 * @param {*} req
 * @param {*} res
 */
exports.getMembers = async (req, res) => {
  console.log("server get");
  try {
    const users = await User.find().select("name");
    res.status(200).json(users);
  } catch (err) {
    res.status(200).json("No user found");
  }
};

/**
 * Get groups of auth user
 * check if the creator field has user id
 * check if the members field have user id
 * @param {*} req
 * @param {*} res
 */
exports.getGroups = async (req, res) => {
  const id = req.query.id;
  console.log(id);

  try {
    const groups = await Group.find().or([
      { creator: id },
      { "members.member": id },
    ]);
    console.log(groups);
    res.status(200).json(groups);
  } catch (err) {
    res.status(200).json(err);
  }
};

/**
 * Get group chat of a single group
 * @param {*} req
 * @param {*} res
 */
exports.getGroupChats = async (req, res) => {
  const room = req.query.room;
  try {
    const chat = await Group.findOne({ room: room }).select("chats");
    console.log("All chats triggered");
    res.status(200).json(chat);
  } catch (err) {
    console.log(err);
  }
};

/**
 * Store group chat of user
 * @param {*} req
 * @param {*} res
 */
exports.storeGroupChat = async (req, res) => {
  const { sender, room, message } = req.body;
  try {
    const group = await Group.findOne({ room: room });

    const chatMessage = {
      sender: sender,
      message: message,
    };

    group.chats.push(chatMessage);

    const response = await group.save();

    res.status(200).json("chat saved");
  } catch (err) {
    console.log(err);
  }
};

exports.addMember = async (req, res) => {};
