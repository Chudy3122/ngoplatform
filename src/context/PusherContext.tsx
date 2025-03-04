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

    // Przygotowanie nagłówków autoryzacji
    const headers: Record<string, string> = {};
    if (user?.id) {
      headers['Authorization'] = `Bearer ${user.id}`;
    }

    // Konfiguracja Pusher - WAŻNE - używamy public-key z NEXT_PUBLIC_PUSHER_KEY
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || '', {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
      forceTLS: true,
      authEndpoint: '/api/pusher/auth', 
      auth: {
        headers // Przekazanie nagłówków autoryzacji
      }
    });

    console.log("Inicjalizacja Pusher z kluczem:", process.env.NEXT_PUBLIC_PUSHER_KEY);
    console.log("Używam endpointu autoryzacji:", '/api/pusher/auth');

    setPusherClient((prevState) => {
      if (prevState) {
        try {
          prevState.disconnect();
        } catch (err) {
          console.error("Błąd rozłączania poprzedniej instancji Pusher:", err);
        }
      }
      return pusher;
    });

    // Obsługa wydarzeń połączenia
    pusher.connection.bind('connected', () => {
      console.log("Połączono z Pusher! Socket ID:", pusher.connection.socket_id);
      updateUserStatusOnline();
    });

    pusher.connection.bind('disconnected', () => {
      console.log("Rozłączono z Pusher");
    });

    pusher.connection.bind('error', (error: any) => {
      console.error("Błąd połączenia Pusher:", error);
    });

    // Aktualizacja statusu online po połączeniu
    const updateUserStatusOnline = async () => {
      try {
        const userType = user.publicMetadata?.role || 'STUDENT';
        await axios.post('/api/users/status', {
          userId: user.id,
          userType,
          isOnline: true
        });
        console.log("Status użytkownika ustawiony na online");
      } catch (err) {
        console.error("Błąd aktualizacji statusu:", err);
      }
    };

    // Kanał publiczny dla ogólnych aktualizacji
    const publicChannel = pusher.subscribe('public-updates');
    publicChannel.bind('user-status-change', (data: UserStatusData) => {
      console.log("Zmiana statusu użytkownika (kanał publiczny):", data);
      updateUserStatus(data);
    });

    // Próba subskrypcji kanału presence (nie krytyczna)
    try {
      const presenceChannel = pusher.subscribe('presence-users');
      
      presenceChannel.bind('pusher:subscription_succeeded', (members: PusherMembers) => {
        console.log('Subskrypcja kanału presence udana', members);
        const onlineSet = new Set<string>();
        members.each((member: PusherMember) => onlineSet.add(member.id));
        setOnlineUsers(onlineSet);
      });
      
      presenceChannel.bind('pusher:member_added', (member: PusherMember) => {
        console.log('Użytkownik dołączył do kanału presence', member);
        updateUserStatus({ userId: member.id, isOnline: true });
      });
      
      presenceChannel.bind('pusher:member_removed', (member: PusherMember) => {
        console.log('Użytkownik opuścił kanał presence', member);
        updateUserStatus({ userId: member.id, isOnline: false });
      });

      // Własne zdarzenie zmiany statusu (z api/users/status)
      presenceChannel.bind('user-status-change', (data: UserStatusData) => {
        console.log("Zmiana statusu użytkownika (z API):", data);
        updateUserStatus(data);
      });
    } catch (err) {
      console.error("Błąd subskrypcji kanału presence:", err);
    }

    // Kanał prywatny dla wiadomości
    try {
      const privateChannel = pusher.subscribe(`private-user-${user.id}`);
      
      privateChannel.bind('new-message', (data: any) => {
        console.log("Nowa wiadomość przez Pusher:", data);
      });

      privateChannel.bind('pusher:subscription_error', (error: any) => {
        console.error("Błąd subskrypcji kanału prywatnego:", error);
      });
    } catch (err) {
      console.error("Błąd subskrypcji kanału prywatnego:", err);
    }

    // Funkcja pomocnicza do aktualizacji statusu użytkownika
    function updateUserStatus(data: UserStatusData) {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (data.isOnline) {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });
    }

    // Czyszczenie przy odmontowaniu
    return () => {
      if (pusher) {
        // Ustawienie statusu offline przed odłączeniem
        const updateOffline = async () => {
          try {
            const userType = user.publicMetadata?.role || 'STUDENT';
            await axios.post('/api/users/status', {
              userId: user.id,
              userType,
              isOnline: false
            });
            console.log("Status użytkownika ustawiony na offline");
          } catch (err) {
            console.error("Błąd aktualizacji statusu offline:", err);
          }
        };
        
        updateOffline().finally(() => {
          try {
            pusher.unsubscribe('public-updates');
            pusher.unsubscribe('presence-users');
            pusher.unsubscribe(`private-user-${user.id}`);
            pusher.disconnect();
          } catch (err) {
            console.error("Błąd podczas rozłączania Pusher:", err);
          }
          setPusherClient(null);
        });
      }
    };
  }, [user?.id]);

  // Sprawdzenie, czy użytkownik jest online
  const isUserOnline = (userId: string): boolean => {
    return onlineUsers.has(userId);
  };

  // Wysyłanie wiadomości przez Pusher
  const sendMessage = async (receiverId: string, text: string, conversationId: string): Promise<void> => {
    if (!user?.id) return;

    try {
      // Najpierw zapisz wiadomość przez API
      const response = await axios.post('/api/messages', {
        content: text,
        conversationId: conversationId
      });
      
      // Potem wyślij powiadomienie przez Pusher
      await axios.post('/api/pusher', {
        channel: `private-user-${receiverId}`,
        event: 'new-message',
        data: {
          senderId: user.id,
          text,
          conversationId
        }
      });
      console.log("Powiadomienie o wiadomości wysłane przez Pusher");
    } catch (error) {
      console.error("Błąd wysyłania wiadomości:", error);
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