"use client";
import { format } from "timeago.js";
import "./page.css";

export default function Message({ message, own }) {
  if (!message) return null;

  // Debug log
  console.log("Message data:", message);

  return (
    <div className={own ? "message own" : "message"}>
      <div className="messageTop">
        {!own && (
          <img
            className="messageImg"
            src="/noAvatar.png"
            alt=""
          />
        )}
        <div className="messageContent">
          <p className="messageText">
            {message.content || message.text || "No content"}
          </p>
          <span className="messageBottom">
            {message.createdAt ? format(message.createdAt) : "just now"}
          </span>
        </div>
        {own && (
          <img
            className="messageImg"
            src="/noAvatar.png"
            alt=""
          />
        )}
      </div>
    </div>
  );
}