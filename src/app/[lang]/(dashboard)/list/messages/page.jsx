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

  useEffect(() => {
    if (!socket.current && user?.id) {
        try {
            socket.current = io("http://localhost:8900", {
                path: "/socket.io/",
                transports: ['polling', 'websocket'],
                autoConnect: true,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                timeout: 60000,
                withCredentials: true
            });

            socket.current.on("connect", () => {
                console.log("Socket connected with ID:", socket.current.id);
                socket.current.emit("addUser", user.id);
            });

            socket.current.on("getMessage", (data) => {
                console.log("Received message:", data);
                setArrivalMessage({
                    sender: data.senderId,
                    content: data.text,
                    createdAt: new Date()
                });
            });

            socket.current.io.on("error", (error) => {
                console.error("Socket Error:", error);
            });

            socket.current.io.on("reconnect", (attempt) => {
                console.log("Socket Reconnected after", attempt, "attempts");
                socket.current.emit("addUser", user.id);
            });

            socket.current.io.on("reconnect_attempt", (attempt) => {
                console.log("Reconnection attempt:", attempt);
            });

            socket.current.io.on("reconnect_error", (error) => {
                console.error("Reconnection error:", error);
            });

        } catch (err) {
            console.error("Socket initialization error:", err);
        }

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
      const res = await axios.get('/api/conversations');  // ZMIENIONA LINIA
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
    if (arrivalMessage && currentChat?.members?.includes(arrivalMessage.sender)) {
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

  // W komponencie Messenger, zaktualizuj handleSubmit:
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChat?._id || !user?.id) {
        console.error("Missing required data for sending message");
        return;
    }
  
    // Zmiana formatu messageData
    const messageData = {
        content: newMessage,
        conversationId: currentChat._id, // lub currentChat.id
    };
  
    try {
        const res = await axios.post("/api/messages", messageData);
        console.log("Message response:", res.data);
  
        setMessages(prev => [...prev, res.data]);
        setNewMessage("");
  
        if (socket.current) {
            const receiverMember = currentChat.members.find(m => m.memberId !== user.id);
            if (receiverMember) {
                socket.current.emit("sendMessage", {
                    senderId: user.id,
                    receiverId: receiverMember.memberId,
                    text: newMessage,
                });
            }
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

  return (
    <div className="messenger">
      <div className="chatMenu">
        <div className="chatMenuWrapper">
          <SearchCreateConversation 
            onConversationCreated={handleNewConversation} 
            currentChat={currentChat}/>
          <div className="conversations-wrapper">
            {Array.isArray(conversations) && conversations.map((c) => (
              <Conversation 
                key={c._id} 
                conversation={c} 
                currentUser={user}
                setCurrentChat={setCurrentChat}
                currentChat={currentChat}
              />
            ))}
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
                    {currentChat.userData?.username || "Chat"}
                  </span>
                </div>
                <div className="messagesContainer">
                  {messages.map((m) => (
                    <div key={m._id || Math.random()} ref={scrollRef}>
                      <Message message={m} own={m.sender === user?.id} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="chatBoxBottom">
                <textarea
                  className="chatMessageInput"
                  placeholder={t.messages.placeholder}
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
                  {t.messages.send}
                </button>
              </div>
            </>
          ) : (
            <span className="noConversationText">
              {t.messages.searchToChat}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}