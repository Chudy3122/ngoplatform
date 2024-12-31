import { io } from "socket.io-client";

let socket;

export const getSocket = () => {
    if (!socket) {
        socket = io("http://localhost:8900", {
            withCredentials: true,
            transports: ["websocket"]
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

export const connectToSocket = (userId) => {
    const socket = getSocket();
    if (userId && !socket.connected) {
        socket.connect();
        socket.emit("addUser", userId);
        console.log("Emitting addUser for:", userId);
    }
};

export const disconnectFromSocket = () => {
    if (socket?.connected) {
        socket.disconnect();
    }
};