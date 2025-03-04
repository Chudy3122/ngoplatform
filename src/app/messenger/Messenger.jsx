"use client";

import "./page.css";
import Conversation from "@/components/conversations/page";
import Message from "@/components/message/page";
import SearchCreateConversation from "@/components/searchCreateConversation/page";
import { useEffect, useState, useRef } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { useParams } from "next/navigation";
import axios from "axios";
import { io } from "socket.io-client";
import { useUser } from "@clerk/clerk-react";

export default function Messenger() {
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const { user } = useUser();
  const scrollRef = useRef();
  const socket = useRef();
  const t = useTranslations();
  const params = useParams();
  const lang = params?.lang || 'pl';

  // Inicjalizacja Socket.IO
  useEffect(() => {
    if (!socket.current && user?.id) {
      const initializeSocket = async () => {
        try {
          // Inicjalizacja API Socket.IO
          const response = await fetch('/api/socket');
          if (!response.ok) {
            throw new Error(`Socket API responded with status: ${response.status}`);
          }
          
          // Tworzenie instancji Socket.IO
          socket.current = io({
            path: '/api/socket',
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            randomizationFactor: 0.5,
            timeout: 20000,
            // Ustawienie pollingu jako pierwszego transportu dla lepszej kompatybilności z Vercel
            transports: ['polling', 'websocket']
          });

          socket.current.on("connect", () => {
            console.log("Socket connected with ID:", socket.current.id);
            // Określ typ użytkownika na podstawie publicMetadata.role
            const userType = user.publicMetadata?.role || 'STUDENT';
            socket.current.emit("addUser", { 
              userId: user.id, 
              userType 
            });
          });

          socket.current.on("connect_error", (error) => {
            console.error("Connection error:", error);
            // Spróbuj przełączyć na polling, jeśli wystąpił błąd z WebSocket
            if (socket.current.io.engine.transport.name === 'websocket') {
              console.log("Falling back to polling transport");
              socket.current.io.engine.transport.once('open', () => {
                console.log("Polling transport connected");
              });
            }
          });

          socket.current.on("getMessage", (data) => {
            console.log("Received message:", data);
            setArrivalMessage({
              sender: data.senderId,
              content: data.text,
              createdAt: new Date()
            });
          });

          socket.current.on("error", (error) => {
            console.error("Socket Error:", error);
          });

          socket.current.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason);
          });

          socket.current.on("reconnect", (attempt) => {
            console.log("Socket Reconnected after", attempt, "attempts");
            const userType = user.publicMetadata?.role || 'STUDENT';
            socket.current.emit("addUser", { 
              userId: user.id, 
              userType 
            });
          });

          socket.current.on("reconnect_attempt", (attempt) => {
            console.log("Reconnection attempt:", attempt);
          });

          socket.current.on("reconnect_error", (error) => {
            console.error("Reconnection error:", error);
          });

        } catch (err) {
          console.error("Socket initialization error:", err);
        }
      };

      initializeSocket();

      return () => {
        if (socket.current) {
          socket.current.disconnect();
        }
      };
    }
  }, [user]);

  const fetchConversations = async () => {
    if (!user?.id) return;

    try {
      const res = await axios.get('/api/conversations');
      console.log("Fetched conversations:", res.data);

      if (Array.isArray(res.data)) {
        const formattedConversations = res.data.map(conv => ({
          ...conv,
          _id: conv.id?.toString(),
          members: Array.isArray(conv.members) ? conv.members : [user.id, conv.userId]
        }));
        setConversations(formattedConversations);
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  useEffect(() => {
    if (arrivalMessage && currentChat?.members?.some(m => 
      m.memberId === arrivalMessage.sender || m === arrivalMessage.sender
    )) {
      setMessages(prev => [...(Array.isArray(prev) ? prev : []), arrivalMessage]);
    }
  }, [arrivalMessage, currentChat]);

  useEffect(() => {
    const getMessages = async () => {
      if (!currentChat?._id) return;
  
      try {
        const res = await axios.get(`/api/messages?conversationId=${currentChat._id}`);
        setMessages(res.data);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setMessages([]);
      }
    };
  
    if (currentChat) {
      getMessages();
    }
  }, [currentChat]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChat?._id || !user?.id) {
      console.error("Missing required data for sending message");
      return;
    }
  
    // Struktura messageData
    const messageData = {
      content: newMessage,
      conversationId: currentChat._id, // lub currentChat.id
    };
  
    try {
      const res = await axios.post("/api/messages", messageData);
      console.log("Message response:", res.data);
  
      setMessages(prev => [...prev, res.data]);
      setNewMessage("");
  
      if (socket.current && socket.current.connected) {
        const receiverMember = currentChat.members.find(m => 
          typeof m === 'object' ? m.memberId !== user.id : m !== user.id
        );
        
        if (receiverMember) {
          const receiverId = typeof receiverMember === 'object' ? 
            receiverMember.memberId : receiverMember;
            
          socket.current.emit("sendMessage", {
            senderId: user.id,
            receiverId: receiverId,
            text: newMessage,
          });
          console.log("Emitted sendMessage event to socket");
        } else {
          console.warn("No receiver found in conversation");
        }
      } else {
        console.warn("Socket not connected, message sent via API only");
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleNewConversation = async (receiverId, userRole) => {
    if (!user?.id) {
      console.error("User ID is not available");
      return;
    }

    // Pobierz rolę aktualnego użytkownika z Clerk metadata
    const currentUserRole = user.publicMetadata?.role || 'ADMIN';
  
    try {
      console.log('Creating new conversation with:', { receiverId, userRole });
      const res = await axios.post("/api/conversations", {
        receiverId,
        userType: currentUserRole.toUpperCase(),  // Rola z Clerk
        receiverType: userRole.toUpperCase() // Rola wybranego użytkownika
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
      console.error("Error creating new conversation:", err);
    }
  };

  // Funkcja do sprawdzenia, czy użytkownik jest online
  const checkUserOnlineStatus = (memberId) => {
    // Tu możemy dodać logikę sprawdzającą status użytkownika
    // na podstawie danych z socket.io
    return false; // Domyślnie zwracamy false
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