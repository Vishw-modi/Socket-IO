const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(express.json());

io.on("connection", (socket) => {
  console.log("User Connected", socket.id);
  socket.emit("all-users", All_Users);
});

const All_Users = [];
app.post("/register", (req, res) => {
  console.log("Body", req.body);
  All_Users.push(req.body);
  io.emit("new-user", req.body);
  res.send({ status: "Ok" });
});

server.listen(3000, () => console.log("Server running on port 3000"));
