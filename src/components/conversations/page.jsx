// src/components/conversations/page.jsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import "./page.css";
import { useTranslations } from "@/hooks/useTranslations";

export default function Conversation({ 
  conversation, 
  currentUser, 
  setCurrentChat, 
  currentChat,
  isUserOnline // Nowa props z funkcją sprawdzającą status
}) {
  const [user, setUser] = useState(null);
  const params = useParams();
  const lang = params?.lang || 'pl';
  const t = useTranslations();

  // Pobieranie danych użytkownika
  useEffect(() => {
    const getUserData = async () => {
      try {
        const otherMember = conversation.members.find(m => 
          typeof m === 'object' 
            ? m.memberId !== currentUser?.id 
            : m !== currentUser?.id
        );
        
        if (!otherMember) {
          console.log("Nie znaleziono drugiego użytkownika w konwersacji");
          return;
        }
  
        const userId = typeof otherMember === 'object' ? otherMember.memberId : otherMember;
        const userType = typeof otherMember === 'object' ? otherMember.memberType : 'STUDENT';
  
        const res = await axios.get('/api/users/status', {
          params: {
            userId: userId,
            userType: userType
          }
        });
        
        if (res.data) {
          setUser(res.data);
        }
      } catch (err) {
        console.error("Błąd pobierania danych użytkownika:", err);
        setUser({ username: t.messages?.unknownUser || "Unknown User" });
      }
    };
  
    if (conversation?.members && currentUser?.id) {
      getUserData();
    }
  }, [conversation, currentUser]);

  // Funkcja zwracająca nazwę użytkownika
  const getDisplayName = () => {
    if (!user) return t.messages?.loading || "Loading...";
    if (user.username === 'admin') return t.messages?.administrator || "Administrator";
    return user.name || user.username || t.messages?.unknownUser || "Unknown User";
  };

  // Sprawdzenie, czy użytkownik jest online
  const checkOnlineStatus = () => {
    if (!user) return false;
    
    // Jeśli przekazano funkcję isUserOnline, używamy jej
    if (isUserOnline && typeof isUserOnline === 'function') {
      const userId = typeof user === 'object' && user.id ? user.id : 
                     typeof user === 'string' ? user : null;
      
      if (userId) {
        return isUserOnline(userId);
      }
    }
    
    // Fallback do statusu z API
    return user.isOnline || false;
  };

  // Status online
  const online = checkOnlineStatus();

  return (
    <div 
      className={`conversation-item ${currentChat?.id === conversation.id ? 'active' : ''}`}
      onClick={() => setCurrentChat({...conversation, userData: user})}
    >
      <img
        className="user-avatar"
        src="/noAvatar.png"
        alt={t.common?.avatar || "avatar"}
      />
      <div className="conversation-info">
        <span className="username">{getDisplayName()}</span>
        <div className="status-wrapper">
          <div 
            className={`status-indicator ${online ? 'online' : 'offline'}`} 
            title={online ? t.messages?.online : t.messages?.offline}
          />
          <span className="status-text">
            {online ? t.messages?.online : t.messages?.offline}
          </span>
        </div>
      </div>
    </div>
  );
}