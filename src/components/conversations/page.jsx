"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import "./page.css";
import { useTranslations } from "@/hooks/useTranslations";

export default function Conversation({ conversation, currentUser, setCurrentChat, currentChat }) {
  const [user, setUser] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const params = useParams();
  const lang = params?.lang || 'pl';
  const t = useTranslations();

  // Zdarzenia dotyczące statusu użytkownika będą obsługiwane przez główny komponent Messenger
  useEffect(() => {
    const getUserData = async () => {
      try {
        const otherMember = conversation.members.find(m => 
          typeof m === 'object' 
            ? m.memberId !== currentUser?.id 
            : m !== currentUser?.id
        );
        
        if (!otherMember) {
          console.log("No other member found in conversation");
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
          setIsOnline(res.data.isOnline);
        }
      } catch (err) {
        console.error("Error getting user data:", err);
        setUser({ username: t.messages?.unknownUser || "Unknown User" });
      }
    };
  
    if (conversation?.members && currentUser?.id) {
      getUserData();
    }
  }, [conversation, currentUser]);

  const getDisplayName = () => {
    if (!user) return t.messages?.loading || "Loading...";
    if (user.username === 'admin') return t.messages?.administrator || "Administrator";
    return user.name || user.username || t.messages?.unknownUser || "Unknown User";
  };

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
            className={`status-indicator ${isOnline ? 'online' : 'offline'}`} 
            title={isOnline ? t.messages?.online : t.messages?.offline}
          />
          <span className="status-text">
            {isOnline ? t.messages?.online : t.messages?.offline}
          </span>
        </div>
      </div>
    </div>
  );
}