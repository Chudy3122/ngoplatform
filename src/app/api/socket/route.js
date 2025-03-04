// src/app/api/socket/route.js
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';

// Nowa konfiguracja dla Vercel zgodna z App Router
export const runtime = "nodejs";
export const maxDuration = 300; // Maksymalny czas trwania funkcji w sekundach

const prisma = new PrismaClient();
let users = new Map();
let io;

export async function GET(req) {
  if (!io) {
    console.log('Socket.IO initializing...');
    
    // Przypisanie zmiennych do globalnych obiektów, aby zachować je pomiędzy wywołaniami
    const res = {
      socket: {
        server: {
          io: undefined,
          on: (event, handler) => {},
          emit: (event, data) => {},
          // Dodajemy puste metody, aby uniknąć błędów
          _events: {},
          _eventsCount: 0
        }
      }
    };
    
    // Konfiguracja Socket.IO z priorytetem dla polling zamiast websocket
    io = new Server(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: '*', // W środowisku produkcyjnym lepiej określić dokładny origin
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true
      },
      // Priorytetyzujemy polling nad websocket dla lepszej kompatybilności z Vercel
      transports: ['polling', 'websocket'],
      allowEIO3: true,
      connectTimeout: 30000, // Zmniejszamy czas oczekiwania
      pingTimeout: 10000,    // Zmniejszamy timeout dla ping/pong
      pingInterval: 25000,   // Zwiększamy częstotliwość pingowania
    });

    io.on("connect_error", (err) => {
      console.log(`connect_error due to ${err.message}`);
    });

    io.on("connection", (socket) => {
      console.log(`User connected: ${socket.id}`);

      socket.on("addUser", async (userData) => {
        try {
          const { userId, userType } = userData;
          
          if (!userId) {
            console.error("Invalid userId in addUser event");
            return;
          }
          
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
        } catch (error) {
          console.error("Error in addUser handler:", error);
        }
      });

      socket.on("sendMessage", ({ senderId, receiverId, text }) => {
        try {
          if (!senderId || !receiverId || !text) {
            console.error("Invalid message data:", { senderId, receiverId, text });
            return;
          }
          
          const receiverSocket = users.get(receiverId);
          console.log(`Sending message from ${senderId} to ${receiverId}, socket: ${receiverSocket}`);
          
          if (receiverSocket) {
            io.to(receiverSocket).emit("getMessage", {
              senderId,
              text
            });
          }
        } catch (error) {
          console.error("Error in sendMessage handler:", error);
        }
      });

      socket.on("disconnect", async () => {
        try {
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
        } catch (error) {
          console.error("Error in disconnect handler:", error);
        }
      });
    });

    // Zapisz instancję Socket.IO w globalnej zmiennej
    res.socket.server.io = io;
  }
  
  return new Response(JSON.stringify({ ok: true, setup: !io ? 'new' : 'existing' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}