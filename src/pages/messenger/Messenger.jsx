"use client";

import "./page.css";
import Conversation from "@/components/conversations/page";
import Message from "@/components/message/page";
import SearchCreateConversation from "@/components/searchCreateConversation/page";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useUser } from "@clerk/clerk-react";

export default function Messenger() {
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const socket = useRef();
  const { user } = useUser();
  const scrollRef = useRef();

  // Inicjalizacja Socket.IO
  useEffect(() => {
    if (!socket.current && user?.id) {
      socket.current = io("http://localhost:8900", {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        withCredentials: true
      });

      socket.current.on("connect", () => {
        console.log("Socket connected successfully");
      });

      socket.current.on("getMessage", (data) => {
        setArrivalMessage({
          senderId: data.senderId,
          content: data.text,
          createdAt: new Date(),
        });
      });

      socket.current.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      return () => {
        if (socket.current) {
          console.log("Disconnecting socket");
          socket.current.disconnect();
        }
      };
    }
  }, [user]);

  // Dodawanie użytkownika do Socket.IO po połączeniu
  useEffect(() => {
    if (user?.id && socket.current?.connected) {
      socket.current.emit("addUser", user.id);
      console.log("Added user to socket:", user.id);
    }
  }, [user, socket.current?.connected]);

  // Obsługa nowych wiadomości przychodzących przez Socket.IO
  useEffect(() => {
    if (arrivalMessage && currentChat?.members?.some(m => m.memberId === arrivalMessage.senderId)) {
      setMessages(prev => [...prev, arrivalMessage]);
    }
  }, [arrivalMessage, currentChat]);

  // Pobieranie konwersacji
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user?.id) return;

      try {
        const res = await axios.get('/api/conversations');
        console.log("Fetched conversations:", res.data);

        if (Array.isArray(res.data)) {
          const formattedConversations = res.data.map(conv => ({
            ...conv,
            id: conv.id,
            _id: conv.id
          }));
          setConversations(formattedConversations);
        }
      } catch (err) {
        console.error("Error fetching conversations:", err);
        setConversations([]);
      }
    };

    fetchConversations();
  }, [user]);

  // Pobieranie wiadomości dla aktualnej konwersacji
  useEffect(() => {
    const getMessages = async () => {
      if (!currentChat?.id) return;

      try {
        const res = await axios.get(`/api/messages?conversationId=${currentChat.id}`);
        setMessages(res.data);
      } catch (err) {
        console.error("Error fetching messages:", err);
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
    if (!newMessage.trim() || !currentChat?.id || !user?.id) {
      return;
    }

    const messageData = {
      content: newMessage,
      conversationId: currentChat.id
    };

    try {
      const res = await axios.post("/api/messages", messageData);
      setMessages(prev => [...prev, res.data]);
      setNewMessage("");

      // Wysyłanie przez Socket.IO
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

  return (
    <div className="messenger">
      <div className="chatMenu">
        <div className="chatMenuWrapper">
          <SearchCreateConversation 
            onConversationCreated={(receiverId, receiverType) => {
              // Tutaj dodaj logikę tworzenia nowej konwersacji
            }}
            currentChat={currentChat}
          />
          <div className="conversations-wrapper">
            {conversations.map((c) => (
              <Conversation 
                key={c.id}
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
                    <div key={m.id} ref={scrollRef}>
                      <Message 
                        message={m} 
                        own={m.senderId === user?.id}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="chatBoxBottom">
                <textarea
                  className="chatMessageInput"
                  placeholder="Write your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <button className="chatSubmitButton" onClick={handleSubmit}>
                  Send
                </button>
              </div>
            </>
          ) : (
            <span className="noConversationText">
              Select a conversation to start chatting.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}