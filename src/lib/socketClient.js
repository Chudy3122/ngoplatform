// lib/socket.js
import { io } from "socket.io-client";

let socket;

export const initializeSocket = async () => {
  // Najpierw zainicjalizuj endpoint API
  await fetch('/api/socket');
  
  // Teraz możemy podłączyć się do Socket.IO
  if (!socket) {
    socket = io({
      path: '/api/socket',
      transports: ["websocket", "polling"], // Próbujemy najpierw WebSocket, ale umożliwiamy fallback na polling
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socket.on("connect", () => {
      console.log("Socket connected successfully");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  }
  return socket;
};

export const getSocket = async () => {
  if (!socket) {
    return await initializeSocket();
  }
  return socket;
};

export const connectToSocket = async (userId, userType) => {
  const socketInstance = await getSocket();
  
  if (userId && socketInstance) {
    if (!socketInstance.connected) {
      socketInstance.connect();
    }
    
    socketInstance.emit("addUser", { userId, userType });
    console.log("Emitting addUser for:", userId, userType);
  }
  
  return socketInstance;
};

export const disconnectFromSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
  }
};