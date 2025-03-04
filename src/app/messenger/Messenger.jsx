"use client";

import "./page.css";
import Conversation from "@/components/conversations/page";
import Message from "@/components/message/page";
import SearchCreateConversation from "@/components/searchCreateConversation/page";
import { useEffect, useState, useRef } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { useParams } from "next/navigation";
import axios from "axios";
import Pusher from 'pusher-js';
import { useUser } from "@clerk/clerk-react";

export default function Messenger() {
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const { user } = useUser();
  const scrollRef = useRef();
  const pusherRef = useRef();
  const t = useTranslations();
  const params = useParams();
  const lang = params?.lang || 'pl';

  // Inicjalizacja Pusher
  useEffect(() => {
    if (!pusherRef.current && user?.id) {
      // Inicjalizacja Pusher
      pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
        encrypted: true
      });

      console.log("Inicjalizacja Pusher z kluczem:", process.env.NEXT_PUBLIC_PUSHER_KEY);

      // Kanał dla wszystkich użytkowników (status online/offline)
      const channelName = 'presence-users';
      console.log("Subskrypcja kanału:", channelName);
      
      const presenceChannel = pusherRef.current.subscribe(channelName);
      
      presenceChannel.bind('user-status-change', (data) => {
        console.log("Zmiana statusu użytkownika:", data);
        if (data.isOnline) {
          setOnlineUsers(prev => {
            const newSet = new Set(prev);
            newSet.add(data.userId);
            return newSet;
          });
        } else {
          setOnlineUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.userId);
            return newSet;
          });
        }
      });

      // Aktualizacja statusu użytkownika
      const updateUserStatus = async () => {
        try {
          const userType = user.publicMetadata?.role || 'STUDENT';
          await axios.post('/api/users/status', {
            userId: user.id,
            userType,
            isOnline: true
          });
          console.log("Status użytkownika zaktualizowany na online");
        } catch (err) {
          console.error("Błąd aktualizacji statusu:", err);
        }
      };

      updateUserStatus();

      // Obsługa wiadomości prywatnych
      const privateChannelName = `private-user-${user.id}`;
      console.log("Subskrypcja kanału prywatnego:", privateChannelName);
      
      const privateChannel = pusherRef.current.subscribe(privateChannelName);
      
      privateChannel.bind('new-message', (data) => {
        console.log("Nowa wiadomość:", data);
        setArrivalMessage({
          sender: data.senderId,
          content: data.text,
          createdAt: new Date()
        });
      });

      // Obsługa błędów Pusher
      pusherRef.current.connection.bind('error', (err) => {
        console.error("Błąd połączenia Pusher:", err);
      });

      // Czyszczenie przy odmontowaniu komponentu
      return () => {
        if (pusherRef.current) {
          console.log("Odłączanie Pusher...");
          pusherRef.current.unsubscribe('presence-users');
          pusherRef.current.unsubscribe(`private-user-${user.id}`);
          pusherRef.current.disconnect();
          pusherRef.current = null;
          
          // Aktualizacja statusu offline
          const userType = user.publicMetadata?.role || 'STUDENT';
          axios.post('/api/users/status', {
            userId: user.id,
            userType,
            isOnline: false
          }).catch(err => console.error("Błąd aktualizacji statusu offline:", err));
        }
      };
    }
  }, [user]);

  // Pobranie konwersacji
  const fetchConversations = async () => {
    if (!user?.id) return;

    try {
      const res = await axios.get('/api/conversations');
      console.log("Pobrane konwersacje:", res.data);

      if (Array.isArray(res.data)) {
        const formattedConversations = res.data.map(conv => ({
          ...conv,
          _id: conv.id?.toString(),
          members: Array.isArray(conv.members) ? conv.members : [user.id, conv.userId]
        }));
        setConversations(formattedConversations);
      }
    } catch (err) {
      console.error("Błąd pobierania konwersacji:", err);
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  // Obsługa nowych wiadomości
  useEffect(() => {
    if (arrivalMessage && currentChat?.members?.some(m => 
      m.memberId === arrivalMessage.sender || m === arrivalMessage.sender
    )) {
      setMessages(prev => [...(Array.isArray(prev) ? prev : []), arrivalMessage]);
    }
  }, [arrivalMessage, currentChat]);

  // Pobieranie wiadomości po wybraniu konwersacji
  useEffect(() => {
    const getMessages = async () => {
      if (!currentChat?._id) return;
  
      try {
        const res = await axios.get(`/api/messages?conversationId=${currentChat._id}`);
        setMessages(res.data);
      } catch (err) {
        console.error("Błąd pobierania wiadomości:", err);
        setMessages([]);
      }
    };
  
    if (currentChat) {
      getMessages();
    }
  }, [currentChat]);

  // Automatyczne przewijanie do najnowszej wiadomości
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Wysyłanie wiadomości
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChat?._id || !user?.id) {
      console.error("Brak wymaganych danych do wysłania wiadomości");
      return;
    }
  
    // Dane wiadomości
    const messageData = {
      content: newMessage,
      conversationId: currentChat._id, // lub currentChat.id
    };
  
    try {
      // Zapisanie wiadomości przez API
      const res = await axios.post("/api/messages", messageData);
      console.log("Odpowiedź po wysłaniu wiadomości:", res.data);
  
      // Aktualizacja interfejsu
      setMessages(prev => [...prev, res.data]);
      setNewMessage("");
  
      // Znalezienie odbiorcy
      const receiverMember = currentChat.members.find(m => 
        typeof m === 'object' ? m.memberId !== user.id : m !== user.id
      );
      
      if (receiverMember) {
        const receiverId = typeof receiverMember === 'object' ? 
          receiverMember.memberId : receiverMember;
          
        // Wysłanie powiadomienia przez Pusher
        await axios.post('/api/pusher', {
          channel: `private-user-${receiverId}`,
          event: 'new-message',
          data: {
            senderId: user.id,
            text: newMessage,
            conversationId: currentChat._id
          }
        });
        
        console.log("Powiadomienie o wiadomości wysłane przez Pusher");
      } else {
        console.warn("Nie znaleziono odbiorcy w konwersacji");
      }
    } catch (err) {
      console.error("Błąd wysyłania wiadomości:", err);
    }
  };

  // Tworzenie nowej konwersacji
  const handleNewConversation = async (receiverId, userRole) => {
    if (!user?.id) {
      console.error("ID użytkownika nie jest dostępne");
      return;
    }

    // Rola aktualnego użytkownika z Clerk metadata
    const currentUserRole = user.publicMetadata?.role || 'ADMIN';
  
    try {
      console.log('Tworzenie nowej konwersacji z:', { receiverId, userRole });
      const res = await axios.post("/api/conversations", {
        receiverId,
        userType: currentUserRole.toUpperCase(),
        receiverType: userRole.toUpperCase()
      });
  
      if (res.data) {
        const newConversation = {
          ...res.data,
          id: res.data.id,
          _id: res.data.id,
          members: res.data.members
        };
  
        setConversations(prev => {
          const exists = prev.some(conv => conv.id === newConversation.id);
          return exists ? prev : [...prev, newConversation];
        });
        setCurrentChat(newConversation);
      }
    } catch (err) {
      console.error("Błąd tworzenia nowej konwersacji:", err);
    }
  };

  // Sprawdzenie czy użytkownik jest online
  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  return (
    <div className="messenger">
      <div className="chatMenu">
        <div className="chatMenuWrapper">
          <SearchCreateConversation 
            onConversationCreated={handleNewConversation} 
            currentChat={currentChat}/>
          <div className="conversations-wrapper">
            {isLoading ? (
              <div className="loading-indicator">{t.common?.loading || "Loading..."}</div>
            ) : Array.isArray(conversations) && conversations.length > 0 ? (
              conversations.map((c) => (
                <Conversation 
                  key={c._id || c.id} 
                  conversation={c} 
                  currentUser={user}
                  setCurrentChat={setCurrentChat}
                  currentChat={currentChat}
                  isUserOnline={isUserOnline}
                />
              ))
            ) : (
              <div className="no-conversations">{t.messages?.noConversations || "No conversations yet"}</div>
            )}
          </div>
        </div>
      </div>
      
      <div className="chatBox">
        <div className="chatBoxWrapper">
          {currentChat ? (
            <>
              <div className="chatBoxTop">
                <div className="chatBoxHeader">
                  <img
                    src="/noAvatar.png"
                    alt="avatar"
                    className="currentChatAvatar"
                  />
                  <span className="currentChatName">
                    {currentChat.userData?.username || currentChat.userData?.name || t.messages?.chat || "Chat"}
                  </span>
                </div>
                <div className="messagesContainer">
                  {Array.isArray(messages) && messages.length > 0 ? (
                    messages.map((m) => (
                      <div key={m._id || m.id || Math.random().toString(36).substr(2, 9)} ref={scrollRef}>
                        <Message message={m} own={m.sender === user?.id} />
                      </div>
                    ))
                  ) : (
                    <div className="no-messages">{t.messages?.startConversation || "Start a conversation..."}</div>
                  )}
                </div>
              </div>
              <div className="chatBoxBottom">
                <textarea
                  className="chatMessageInput"
                  placeholder={t.messages?.placeholder || "Type your message..."}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                ></textarea>
                <button className="chatSubmitButton" onClick={handleSubmit}>
                  {t.messages?.send || "Send"}
                </button>
              </div>
            </>
          ) : (
            <span className="noConversationText">
              {t.messages?.searchToChat || "Open a conversation to start chatting"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}