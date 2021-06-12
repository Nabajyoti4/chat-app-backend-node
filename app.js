const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");

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

//users

// socket is the client instance who is connected
// socket.emit send message to the same client only
// io.emit send message to all connected clients also the sender
// socket.broadcast.emit broadcast the message to all connections except the sender
io.on("connection", function (socket) {
  socket.on("user", (user) => {
    console.log("eamil" + user.email);
  });

  socket.emit("welcome", "Welcome Naba");

  socket.on("room", (room) => {
    console.log("new room" + room);
    socket.join(room);
  });

  socket.on("chat", (message) => {
    console.log("chat sockey server");
    socket.to(message.room).emit("recevied", message);
  });
});
