const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");

//model
const User = require("./model/user");

const app = express();
app.use(bodyParser.json());
//dot env
dotenv.config({ path: "./config.env" });
//url
const URL = process.env.URL;

app.use(cors({ credentials: true, origin: URL }));
app.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS,GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(cookieParser());

// databse connecti
require("./db/conn");

//Routes
const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const groupRoutes = require("./routes/group");

app.get("/", (req, res) => {
  res.json("Api");
});

app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);
app.use("/group", groupRoutes);

// Env variables
const PORT = process.env.PORT;

// connection
const server = app.listen(PORT, () => console.log(`Listening port ${PORT}`));

//scoket

const io = new Server(server, { cors: { origin: URL } });

const sockets = [];

//users

// socket is the client instance who is connected
// socket.emit send message to the same client only
// io.emit send message to all connected clients also the sender
// socket.broadcast.emit broadcast the message to all connections except the sender
io.on("connection", function (socket) {
  console.log("socket connected : " + socket.id);

  // when a new user join
  // the email and the socket id of the user id push into the sockets array
  // if the user already exists then the socket id of the user is replaces with the help of email
  socket.on("user", (user) => {
    if (user.email && socket.id) {
      const email = sockets.findIndex((obj) => obj.email === user.email);

      if (email >= 0) {
        sockets[email].id = socket.id;
      } else {
        sockets.push({
          id: socket.id,
          email: user.email,
        });
      }
    }
  });

  // join the user to a room to chat with other user or group
  socket.on("room", (room) => {
    console.log("new room" + room);
    socket.join(room);
  });

  // emit socket when user send message to others or singlw user with help of room id
  socket.on("chat", (message) => {
    console.log("chat sockey server");
    socket.to(message.room).emit("recevied", message);
  });

  // if a user close the browser , logout , or refresh the page
  // remove socket from sockets array
  // set user logined status to false and set the last onlien state
  socket.on("disconnect", async function () {
    console.log(socket.id + " : disconnected");
    const index = sockets.findIndex((obj) => obj.id === socket.id);

    if (index >= 0) {
      try {
        const user = await User.findOne({ email: sockets[index].email });
        user.logined = false;
        user.lastOnline = Date.now();
        user.save();
      } catch (err) {
        console.log(err);
      }

      sockets.splice(index, 1);
    }

    socket.emit("user disconnected");
  });
});
