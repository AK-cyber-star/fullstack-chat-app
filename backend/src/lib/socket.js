import { Server } from "socket.io";
import http from "http";
import Express from "express"

const app = Express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
    },
});

// helper function
export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {} // { userId: socketId }

io.on("connection", (socket) => {
    console.log("A user is connected", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId) userSocketMap[userId] = socket.id;

    // io.emit() is used to send events to all the connected clients [basically broadcasts]
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("A user is disconneced", socket.id)
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
})

export { app, server, io };