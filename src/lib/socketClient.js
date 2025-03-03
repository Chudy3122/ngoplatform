// src/utils/socket.js (lub gdziekolwiek masz swój kod Socket.IO klienta)
import { io } from "socket.io-client";

let socket;

export const getSocket = () => {
  if (!socket) {
    // Najpierw spróbuj zainicjalizować endpoint Socket.IO (tylko raz)
    fetch('/api/socket')
      .catch(err => console.error('Failed to initialize socket endpoint:', err));
    
    // Utwórz instancję Socket.IO
    socket = io({
      path: '/api/socket',
      autoConnect: true,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling']
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

export const connectToSocket = (userId, userType) => {
  const socketInstance = getSocket();
  
  if (userId && socketInstance) {
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