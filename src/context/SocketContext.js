// context/SocketContext.js
"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { initializeSocket } from "../lib/socket";
import { useUser } from "@clerk/nextjs";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState([]);
  const socketRef = useRef(null);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    // Czekamy, aż dane użytkownika będą załadowane
    if (!isLoaded || !user) return;

    const setupSocket = async () => {
      try {
        const socket = await initializeSocket();
        socketRef.current = socket;

        socket.on("connect", () => {
          setIsConnected(true);
          console.log("Socket connected in context");
          
          // Pobieramy typ użytkownika z publicMetadata
          const userType = user.publicMetadata?.role || "STUDENT";
          
          // Powiadom serwer o połączeniu użytkownika
          socket.emit("addUser", { 
            userId: user.id,
            userType
          });
        });

        socket.on("disconnect", () => {
          setIsConnected(false);
        });

        socket.on("getUsers", (usersList) => {
          setUsers(usersList);
        });

        return () => {
          if (socket) {
            socket.disconnect();
            setIsConnected(false);
          }
        };
      } catch (error) {
        console.error("Socket initialization error:", error);
      }
    };

    setupSocket();

    // Czyszczenie przy odmontowaniu komponentu
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        setIsConnected(false);
      }
    };
  }, [isLoaded, user]);

  const sendMessage = (receiverId, text) => {
    if (socketRef.current && user) {
      socketRef.current.emit("sendMessage", {
        senderId: user.id,
        receiverId,
        text,
      });
      return true;
    }
    return false;
  };

  const value = {
    socket: socketRef.current,
    isConnected,
    users,
    sendMessage,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};