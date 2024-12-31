import { createContext, useContext, useEffect, useRef } from "react";
import io from "socket.io-client";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const socket = useRef();

  useEffect(() => {
    socket.current = io("http://localhost:8900"); // Zmodyfikuj URL w zależności od twojej konfiguracji
    return () => {
      socket.current.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
