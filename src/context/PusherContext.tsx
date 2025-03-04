"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Pusher from 'pusher-js';
import { useUser } from "@clerk/nextjs";
import axios from 'axios';

// Definiujemy typy dla danych
interface PusherContextType {
  onlineUsers: Set<string>;
  isUserOnline: (userId: string) => boolean;
  sendMessage: (receiverId: string, text: string, conversationId: string) => Promise<void>;
}

// Typ dla danych o użytkowniku
interface UserStatusData {
  userId: string;
  isOnline: boolean;
}

// Typ dla członka kanału presence
interface PusherMember {
  id: string;
  info?: any;
}

// Typ dla obiektu members kanału presence
interface PusherMembers {
  count: number;
  members: Record<string, any>;
  myID: string;
  me: PusherMember;
  each: (callback: (member: PusherMember) => void) => void;
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

export const PusherProvider: React.FC<PusherProviderProps> = ({ children }) => {
  const [pusherClient, setPusherClient] = useState<Pusher | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set<string>());
  const { user } = useUser();

  // Inicjalizacja Pusher
  useEffect(() => {
    if (!user?.id) return;

    // Konfiguracja Pusher z autoryzacją
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || '', {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
      forceTLS: true,
      authEndpoint: '/api/pusher/auth',
      auth: {
        headers: {
          // Dodaj token sesji Clerk dla autoryzacji
          'Authorization': `Bearer ${user.id}`,
        },
      },
    });

    console.log("Pusher initialized", {
      key: process.env.NEXT_PUBLIC_PUSHER_KEY,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      authEndpoint: '/api/pusher/auth'
    });

    // Bezpieczne ustawienie klienta Pusher
    setPusherClient((prevState) => {
      if (prevState) {
        try {
          prevState.disconnect();
        } catch (err) {
          console.error("Error disconnecting previous Pusher instance:", err);
        }
      }
      return pusher;
    });

    // Kanał dla aktualizacji statusu użytkowników
    const presenceChannel = pusher.subscribe('presence-users');
    
    // Obsługa zdarzeń kanału presence
    presenceChannel.bind('pusher:subscription_succeeded', (members: PusherMembers) => {
      console.log('Successfully subscribed to presence channel', members);
      
      // Zapisz aktualnie online użytkowników
      const onlineSet = new Set<string>();
      members.each((member: PusherMember) => onlineSet.add(member.id));
      setOnlineUsers(onlineSet);
    });
    
    presenceChannel.bind('pusher:member_added', (member: PusherMember) => {
      console.log('Member added to presence channel', member);
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.add(member.id);
        return newSet;
      });
    });
    
    presenceChannel.bind('pusher:member_removed', (member: PusherMember) => {
      console.log('Member removed from presence channel', member);
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(member.id);
        return newSet;
      });
    });

    // Własne zdarzenie zmiany statusu
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
    
    // Kanał dla własnych wiadomości prywatnych
    const privateChannel = pusher.subscribe(`private-user-${user.id}`);
    
    privateChannel.bind('new-message', (data: any) => {
      console.log("Received new message via Pusher:", data);
      // Obsługa odbioru wiadomości jest w komponencie Messenger
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
        try {
          pusher.unsubscribe('presence-users');
          pusher.unsubscribe(`private-user-${user.id}`);
          
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
        } catch (err) {
          console.error("Error during cleanup:", err);
        }
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