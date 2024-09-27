const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});


const emailToSocketIDMap = new Map();
const socketIDToEmailMap = new Map();


// app.get('/', (req, res) => {
//     res.sendFile(__dirname + '/index.html');
// });

io.on('connection', (socket) => {
    console.log('a user connected', socket.id);

    //event to catch join room request
    socket.on("join-room", (data) => {
        const { email, roomId } = data;
        console.log(data);

        emailToSocketIDMap.set(email, socket.id);
        socketIDToEmailMap.set(socket.id, email);

        io.to(roomId).emit("new-user-join", { email, socketId: socket.id });

        socket.join(roomId);


        io.to(socket.id).emit("join-room", data);

    })


    socket.on("call-user", (data) => {
        const { to, offer } = data;
        io.to(to).emit("incoming-call", { from: socket.id, offer });
    })

    socket.on("call-accepted", (data) => {
        const { to, ans } = data;
        io.to(to).emit("call-accepted", { from: socket.id, ans });
    })

    socket.on("peer:nego:needed", ({ to, offer }) => {
        console.log("peer:nego:needed", offer);
        io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
    });

    socket.on("peer:nego:done", ({ to, ans }) => {
        console.log("peer:nego:done", ans);
        io.to(to).emit("peer:nego:final", { from: socket.id, ans });
    });


    socket.on('disconnect', () => {
        console.log('user disconnected');
    });


});

server.listen(3000, () => {
    console.log('listening on *:3000');
});