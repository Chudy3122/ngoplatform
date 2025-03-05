"use client";
import { format } from "timeago.js";
import "./page.css";

export default function Message({ message, own }) {
  if (!message) return null;

  // Pobierz zawartość wiadomości i czas utworzenia
  const content = message.content || message.text || "No content";
  const createdAt = message.createdAt ? format(message.createdAt) : "just now";
  
  return (
    <div className={own ? "message own" : "message"}>
      <div className="messageTop">
        {!own && (
          <img
            className="messageImg"
            src="/noAvatar.png"
            alt="avatar"
          />
        )}
        <div className="messageContent">
          <p className="messageText">{content}</p>
          <span className="messageBottom">{createdAt}</span>
          
          {/* Status wiadomości dla własnych wiadomości */}
          {own && message.status && (
            <span className={`messageStatus ${message.status.toLowerCase()}`}>
              {message.status === 'SENT' && '✓'}
              {message.status === 'DELIVERED' && '✓✓'}
              {message.status === 'READ' && '✓✓'}
            </span>
          )}
        </div>
        {own && (
          <img
            className="messageImg"
            src="/noAvatar.png"
            alt="avatar"
          />
        )}
      </div>
    </div>
  );
}