// pages/api/socket.js
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const users = new Map();

export default function SocketHandler(req, res) {
  // Sprawdzamy, czy Socket.IO jest już zainicjowane
  if (res.socket.server.io) {
    console.log('Socket.IO już zainicjowane');
    res.end();
    return;
  }

  const io = new Server(res.socket.server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true
    },
    transports: ['polling', 'websocket'],
    allowEIO3: true,
    connectTimeout: 45000,
  });

  io.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("addUser", async (userData) => {
      const { userId, userType } = userData;
      users.set(userId, socket.id);
      console.log(`User ${userId} added with socket ${socket.id}`);

      // Aktualizuj status online
      try {
        switch (userType?.toUpperCase()) {
          case 'ADMIN':
            await prisma.admin.update({
              where: { id: userId },
              data: { isOnline: true, lastActive: new Date() }
            });
            break;
          case 'TEACHER':
            await prisma.teacher.update({
              where: { id: userId },
              data: { isOnline: true, lastActive: new Date() }
            });
            break;
          case 'STUDENT':
            await prisma.student.update({
              where: { id: userId },
              data: { isOnline: true, lastActive: new Date() }
            });
            break;
          case 'PARENT':
            await prisma.parent.update({
              where: { id: userId },
              data: { isOnline: true, lastActive: new Date() }
            });
            break;
        }

        // Powiadom innych o zmianie statusu
        socket.broadcast.emit("userStatusUpdate", {
          userId,
          isOnline: true
        });
      } catch (error) {
        console.error("Error updating online status:", error);
      }

      io.emit("getUsers", Array.from(users.entries()));
    });

    socket.on("sendMessage", ({ senderId, receiverId, text }) => {
      const receiverSocket = users.get(receiverId);
      console.log(`Sending message from ${senderId} to ${receiverId}`);
      
      if (receiverSocket) {
        io.to(receiverSocket).emit("getMessage", {
          senderId,
          text
        });
      }
    });

    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${socket.id}`);
      let disconnectedUserId = null;

      for (const [userId, socketId] of users.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          users.delete(userId);
          break;
        }
      }

      if (disconnectedUserId) {
        try {
          // Spróbuj zaktualizować status we wszystkich tabelach
          await Promise.all([
            prisma.admin.updateMany({
              where: { id: disconnectedUserId },
              data: { isOnline: false, lastActive: new Date() }
            }),
            prisma.teacher.updateMany({
              where: { id: disconnectedUserId },
              data: { isOnline: false, lastActive: new Date() }
            }),
            prisma.student.updateMany({
              where: { id: disconnectedUserId },
              data: { isOnline: false, lastActive: new Date() }
            }),
            prisma.parent.updateMany({
              where: { id: disconnectedUserId },
              data: { isOnline: false, lastActive: new Date() }
            })
          ]);

          // Powiadom innych o zmianie statusu
          socket.broadcast.emit("userStatusUpdate", {
            userId: disconnectedUserId,
            isOnline: false
          });
        } catch (error) {
          console.error("Error updating offline status:", error);
        }
      }

      io.emit("getUsers", Array.from(users.entries()));
    });
  });

  // Zapisanie instancji Socket.IO w obiekcie serwera
  res.socket.server.io = io;
  
  console.log('Inicjalizacja Socket.IO zakończona');
  res.end();
}