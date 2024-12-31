import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { AuthContextProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext"; // Importuj SocketProvider

ReactDOM.render(
  <React.StrictMode>
    <AuthContextProvider>
      <SocketProvider> {/* Owiń App w SocketProvider */}
        <App />
      </SocketProvider>
    </AuthContextProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
