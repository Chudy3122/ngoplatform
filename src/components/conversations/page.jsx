// page.jsx
"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { io } from "socket.io-client";
import "./page.css";
import { useTranslations } from "@/hooks/useTranslations";

export default function Conversation({ conversation, currentUser, setCurrentChat, currentChat }) {
  const [user, setUser] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const socket = useRef(null);
  const params = useParams();
  const lang = params?.lang || 'pl';  // Usunięto type assertion
  const t = useTranslations();

  useEffect(() => {
    socket.current = io("http://localhost:8900");
    
    socket.current.on("userStatusUpdate", (data) => {
      const otherMember = conversation.members.find(
        m => m.memberId !== currentUser?.id
      );
      
      if (otherMember && data.userId === otherMember.memberId) {
        setIsOnline(data.isOnline);
      }
    });

    return () => {
      socket.current?.disconnect();
    };
  }, [conversation, currentUser]);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const otherMember = conversation.members.find(
          m => m.memberId !== currentUser?.id
        );
        
        if (!otherMember) {
          console.log("No other member found in conversation");
          return;
        }
  
        const res = await axios.get('/api/users/status', {
          params: {
            userId: otherMember.memberId,
            userType: otherMember.memberType
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