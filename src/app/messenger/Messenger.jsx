"use client";

import "./page.css";
import Conversation from "@/components/conversations/page";
import Message from "@/components/message/page";
import SearchCreateConversation from "@/components/searchCreateConversation/page";
import { useEffect, useState, useRef } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { useParams } from "next/navigation";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { usePusher } from "@/context/PusherContext";

export default function Messenger() {
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const { user } = useUser();
  const { isUserOnline, sendMessage } = usePusher();
  const scrollRef = useRef();
  const t = useTranslations();
  const params = useParams();
  const lang = params?.lang || 'pl';

  // Pobieranie konwersacji
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

  // Pobieranie konwersacji przy montowaniu komponentu
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
        console.log("Pobieranie wiadomości dla konwersacji:", currentChat._id);
        const res = await axios.get(`/api/messages?conversationId=${currentChat._id}`);
        console.log("Pobrane wiadomości:", res.data);
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

  // Przewijanie do najnowszej wiadomości
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
  
    try {
      // Znajdź odbiorcę wiadomości
      const receiverMember = currentChat.members.find(m => 
        typeof m === 'object' ? m.memberId !== user.id : m !== user.id
      );
      
      if (!receiverMember) {
        console.warn("Nie znaleziono odbiorcy w konwersacji");
        return;
      }
      
      const receiverId = typeof receiverMember === 'object' ? 
        receiverMember.memberId : receiverMember;
      
      // Wysyłanie wiadomości poprzez PusherContext
      await sendMessage(receiverId, newMessage, currentChat._id);
      
      // Pobierz zaktualizowane wiadomości
      const res = await axios.get(`/api/messages?conversationId=${currentChat._id}`);
      setMessages(res.data);
      
      // Wyczyść pole wiadomości
      setNewMessage("");
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

    // Pobierz rolę aktualnego użytkownika z Clerk metadata
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
                    messages.map((message, index) => {
                      // Sprawdzanie czy wiadomość jest od tego samego nadawcy co poprzednia
                      const isPreviousSameSender = index > 0 && 
                        messages[index - 1].senderId === message.senderId;
                      
                      // Dodajemy klasę 'consecutive' jeśli to kolejna wiadomość od tego samego nadawcy
                      const consecutiveClass = isPreviousSameSender ? 'consecutive' : '';
                      
                      // Sprawdzamy czy wiadomość jest własna
                      const isOwnMessage = message.senderId === user?.id;
                      
                      return (
                        <div 
                          key={message._id || message.id || Math.random().toString(36).substr(2, 9)} 
                          className={consecutiveClass}
                          ref={index === messages.length - 1 ? scrollRef : null}
                        >
                          <Message 
                            message={message} 
                            own={isOwnMessage} 
                          />
                        </div>
                      );
                    })
                  ) : (
                    <div className="no-messages">
                      {t.messages?.startConversation || "Start a conversation..."}
                    </div>
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