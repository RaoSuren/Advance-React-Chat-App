const app = require("./app");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
process.on("uncaughtException", (err) => {
  console.log(err);
  process.exit(1);
});

const http = require("http");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https//",
    method: ["GET", "POST"]
  }
});
const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log(`App running on port ${port}`);
});

io.on("connection", async (socket) => {
  const user_id = socket.handshake.query("user_id");

  const socket_id = socket.id;
  if(user_id) {
    await User.findByIdAndUpdate(user_id, {socket_id,})
  }

  socket.on("friend_request", async (data) => {
    console.log(data.to);

    const to = await User.findById(data.to);

    io.to(to.socket_id).emit("new_friend_request", {

    });s
  })
})
const DB = process.env.DBURI;
mongoose
  .connect(DB)
  .then(() => {
    console.log("Connected to Database");
  })
  .catch((err) => {
    console.log(err);
  });
process.on("unhandledRejection", (err) => {
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});
