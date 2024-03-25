const express = require("express");
const { createServer } = require("node:http");
const { join } = require("node:path");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.get("/", (req, res) => {
  //   res.sendFile(join(__dirname, 'index.html'));
});

let emailToSocketIdMap = new Map();
let socketIdToEmailMap = new Map();
io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  socket.on("join:room", (data)=>{
      const {email, roomId} = data;
      emailToSocketIdMap.set(email, socket.id);
      socketIdToEmailMap.set(socket.id, email);
      console.log("email socket map", emailToSocketIdMap);
      console.log("join user", socket.id)
      io.to(roomId).emit("join:user", {
        email: email, 
        socketId : socket.id
      });

      socket.join(roomId);
      socket.join("user")
      io.to(socket.id).emit("join:room", data)
  })

  socket.on("call:user", (data) => {
    // console.log("call user", data.to);
    // console.log("call offer", data.offer)
    io.to(data.to).emit("call:incoming", {from : socket.id, offer : data.offer})
  })

  socket.on("call:accepted", (data)=>{
    const {to , ans} = data;
    console.log("cal accepted ans", ans);
    io.to(to).emit("call:accepted", {from : socket.id, ans : ans});
  })

  socket.on("negotiate:peer", (data) => {
    const {to, offer} = data;
    console.log("negotiate peer", data);
    io.to(to).emit("negotiate:peer", {from : socket.id, offer : offer});
  })

  socket.on("negotiation:done", (data) => {
    const {to, ans} = data;
    console.log('final', ans);
    io.to(to).emit("negotiate:final", {from : socket.id, ans : ans });
  })

});



server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
