"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Pusher from 'pusher-js';
import { useUser } from "@clerk/nextjs";
import axios from 'axios';

interface PusherContextType {
  onlineUsers: Set<string>;
  isUserOnline: (userId: string) => boolean;
  sendMessage: (receiverId: string, text: string, conversationId: string) => Promise<void>;
}

const defaultContext: PusherContextType = {
  onlineUsers: new Set<string>(),
  isUserOnline: () => false,
  sendMessage: async () => {},
};

const PusherContext = createContext<PusherContextType>(defaultContext);

export const usePusher = () => useContext(PusherContext);

interface PusherProviderProps {
  children: ReactNode;
}

interface UserStatusData {
  userId: string;
  isOnline: boolean;
}

export const PusherProvider: React.FC<PusherProviderProps> = ({ children }) => {
  const [pusherClient, setPusherClient] = useState<Pusher | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const { user } = useUser();

  // Inicjalizacja Pusher
  useEffect(() => {
    if (!user?.id) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || '', {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
      forceTLS: true
    });

    console.log("Pusher initialized", {
      key: process.env.NEXT_PUBLIC_PUSHER_KEY,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER
    });

    setPusherClient(prevState => {
      if (prevState) {
        prevState.disconnect();
      }
      return pusher;
    });

    // Kanał dla aktualizacji statusu użytkowników
    const presenceChannel = pusher.subscribe('presence-users');
    
    presenceChannel.bind('user-status-change', (data: UserStatusData) => {
      console.log("User status change", data);
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (data.isOnline) {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });
    });

    // Ustawienie własnego statusu online
    const updateUserStatus = async () => {
      try {
        const userType = user.publicMetadata?.role || 'STUDENT';
        await axios.post('/api/users/status', {
          userId: user.id,
          userType,
          isOnline: true
        });
        console.log("User status set to online");
      } catch (err) {
        console.error("Error updating user status:", err);
      }
    };

    updateUserStatus();

    // Czyszczenie przy odmontowaniu
    return () => {
      if (pusher) {
        pusher.unsubscribe('presence-users');
        
        // Ustawienie statusu offline przed odłączeniem
        const userType = user.publicMetadata?.role || 'STUDENT';
        axios.post('/api/users/status', {
          userId: user.id,
          userType,
          isOnline: false
        }).catch(err => {
          console.error("Error updating offline status:", err);
        });

        pusher.disconnect();
        setPusherClient(null);
      }
    };
  }, [user?.id]);

  // Sprawdzenie, czy użytkownik jest online
  const isUserOnline = (userId: string): boolean => {
    return onlineUsers.has(userId);
  };

  // Wysyłanie wiadomości
  const sendMessage = async (receiverId: string, text: string, conversationId: string): Promise<void> => {
    if (!user?.id) return;

    try {
      await axios.post('/api/pusher', {
        channel: `private-user-${receiverId}`,
        event: 'new-message',
        data: {
          senderId: user.id,
          text,
          conversationId
        }
      });
      console.log("Message sent via Pusher");
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  const value: PusherContextType = {
    onlineUsers,
    isUserOnline,
    sendMessage
  };

  return (
    <PusherContext.Provider value={value}>
      {children}
    </PusherContext.Provider>
  );
};

// Wersja JavaScript (bez typów)
export const PusherProviderJS = ({ children }: { children: ReactNode }) => {
  const [pusherClient, setPusherClient] = useState<Pusher | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const { user } = useUser();

  // Inicjalizacja Pusher
  useEffect(() => {
    if (!user?.id) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || '', {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
      forceTLS: true
    });

    console.log("Pusher initialized", {
      key: process.env.NEXT_PUBLIC_PUSHER_KEY,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER
    });

    setPusherClient(prevState => {
      if (prevState) {
        prevState.disconnect();
      }
      return pusher;
    });

    // Kanał dla aktualizacji statusu użytkowników
    const presenceChannel = pusher.subscribe('presence-users');
    
    presenceChannel.bind('user-status-change', (data: UserStatusData) => {
      console.log("User status change", data);
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (data.isOnline) {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });
    });

    // Ustawienie własnego statusu online
    const updateUserStatus = async () => {
      try {
        const userType = user.publicMetadata?.role || 'STUDENT';
        await axios.post('/api/users/status', {
          userId: user.id,
          userType,
          isOnline: true
        });
        console.log("User status set to online");
      } catch (err) {
        console.error("Error updating user status:", err);
      }
    };

    updateUserStatus();

    // Czyszczenie przy odmontowaniu
    return () => {
      if (pusher) {
        pusher.unsubscribe('presence-users');
        
        // Ustawienie statusu offline przed odłączeniem
        const userType = user.publicMetadata?.role || 'STUDENT';
        axios.post('/api/users/status', {
          userId: user.id,
          userType,
          isOnline: false
        }).catch(err => {
          console.error("Error updating offline status:", err);
        });

        pusher.disconnect();
        setPusherClient(null);
      }
    };
  }, [user?.id]);

  // Sprawdzenie, czy użytkownik jest online
  const isUserOnline = (userId: string): boolean => {
    return onlineUsers.has(userId);
  };

  // Wysyłanie wiadomości
  const sendMessage = async (receiverId: string, text: string, conversationId: string): Promise<void> => {
    if (!user?.id) return;

    try {
      await axios.post('/api/pusher', {
        channel: `private-user-${receiverId}`,
        event: 'new-message',
        data: {
          senderId: user.id,
          text,
          conversationId
        }
      });
      console.log("Message sent via Pusher");
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  const value: PusherContextType = {
    onlineUsers,
    isUserOnline,
    sendMessage
  };

  return (
    <PusherContext.Provider value={value}>
      {children}
    </PusherContext.Provider>
  );
};