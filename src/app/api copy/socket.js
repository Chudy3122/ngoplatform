// app/api/socket/route.js
import { NextResponse } from "next/server";
import { Server as SocketServer } from "socket.io";

let io;
const users = new Map();

export async function GET(req) {
  if (!io) {
    const res = new NextResponse();
    
    io = new SocketServer(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
      transports: ["websocket"],
    });

    io.on("connection", (socket) => {
      socket.on("addUser", (userId) => {
        users.set(userId, socket.id);
        io.emit("getUsers", Array.from(users.entries()));
      });

      socket.on("sendMessage", ({ senderId, receiverId, text, messageId }) => {
        const receiverSocketId = users.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("getMessage", {
            senderId,
            text,
            messageId
          });
        }
      });

      socket.on("disconnect", () => {
        users.forEach((value, key) => {
          if (value === socket.id) {
            users.delete(key);
          }
        });
        io.emit("getUsers", Array.from(users.entries()));
      });
    });
  }

  return new NextResponse("Socket is running");
}