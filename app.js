const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");
const safe = require("safe-await");

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
const userRoutes = require("./routes/user");

app.get("/", (req, res) => {
  res.json("Api");
});

app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);
app.use("/group", groupRoutes);
app.use("/user", userRoutes);

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
  socket.on("user", async (user) => {
    if (user.email && socket.id) {
      const emailExists = sockets.findIndex((obj) => obj.email === user.email);

      if (emailExists >= 0) {
        sockets[emailExists].id = socket.id;
        const [error, user] = await safe(
          User.findOne({
            email: sockets[emailExists].email,
          })
        );
        if (error) throw new Error(error);

        user.logined = true;

        const [error2, res] = await safe(user.save());
        if (error2) throw new Error(error2);
      } else {
        const [error, userData] = await safe(
          User.findOne({
            email: user.email,
          })
        );
        if (error) throw new Error(error);

        userData.logined = true;

        const [error2, res] = await safe(userData.save());
        if (error2) throw new Error(error2);
        sockets.push({
          id: socket.id,
          email: user.email,
        });
      }
    }
    io.emit("logined");
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
  // set user logined status to false and set the last online state
  socket.on("disconnect", function () {
    console.log("users 1 " + sockets);
    console.log(socket.id + " : disconnected");
    const index = sockets.findIndex((obj) => obj.id === socket.id);
    console.log(socket.id + " : disconnected again" + "index " + index);
    console.log("users 2" + sockets);

    if (index >= 0) {
      User.findOneAndUpdate(
        { email: sockets[index].email },
        {
          logined: false,
          lastOnline: Date.now(),
        },
        { new: true }
      )
        .then((user) => {
          console.log(user.logined);
          sockets.splice(index, 1);
        })

        .catch((err) => console.log(err));

      console.log("save");
    }

    io.emit("logout");
  });
});
