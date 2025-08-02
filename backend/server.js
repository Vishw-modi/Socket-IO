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

const users = {};
const All_Users = [];

io.on("connection", (socket) => {
  console.log("User Connected", socket.id);

  socket.on("register", (name) => {
    users[name] = socket.id;
    console.log(`User: ${name} registered with socket id:${socket.id} `);
    io.emit(
      "all-users",
      Object.entries(users).map(([name, id]) => ({
        name,
        id,
      }))
    );

    console.log(users);
  });

  socket.on("private-message", ({ to, message, from }) => {
    const targetedSocketId = users[to];
    if (targetedSocketId) {
      io.to(targetedSocketId).emit("recieve-message", {
        from,
        message,
      });
    }
  });
});

app.post("/register", (req, res) => {
  console.log("Body", req.body);
  All_Users.push(req.body);
  io.emit("new-user", req.body);
  console.log(All_Users);

  res.send({ status: "Ok" });
});

server.listen(3000, () => console.log("Server running on port 3000"));
