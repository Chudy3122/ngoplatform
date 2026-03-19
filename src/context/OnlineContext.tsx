"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useUser } from "@/context/AuthContext";

interface OnlineContextType {
  onlineUsers: Set<string>;
  isUserOnline: (userId: string) => boolean;
  sendMessage: (receiverId: string, text: string, conversationId: string) => Promise<void>;
}

const OnlineContext = createContext<OnlineContextType>({
  onlineUsers: new Set(),
  isUserOnline: () => false,
  sendMessage: async () => {},
});

export const useOnline = () => useContext(OnlineContext);

// Keep PusherProvider export name for backwards compatibility
export const PusherProvider = ({ children }: { children: ReactNode }) => {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const { user } = useUser();

  const updateStatus = useCallback(async (isOnline: boolean) => {
    if (!user?.userId) return;
    try {
      await fetch("/api/users/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.userId,
          userType: user.role,
          isOnline,
        }),
      });
    } catch {
      // silent
    }
  }, [user?.userId, user?.role]);

  const fetchOnlineUsers = useCallback(async () => {
    if (!user?.userId) return;
    try {
      const res = await fetch("/api/users/status");
      if (res.ok) {
        const data: string[] = await res.json();
        setOnlineUsers(new Set(data));
      }
    } catch {
      // silent
    }
  }, [user?.userId]);

  useEffect(() => {
    if (!user?.userId) return;

    updateStatus(true);
    fetchOnlineUsers();

    // Poll every 30 seconds
    const interval = setInterval(fetchOnlineUsers, 30_000);

    const handleUnload = () => updateStatus(false);
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleUnload);
      updateStatus(false);
    };
  }, [user?.userId, updateStatus, fetchOnlineUsers]);

  const isUserOnline = (userId: string) => onlineUsers.has(userId);

  const sendMessage = async (
    _receiverId: string,
    text: string,
    conversationId: string
  ) => {
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text, conversationId }),
    });
  };

  return (
    <OnlineContext.Provider value={{ onlineUsers, isUserOnline, sendMessage }}>
      {children}
    </OnlineContext.Provider>
  );
};
