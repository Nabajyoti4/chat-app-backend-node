const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Users",
  },
  members: [
    {
      member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    },
  ],
  room: {
    type: String,
    max: 255,
    min: 6,
  },
  chats: [
    {
      sender: {
        type: String,
      },
      message: {
        type: String,
      },
    },
  ],
});

// generate jwt token
const Group = mongoose.model("Groups", GroupSchema);

module.exports = Group;
